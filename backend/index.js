require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, onValue, set, get, push } = require('firebase/database');
const Groq = require('groq-sdk');

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
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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

  const { heartRate, bodyTemperature, spo2, perfusionIndex, timestamp } = record;
  if (!heartRate || !bodyTemperature || !spo2 || !perfusionIndex) {
    return;
  }

  // Check if raw vitals are identical to the last buffered reading to prevent buffering self-updates
  if (
    lastBufferedReading &&
    lastBufferedReading.heartRate === heartRate &&
    lastBufferedReading.bodyTemperature === bodyTemperature &&
    lastBufferedReading.spo2 === spo2 &&
    lastBufferedReading.perfusionIndex === perfusionIndex
  ) {
    return;
  }

  const newReading = {
    heartRate,
    bodyTemperature,
    spo2,
    perfusionIndex,
    timestamp: timestamp || new Date().toISOString()
  };

  readingsBuffer.push(newReading);
  lastBufferedReading = newReading;
  console.log(`[Vitals Buffered] HR: ${heartRate} BPM | Temp: ${bodyTemperature}°C | SpO2: ${spo2}% | PI: ${perfusionIndex}%`);
});

// 4. Interval Evaluator: Runs every 10 seconds
setInterval(async () => {
  if (isProcessing) return;

  // If no new readings arrived, fetch the current state to check if we should run an evaluation
  if (readingsBuffer.length === 0) {
    try {
      const snapshot = await get(healthRecordsRef);
      const record = snapshot.val();
      if (record && record.heartRate) {
        readingsBuffer.push({
          heartRate: record.heartRate,
          bodyTemperature: record.bodyTemperature,
          spo2: record.spo2,
          perfusionIndex: record.perfusionIndex,
          timestamp: record.timestamp || new Date().toISOString()
        });
      } else {
        return; // No data available anywhere
      }
    } catch (err) {
      console.error('Failed to query database state in interval:', err);
      return;
    }
  }

  isProcessing = true;
  const currentReadings = [...readingsBuffer];
  readingsBuffer = []; // Clear the buffer for the next 10 seconds

  console.log(`\n--- 10-Second Interval AI Assessment (Total readings: ${currentReadings.length}) ---`);

  try {
    // 5. Fetch User Profile
    const profileRef = ref(db, 'user_profile');
    const profileSnapshot = await get(profileRef);
    const profile = profileSnapshot.val() || {
      fullName: 'Anonymous User',
      age: '28',
      dob: 'Not set',
      bloodType: 'Not set',
      heightWeight: 'Not set',
      conditions: 'None reported'
    };

    // 6. Format readings list
    const formattedReadings = currentReadings.map((r, i) => 
      `Reading #${i+1} [${new Date(r.timestamp).toLocaleTimeString()}]: Heart Rate: ${r.heartRate} BPM, Temp: ${r.bodyTemperature}°C, SpO2: ${r.spo2}%, Perfusion Index: ${r.perfusionIndex}%`
    ).join('\n');

    console.log(formattedReadings);

    // 7. Request Groq AI Completion
    console.log('Requesting Groq AI analysis on this 10-second vital series...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an advanced medical diagnostic AI. Analyze a series of vital signs recorded over the last 10 seconds alongside the patient profile. Look for fluctuations, stability, or clinical anomalies in this series. Calculate a single overall Health Risk Score (integer 0 to 100, where 0 is perfect health and 100 is critical danger) and determine the overall Risk Level (either "Low", "Moderate", or "High"). Return only a JSON object with keys "healthRiskScore" and "riskLevel". Do not include any formatting, markdown syntax, or extra text.'
        },
        {
          role: 'user',
          content: `Patient Profile:
Name: ${profile.fullName}
Age: ${profile.age}
Blood Type: ${profile.bloodType}
Conditions: ${profile.conditions}

10-Second Sensor Stream:
${formattedReadings}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const responseText = chatCompletion.choices[0].message.content;
    console.log('AI Response:', responseText);

    const result = JSON.parse(responseText);
    const healthRiskScore = parseInt(result.healthRiskScore) || 20;
    const riskLevel = result.riskLevel || 'Low';

    console.log(`Assessed Results -> Risk Score: ${healthRiskScore}% | Level: ${riskLevel}`);

    // 8. Write findings back to Firebase
    const latestReading = currentReadings[currentReadings.length - 1];
    
    // Update live health_records
    await set(ref(db, 'health_records'), {
      bodyTemperature: latestReading.bodyTemperature,
      heartRate: latestReading.heartRate,
      spo2: latestReading.spo2,
      perfusionIndex: latestReading.perfusionIndex,
      healthRiskScore,
      riskLevel,
      timestamp: new Date().toISOString()
    });
    console.log('Successfully updated health_records with latest AI score.');

    // Push details to history
    await push(ref(db, 'history'), {
      bodyTemperature: latestReading.bodyTemperature,
      heartRate: latestReading.heartRate,
      spo2: latestReading.spo2,
      perfusionIndex: latestReading.perfusionIndex,
      healthRiskScore,
      riskLevel,
      timestamp: new Date().toISOString()
    });
    console.log('Successfully appended assessment to history log.');

  } catch (err) {
    console.error('Error executing 10-second interval AI flow:', err);
  } finally {
    isProcessing = false;
  }
}, 10000);
