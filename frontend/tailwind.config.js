/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand palette
        primary: '#3B82F6',
        accent: '#00D4FF',
        'accent-green': '#10B981',
        'accent-orange': '#F59E0B',
        'accent-red': '#EF4444',
        'accent-purple': '#8B5CF6',
        // Vitals
        'heart-rate': '#FF6B8A',
        temperature: '#FF9500',
        spo2: '#00D4FF',
        perfusion: '#8B5CF6',
        signal: '#10B981',
        risk: '#3B82F6',
        // Dark surfaces
        'dark-bg': '#0A0F1E',
        'dark-surface': '#111827',
        'dark-card': '#1E2D3D',
      },
    },
  },
  plugins: [],
};
