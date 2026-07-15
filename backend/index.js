require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue, set, get, push, query, orderByChild, startAt } = require('firebase/database');
const Groq = require('groq-sdk');
const cron = require('node-cron');
const axios = require('axios');
const admin = require('firebase-admin');
const fs = require('fs');
const express = require('express');
const { PDFParse } = require('pdf-parse');

// Initialize Firebase Admin for FCM
let fcmEnabled = false;
if (fs.existsSync('./serviceAccountKey.json')) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  fcmEnabled = true;
  console.log('Firebase Admin initialized for FCM.');
} else {
  console.warn('Firebase Admin (FCM) NOT initialized: serviceAccountKey.json not found. Notifications will be skipped.');
}

// Notification Helper
async function sendNotification(fcmToken, title, body) {
  if (!fcmEnabled || !fcmToken) {
    console.log(`[Notification Skipped] To: ${fcmToken} | Title: ${title}`);
    return;
  }
  try {
    const message = { notification: { title, body }, token: fcmToken };
    const response = await admin.messaging().send(message);
    console.log('Successfully sent FCM message:', response);
  } catch (error) {
    console.error('Error sending FCM message:', error);
  }
}

// LocationIQ Hospital Helper
async function getNearbyHospitals(lat, lon) {
  const apiKey = process.env.LOCATIONIQ_API_KEY;
  if (!apiKey) {
    console.warn('LOCATIONIQ_API_KEY is not set. Skipping hospital search.');
    return [];
  }
  try {
    const url = `https://us1.locationiq.com/v1/nearby?key=${apiKey}&lat=${lat}&lon=${lon}&tag=hospital&radius=10000&format=json`;
    const response = await axios.get(url);
    if (response.data && response.data.length > 0) {
      return response.data.slice(0, 3).map(h => ({
        name: h.name || 'Unknown Hospital',
        distance: h.distance ? `${Math.round(h.distance)}m` : 'Unknown distance'
      }));
    }
  } catch (err) {
    console.error('Error fetching nearby hospitals from LocationIQ:', err.message);
  }
  return [];
}


// Express Server Setup
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.status(200).send('Fitcheck AI Service is running.\n');
});

// POST endpoint for PDF report upload and text extraction
app.post('/api/upload-report', async (req, res) => {
  const { base64Pdf, fileName, uid } = req.body;
  if (!base64Pdf) {
    return res.status(400).json({ error: 'No file data received' });
  }
  const userUid = uid || 'global';
  try {
    console.log(`[PDF Upload] Processing file: ${fileName || 'Unnamed'} for UID: ${userUid}`);
    const buffer = Buffer.from(base64Pdf, 'base64');
    const uint8Array = new Uint8Array(buffer);
    const parser = new PDFParse(uint8Array);
    const parsedData = await parser.getText();
    const extractedText = parsedData.text;

    // Save to Firebase Realtime Database nested under user's UID
    const reportRef = ref(db, `users/${userUid}/extracted_reports`);
    const newReportRef = push(reportRef);
    await set(newReportRef, {
      fileName: fileName || 'Report.pdf',
      text: extractedText,
      timestamp: new Date().toISOString()
    });

    console.log(`[PDF Upload] Successfully extracted text and saved to DB for UID ${userUid}. Length: ${extractedText.length} characters.`);
    res.status(200).json({ success: true, length: extractedText.length });
  } catch (err) {
    console.error('[PDF Upload] Error extracting text:', err);
    res.status(500).json({ error: 'Failed to extract text from PDF: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

// 1. Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBLdEB43paTY-KoElImBaX5NSK9Qlef_U",
  authDomain: "in-1-health-check.firebaseapp.com",
  databaseURL: "https://in-1-health-check-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "in-1-health-check",
  storageBucket: "in-1-health-check.firebasestorage.app",
  appId: "1:805963694011:android:30dcc5640fe9e5e3844e9e"
};

// Initialize Firebase
console.log('Connecting to Firebase Realtime Database at:', firebaseConfig.databaseURL);
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// 2. Initialize Groq AI Client
const groqApiKey = process.env.GROZ_API_KEY;
if (!groqApiKey) {
  console.error('CRITICAL ERROR: GROZ_API_KEY is not defined in .env file!');
  process.exit(1);
}
console.log('Initializing Groq SDK...');
const groq = new Groq({ apiKey: groqApiKey });

// 3. Buffer State
let readingsBuffer = [];
let lastBufferedReading = null;
let isProcessing = false;

const healthRecordsRef = ref(db, 'health_records');

// Live listener: Buffers new vital signs, ignores duplicate triggers from backend write-backs
onValue(healthRecordsRef, (snapshot) => {
  const record = snapshot.val();
  if (!record) return;

  const { heartRate, bodyTemperature, perfusionIndex, timestamp } = record;
  const rawSpo2 = record.sp02 !== undefined ? record.sp02 : record.spo2;

  if (
    heartRate === undefined || heartRate === null ||
    bodyTemperature === undefined || bodyTemperature === null ||
    rawSpo2 === undefined || rawSpo2 === null ||
    perfusionIndex === undefined || perfusionIndex === null
  ) {
    return;
  }

  // Check if raw vitals are identical to the last buffered reading to prevent buffering self-updates
  if (
    lastBufferedReading &&
    lastBufferedReading.heartRate === heartRate &&
    lastBufferedReading.bodyTemperature === bodyTemperature &&
    lastBufferedReading.spo2 === rawSpo2 &&
    lastBufferedReading.perfusionIndex === perfusionIndex
  ) {
    return;
  }

  const newReading = {
    heartRate,
    bodyTemperature,
    spo2: rawSpo2,
    perfusionIndex,
    timestamp: timestamp || new Date().toISOString()
  };

  readingsBuffer.push(newReading);
  lastBufferedReading = newReading;
  console.log(`[Vitals Buffered] HR: ${heartRate} BPM | Temp: ${bodyTemperature}°C | SpO2: ${rawSpo2}% | PI: ${perfusionIndex}%`);
});

// 4. Interval Evaluator: Runs every 10 seconds
setInterval(async () => {
  if (isProcessing) return;

  // If no new readings arrived in the last 10 seconds, exit early to save token quota
  if (readingsBuffer.length === 0) {
    return;
  }

  isProcessing = true;
  const currentReadings = [...readingsBuffer];
  readingsBuffer = []; // Clear the buffer for the next 10 seconds

  console.log(`\n--- 10-Second Interval AI Assessment (Total readings: ${currentReadings.length}) ---`);

  try {
    // 5. Fetch all users
    const usersRef = ref(db, 'users');
    const usersSnapshot = await get(usersRef);
    const users = usersSnapshot.val() || {};

    let uids = Object.keys(users);
    if (uids.length === 0) {
      uids = ['global']; // Fallback for backward compatibility
    }

    console.log(`[Multi-User Evaluation] Processing for users: [${uids.join(', ')}]`);

    // 6. Format readings list
    const formattedReadings = currentReadings.map((r, i) => 
      `Reading #${i+1} [${new Date(r.timestamp).toLocaleTimeString()}]: Heart Rate: ${r.heartRate} BPM, Temp: ${r.bodyTemperature}°C, SpO2: ${r.spo2}%, Perfusion Index: ${r.perfusionIndex}%`
    ).join('\n');

    console.log(`Raw vitals readings:\n${formattedReadings}`);

    // Loop through each user to perform user-specific clinical AI assessment
    for (const uid of uids) {
      console.log(`\n>> Evaluating AI Risk for UID: ${uid} <<`);
      
      const userNode = users[uid] || {};
      const profile = userNode.profile || {
        fullName: 'Anonymous User',
        age: '28',
        dob: 'Not set',
        bloodType: 'Not set',
        heightWeight: 'Not set',
        conditions: 'None reported',
        sex: 'Not set',
        smokingStatus: 'Non-smoker',
        activityLevel: 'Active',
        medications: 'None',
        pastHealthIssues: 'None'
      };

      // Extract latest medical report text if any exists
      let latestReportText = 'None uploaded';
      if (userNode.extracted_reports) {
        const reports = Object.values(userNode.extracted_reports);
        if (reports.length > 0) {
          // Sort by timestamp desc and take the latest
          reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          latestReportText = reports[0].text || 'None';
        }
      }

      // Request AI Completion
      console.log(`Requesting AI analysis for ${profile.fullName}...`);
      let healthRiskScore = 20;
      let riskLevel = 'Low';

      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an advanced medical diagnostic AI. Analyze a series of vital signs recorded over the last 10 seconds alongside the patient profile (including physical metrics, clinical conditions, medications, lifestyle, history, and uploaded PDF medical report text). Assess how these baseline factors interact with the current vitals. Look for fluctuations, stability, or clinical anomalies in this series. Calculate a single overall Health Risk Score (integer 0 to 100, where 0 is perfect health and 100 is critical danger) and determine the overall Risk Level (either "Low", "Moderate", or "High"). Return only a JSON object with keys "healthRiskScore" and "riskLevel". Do not include any formatting, markdown syntax, or extra text.'
            },
            {
              role: 'user',
              content: `Patient Profile:
Name: ${profile.fullName}
Age: ${profile.age}
Sex: ${profile.sex || 'Not set'}
Blood Type: ${profile.bloodType}
Height/Weight: ${profile.heightWeight}
Current Conditions: ${profile.conditions}
Past Health Issues: ${profile.pastHealthIssues || 'None'}
Active Medications: ${profile.medications || 'None'}
Smoking Status: ${profile.smokingStatus || 'Non-smoker'}
Activity Level: ${profile.activityLevel || 'Active'}

Latest Extracted Medical Report History:
${latestReportText}

10-Second Sensor Stream:
${formattedReadings}`
            }
          ],
          model: 'openai/gpt-oss-20b',
          temperature: 0.1,
          response_format: { type: 'json_object' }
        });

        const responseText = chatCompletion.choices[0].message.content;
        console.log(`AI Response for ${uid}:`, responseText);

        const result = JSON.parse(responseText);
        healthRiskScore = parseInt(result.healthRiskScore) || 20;
        riskLevel = result.riskLevel || 'Low';
      } catch (aiErr) {
        console.error(`AI Completion failed for ${uid}:`, aiErr.message);
      }

      console.log(`Assessed Results for ${uid} -> Risk Score: ${healthRiskScore}% | Level: ${riskLevel}`);

      // ----- Anomaly Detection & Alerts -----
      if (riskLevel === 'High') {
        const fcmToken = profile.fcmToken;
        const lat = profile.latitude;
        const lon = profile.longitude;
        
        let alertBody = `Critical Health Alert! Your Risk Score is ${healthRiskScore}%. Please seek medical attention.`;

        if (lat && lon) {
          const hospitals = await getNearbyHospitals(lat, lon);
          if (hospitals.length > 0) {
            const hospList = hospitals.map(h => `${h.name} (${h.distance})`).join(', ');
            alertBody += `\nNearby Hospitals: ${hospList}`;
            console.log(`[Anomaly Detected] Nearby hospitals found:`, hospitals);
          }
        }

        await sendNotification(fcmToken, 'Abnormal Vital Signs Detected', alertBody);
      }

      // Write findings back to Firebase under the user's specific path
      const latestReading = currentReadings[currentReadings.length - 1];
      const assessmentData = {
        bodyTemperature: latestReading.bodyTemperature,
        heartRate: latestReading.heartRate,
        spo2: latestReading.spo2,
        perfusionIndex: latestReading.perfusionIndex,
        healthRiskScore,
        riskLevel,
        timestamp: new Date().toISOString()
      };

      // 1. Update user's latest vitals (dashboard node)
      await set(ref(db, `users/${uid}/latest_vitals`), assessmentData);
      
      // 2. Append to user's history log
      await push(ref(db, `users/${uid}/history`), assessmentData);

      console.log(`Successfully updated profile & history for user UID: ${uid}`);
    }

    // Also update the global health_records node so the raw readings remain updated for hardware connection diagnostics
    const latestReading = currentReadings[currentReadings.length - 1];
    await set(ref(db, 'health_records'), {
      bodyTemperature: latestReading.bodyTemperature,
      heartRate: latestReading.heartRate,
      spo2: latestReading.spo2,
      sp02: latestReading.spo2, // Dual-write for physical hardware compatibility
      perfusionIndex: latestReading.perfusionIndex,
      timestamp: new Date().toISOString()
    });
    console.log('Successfully synchronized global health_records with latest sensor vitals.');

  } catch (err) {
    console.error('Error executing 10-second interval AI flow:', err);
  } finally {
    isProcessing = false;
  }
}, 10000);

// ----- Long-term Trend Monitoring (Daily Cron) -----
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily trend analysis cron job...');
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const threeDaysAgoISO = threeDaysAgo.toISOString();

    const historyRef = ref(db, 'history');
    const historyQuery = query(historyRef, orderByChild('timestamp'), startAt(threeDaysAgoISO));
    const snapshot = await get(historyQuery);
    
    if (snapshot.exists()) {
      const records = [];
      snapshot.forEach(child => {
        records.push(child.val());
      });

      const dailyStats = {};
      records.forEach(r => {
        if (!r.timestamp || !r.heartRate || !r.spo2) return;
        const date = r.timestamp.split('T')[0];
        if (!dailyStats[date]) {
          dailyStats[date] = { hrSum: 0, spo2Sum: 0, count: 0 };
        }
        dailyStats[date].hrSum += r.heartRate;
        dailyStats[date].spo2Sum += r.spo2;
        dailyStats[date].count += 1;
      });

      const days = Object.keys(dailyStats).sort();
      if (days.length >= 3) {
        let hrDecreasing = true;
        let spo2Decreasing = true;
        let prevHR = null;
        let prevSpO2 = null;

        for (const day of days) {
          const avgHR = dailyStats[day].hrSum / dailyStats[day].count;
          const avgSpO2 = dailyStats[day].spo2Sum / dailyStats[day].count;
          
          if (prevHR !== null && avgHR >= prevHR) hrDecreasing = false;
          if (prevSpO2 !== null && avgSpO2 >= prevSpO2) spo2Decreasing = false;
          
          prevHR = avgHR;
          prevSpO2 = avgSpO2;
        }

        if (hrDecreasing || spo2Decreasing) {
          console.log(`[Trend Alert] Gradual reduction detected! HR Decreasing: ${hrDecreasing}, SpO2 Decreasing: ${spo2Decreasing}`);
          
          const profileSnapshot = await get(ref(db, 'user_profile'));
          const profile = profileSnapshot.val();
          if (profile && profile.fcmToken) {
             const metric = hrDecreasing && spo2Decreasing ? 'Heart Rate and SpO2' : (hrDecreasing ? 'Heart Rate' : 'SpO2');
             await sendNotification(
               profile.fcmToken,
               'Gradual Vital Reduction Alert',
               `We noticed your ${metric} has been gradually reducing over the last few days. Please monitor your health closely and consult a doctor if necessary.`
             );
          }
        } else {
           console.log(`[Trend Analysis] No concerning gradual reduction patterns detected across ${days.length} days.`);
        }
      } else {
        console.log(`[Trend Analysis] Not enough daily data points to establish a 3-day trend (found ${days.length} days).`);
      }
    } else {
      console.log('[Trend Analysis] No history data found for the last 3 days.');
    }
  } catch (err) {
    console.error('Error running daily trend analysis:', err);
  }
});
