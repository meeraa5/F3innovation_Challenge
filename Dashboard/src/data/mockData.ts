// src/data/mockData.ts

export const STATIONS = [
  { id: 1, name: "Station 002 - Five Points", region: "Central Valley", lat: 36.33, lon: -120.11 },
  { id: 2, name: "Station 006 - Davis", region: "Sacramento Valley", lat: 38.53, lon: -121.78 },
  { id: 3, name: "Station 015 - Stratford", region: "Central Valley", lat: 36.16, lon: -119.85 },
  { id: 4, name: "Station 039 - Parlier", region: "Central Valley", lat: 36.59, lon: -119.50 },
  { id: 5, name: "Station 080 - Fresno State", region: "Central Valley", lat: 36.82, lon: -119.74 },
];

// Type definitions for clarity
export interface HourlyDataPoint {
  time: string;
  temp: number;
  frostProb: number;
  threshold: 0;
}

export interface StationDetail {
  currentTemp: number;
  humidity: number;
  wind: number;
  dewPoint: number;
  forecast: HourlyDataPoint[];
}

// Generate a cooling curve typical of frost nights
const generateHourlyData = (baseTemp: number): HourlyDataPoint[] => {
  const data: HourlyDataPoint[] = [];
  const startHour = 16; // 4 PM start
  for (let i = 0; i < 24; i++) {
    const hour = (startHour + i) % 24;
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    
    // Simple cooling curve logic
    let temp;
    if (i < 4) temp = baseTemp - i * 1.5; 
    else if (i < 14) temp = baseTemp - 6 - (i - 4) * 0.8;
    else temp = baseTemp - 14 + (i - 14) * 2.0; 

    // Add some random variation and round to one decimal place
    temp = Math.round((temp + (Math.random() - 0.5)) * 10) / 10;
    
    let prob = 0;
    if (temp <= 0) prob = 0.95;
    else if (temp <= 2) prob = 0.75;
    else if (temp <= 4) prob = 0.30;
    else prob = 0.05;

    data.push({
      time: timeLabel,
      temp: temp,
      frostProb: Math.round(prob * 100) / 100, // Ensure two decimal places max
      threshold: 0
    });
  }
  return data;
};

// Mock data for stations
export const STATION_DATA: { [key: number]: StationDetail } = {
  1: { currentTemp: 12.5, humidity: 45, wind: 3.2, dewPoint: -1.2, forecast: generateHourlyData(14) },
  2: { currentTemp: 8.4, humidity: 60, wind: 1.5, dewPoint: 0.5, forecast: generateHourlyData(10) },
  3: { currentTemp: 10.1, humidity: 55, wind: 4.1, dewPoint: -0.5, forecast: generateHourlyData(12) },
  4: { currentTemp: 6.2, humidity: 35, wind: 0.8, dewPoint: -2.5, forecast: generateHourlyData(8) },
  5: { currentTemp: 7.8, humidity: 50, wind: 2.1, dewPoint: -1.0, forecast: generateHourlyData(9) },
};

// Metrics from the Report
export const MODEL_METRICS = {
  3: { auc: 0.98, ece: 0.01, brier: 0.02, accuracy: "98.5%" },
  6: { auc: 0.97, ece: 0.01, brier: 0.02, accuracy: "97.2%" },
  12: { auc: 0.96, ece: 0.02, brier: 0.03, accuracy: "95.1%" },
  24: { auc: 0.92, ece: 0.03, brier: 0.05, accuracy: "91.8%" },
};

// Comparison of Models
export const BENCHMARK_DATA = [
  { name: 'Linear Reg', auc: 0.82, accuracy: 85 },
  { name: 'KNN', auc: 0.88, accuracy: 89 },
  { name: 'Neural Net', auc: 0.91, accuracy: 92 },
  { name: 'XGBoost (Selected)', auc: 0.96, accuracy: 95.1 }, // Champion
];

// Feature Importance
export const FEATURE_DATA = [
  { name: 'Current Temp', importance: 0.35 },
  { name: 'Dew Point', importance: 0.25 },
  { name: 'Hour (Cyclical)', importance: 0.15 },
  { name: 'Lagged Temp (-1h)', importance: 0.12 },
  { name: 'Wind Speed', importance: 0.08 },
  { name: 'Humidity', importance: 0.05 },
];
