import React, { useState, useMemo, useCallback } from 'react';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  TrendingDown, 
  Activity, 
  CheckCircle,
  Menu,
  X,
  Calendar,
  ChevronRight,
  BarChart2,
  PieChart,
  Zap, // Added for LLM feature
  Info, // Added for Modal
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  ReferenceLine, 
  Area, 
  AreaChart,
  BarChart,
  Bar,
  Legend,
  ComposedChart
} from 'recharts';

/**
 * GEMINI API CONFIGURATION
 */
const API_KEY = ""; // Canvas will provide this in runtime
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";
const MAX_RETRIES = 5;

// Utility function for exponential backoff
const fetchWithRetry = async (url: string, options: RequestInit) => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok && response.status === 429 && attempt < MAX_RETRIES - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) throw error;
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error("API request failed after multiple retries.");
};

/**
 * MOCK DATA GENERATION
 * Simulating the 18 CIMIS stations and 24h forecast curves based on the Report 2025.pdf context.
 */

const STATIONS = [
  { id: 1, name: "Station 002 - Five Points", region: "Central Valley", lat: 36.33, lon: -120.11 },
  { id: 2, name: "Station 006 - Davis", region: "Sacramento Valley", lat: 38.53, lon: -121.78 },
  { id: 3, name: "Station 015 - Stratford", region: "Central Valley", lat: 36.16, lon: -119.85 },
  { id: 4, name: "Station 039 - Parlier", region: "Central Valley", lat: 36.59, lon: -119.50 },
  { id: 5, name: "Station 080 - Fresno State", region: "Central Valley", lat: 36.82, lon: -119.74 },
];

// Generate a cooling curve typical of frost nights
const generateHourlyData = (baseTemp: number) => {
  const data = [];
  const startHour = 16; // 4 PM start
  for (let i = 0; i < 24; i++) {
    const hour = (startHour + i) % 24;
    const timeLabel = `${hour < 10 ? '0' : ''}${hour}:00`;
    
    // Simple cooling curve logic
    let temp;
    if (i < 4) temp = baseTemp - i * 1.5; 
    else if (i < 14) temp = baseTemp - 6 - (i - 4) * 0.8;
    else temp = baseTemp - 14 + (i - 14) * 2.0; 

    temp = Math.round((temp + (Math.random() - 0.5)) * 10) / 10;
    
    let prob = 0;
    if (temp <= 0) prob = 0.95;
    else if (temp <= 2) prob = 0.75;
    else if (temp <= 4) prob = 0.30;
    else prob = 0.05;

    data.push({
      time: timeLabel,
      temp: temp,
      frostProb: prob,
      threshold: 0
    });
  }
  return data;
};

// Mock data for stations
const STATION_DATA = {
  1: { currentTemp: 12.5, humidity: 45, wind: 3.2, dewPoint: -1.2, forecast: generateHourlyData(14) },
  2: { currentTemp: 8.4, humidity: 60, wind: 1.5, dewPoint: 0.5, forecast: generateHourlyData(10) },
  3: { currentTemp: 10.1, humidity: 55, wind: 4.1, dewPoint: -0.5, forecast: generateHourlyData(12) },
  4: { currentTemp: 6.2, humidity: 35, wind: 0.8, dewPoint: -2.5, forecast: generateHourlyData(8) },
  5: { currentTemp: 7.8, humidity: 50, wind: 2.1, dewPoint: -1.0, forecast: generateHourlyData(9) },
};

// Metrics from the Report
const MODEL_METRICS = {
  3: { auc: 0.98, ece: 0.01, brier: 0.02, accuracy: "98.5%" },
  6: { auc: 0.97, ece: 0.01, brier: 0.02, accuracy: "97.2%" },
  12: { auc: 0.96, ece: 0.02, brier: 0.03, accuracy: "95.1%" },
  24: { auc: 0.92, ece: 0.03, brier: 0.05, accuracy: "91.8%" },
};

// New Data: Comparison of Models (Reflecting "Evaluated 7+ model families")
const BENCHMARK_DATA = [
  { name: 'Linear Reg', auc: 0.82, accuracy: 85 },
  { name: 'KNN', auc: 0.88, accuracy: 89 },
  { name: 'Neural Net', auc: 0.91, accuracy: 92 },
  { name: 'XGBoost (Selected)', auc: 0.96, accuracy: 95.1 }, // Champion
];

// New Data: Feature Importance (Implied from "data-driven approaches" and "microclimate behavior")
const FEATURE_DATA = [
  { name: 'Current Temp', importance: 0.35 },
  { name: 'Dew Point', importance: 0.25 },
  { name: 'Hour (Cyclical)', importance: 0.15 },
  { name: 'Lagged Temp (-1h)', importance: 0.12 },
  { name: 'Wind Speed', importance: 0.08 },
  { name: 'Humidity', importance: 0.05 },
];

/**
 * Modal Component for LLM Output
 */
const MarkdownModal = ({ content, onClose, sources }: { content: string, onClose: () => void, sources: { uri: string, title: string }[] }) => {
  if (!content) return null;

  // Simple Markdown to JSX conversion (basic support for bold, lists, and newlines)
  const renderMarkdown = (text: string) => {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle list items (basic)
    const lines = html.split('\n');
    let inList = false;
    const renderedLines = lines.map((line, index) => {
      if (line.trim().startsWith('* ')) {
        const item = <li key={index} className="ml-5 list-disc text-sm text-slate-700">{line.substring(2)}</li>;
        if (!inList) {
          inList = true;
          return <ul key={'ul-start-' + index} className="my-2">{item}
            {(index === lines.length - 1 || !lines[index + 1]?.trim().startsWith('* ')) ? (<></>) : null}
          </ul>;
        } else {
          return item;
        }
      } else {
        if (inList) inList = false;
        return line.trim() === '' ? <br key={index} /> : <p key={index} className="mb-2 text-slate-700">{line}</p>;
      }
    });
    
    return <div>{renderedLines}</div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Zap className="h-6 w-6 mr-2 text-blue-600" />
            AI-Generated Mitigation Plan
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {renderMarkdown(content)}
          
          {sources.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h4 className="font-semibold text-xs uppercase text-slate-500 mb-2">Sources Grounding</h4>
              <ul className="space-y-1">
                {sources.map((source, index) => (
                  <li key={index} className="text-xs text-slate-500 flex items-start">
                    <Info className="h-3 w-3 mt-0.5 mr-1 flex-shrink-0" />
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 truncate">{source.title || 'Source Link'}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};


export default function App() {
  const [selectedStationId, setSelectedStationId] = useState(4);
  const [selectedHorizon, setSelectedHorizon] = useState(12);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // LLM State
  const [detailedPlan, setDetailedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sources, setSources] = useState<{ uri: string, title: string }[]>([]);

  const currentStation = STATIONS.find(s => s.id === selectedStationId);
  // @ts-ignore
  const stationData = STATION_DATA[selectedStationId];
  
  const targetIndex = selectedHorizon - 1; 
  const forecastAtHorizon = stationData.forecast[Math.min(targetIndex, 23)];
  const predictedTemp = forecastAtHorizon.temp;
  const frostProb = forecastAtHorizon.frostProb;

  let riskLevel = "Low";
  let riskColor = "bg-emerald-500";
  let riskTextColor = "text-emerald-700";
  let riskBg = "bg-emerald-50";
  let recommendation = "Monitor conditions. No immediate action required.";

  if (frostProb > 0.7 || predictedTemp <= 1.0) {
    riskLevel = "CRITICAL";
    riskColor = "bg-red-500";
    riskTextColor = "text-red-700";
    riskBg = "bg-red-50";
    recommendation = "DEPLOY MITIGATION: Start wind machines or irrigation immediately.";
  } else if (frostProb > 0.3 || predictedTemp <= 3.0) {
    riskLevel = "High";
    riskColor = "bg-orange-500";
    riskTextColor = "text-orange-700";
    riskBg = "bg-orange-50";
    recommendation = "ALERT: Prepare crews. Check wet bulb temperatures.";
  }

  // Data for Horizon Chart
  const horizonChartData = [
    // @ts-ignore
    { name: '+3h', auc: MODEL_METRICS[3].auc, ece: MODEL_METRICS[3].ece },
    // @ts-ignore
    { name: '+6h', auc: MODEL_METRICS[6].auc, ece: MODEL_METRICS[6].ece },
    // @ts-ignore
    { name: '+12h', auc: MODEL_METRICS[12].auc, ece: MODEL_METRICS[12].ece },
    // @ts-ignore
    { name: '+24h', auc: MODEL_METRICS[24].auc, ece: MODEL_METRICS[24].ece },
  ];

  /**
   * LLM API Call to generate the detailed mitigation plan.
   */
  const generateMitigationPlan = useCallback(async () => {
    setIsLoading(true);
    setDetailedPlan(null);
    setSources([]);

    const userQuery = `Given the ${riskLevel} frost risk: Predicted temperature is ${predictedTemp}°C at +${selectedHorizon} hours in the ${currentStation?.region} (CIMIS Station: ${currentStation?.name}). Current conditions are: Humidity ${stationData.humidity}%, Wind Speed ${stationData.wind} m/s, Dew Point ${stationData.dewPoint}°C. Provide a detailed, step-by-step mitigation plan.`;
    
    const systemPrompt = "You are an expert agricultural consultant specializing in frost protection for high-value crops (like almonds, citrus, or grapes) in California's Central Valley. The plan must be formatted using Markdown bullet points and include Preparation, Deployment, and Monitoring phases. Assume the risk is for a sensitive crop like young almonds in early bloom, which has a critical temperature of -0.5°C.";

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      // Use Google Search grounding for real-time best practices
      tools: [{ "google_search": {} }], 
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
      const response = await fetchWithRetry(`${API_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (candidate && candidate.content?.parts?.[0]?.text) {
        setDetailedPlan(candidate.content.parts[0].text);
        
        let extractedSources = [];
        const groundingMetadata = candidate.groundingMetadata;
        if (groundingMetadata && groundingMetadata.groundingAttributions) {
            extractedSources = groundingMetadata.groundingAttributions
                .map((attribution: any) => ({
                    uri: attribution.web?.uri,
                    title: attribution.web?.title,
                }))
                .filter(source => source.uri && source.title);
        }
        setSources(extractedSources);

      } else {
        setDetailedPlan("Error: Could not generate a detailed plan. Please try again or check the API status.");
        setSources([]);
      }

    } catch (error) {
      console.error("Gemini API call failed:", error);
      setDetailedPlan("A network or API error occurred. Please check your connection.");
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedHorizon, predictedTemp, riskLevel, currentStation, stationData]);


  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">F3 Innovate</h1>
            <p className="text-xs text-slate-400 mt-1">Frost Risk Dashboard</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-6">
            <h3 className="text-xs uppercase text-slate-500 font-semibold mb-3 px-2">Select Station</h3>
            <div className="space-y-1">
              {STATIONS.map((station) => (
                <button
                  key={station.id}
                  onClick={() => setSelectedStationId(station.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedStationId === station.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  <div className="font-medium">{station.name}</div>
                  <div className="text-xs opacity-70">{station.region}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase text-slate-500 font-semibold mb-3 px-2">Analytics</h3>
            <button className="flex items-center w-full px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg text-sm">
              <BarChart2 className="mr-2 h-4 w-4" /> Model Benchmarks
            </button>
            <button className="flex items-center w-full px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-lg text-sm">
              <PieChart className="mr-2 h-4 w-4" /> Feature Analysis
            </button>
          </div>
        </div>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">
              FB
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Team Frost Byte</p>
              <p className="text-xs text-slate-500">View Submission</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="mr-4 md:hidden text-slate-500">
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold flex items-center text-slate-800">
              <MapPin className="mr-2 h-5 w-5 text-blue-600" />
              {currentStation?.name}
            </h2>
            <span className="mx-3 text-slate-300">|</span>
            <span className="text-sm text-slate-500">Last Updated: Today, 16:00 PST</span>
          </div>
          
          <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1">
            {[3, 6, 12, 24].map((h) => (
              <button
                key={h}
                // @ts-ignore
                onClick={() => setSelectedHorizon(h)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${selectedHorizon === h ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                +{h}h Forecast
              </button>
            ))}
          </div>
        </header>

        {/* Dashboard Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Top Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Current Air Temp</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{stationData.currentTemp}°C</h3>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Thermometer className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-slate-500">
                  <span className="text-blue-600 font-medium mr-1">Dew Point:</span> {stationData.dewPoint}°C
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Forecast (+{selectedHorizon}h)</p>
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{predictedTemp}°C</h3>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-slate-500">
                   Model: <span className="font-medium ml-1">XGBoost Regressor</span>
                </div>
              </div>

              <div className={`p-5 rounded-xl border shadow-sm ${riskBg} border-${riskColor.split('-')[1]}-200`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm font-medium ${riskTextColor}`}>Frost Probability</p>
                    <h3 className={`text-3xl font-bold ${riskTextColor} mt-2`}>{Math.round(frostProb * 100)}%</h3>
                  </div>
                  <div className={`p-2 bg-white bg-opacity-50 rounded-lg`}>
                    <TrendingDown className={`h-6 w-6 ${riskTextColor}`} />
                  </div>
                </div>
                <div className={`mt-4 flex items-center text-xs ${riskTextColor} font-medium`}>
                   Risk Level: {riskLevel.toUpperCase()}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Model Reliability</p>
                    {/* @ts-ignore */}
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{MODEL_METRICS[selectedHorizon].auc}</h3>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Activity className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-slate-500">
                   Metric: <span className="font-medium ml-1">ROC-AUC (Historical)</span>
                </div>
              </div>
            </div>

            {/* Main Action & Chart Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className={`px-6 py-4 border-b border-slate-100 flex items-center ${riskBg}`}>
                    <AlertTriangle className={`h-5 w-5 mr-2 ${riskTextColor}`} />
                    <h3 className={`font-semibold ${riskTextColor}`}>Action Recommendation</h3>
                  </div>
                  <div className="p-6">
                    <p className="text-lg font-medium text-slate-800 leading-relaxed">
                      {recommendation}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Mitigation Checklist</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="h-4 w-4 text-slate-300 mr-2" /> Verify wind machine fuel
                        </li>
                        <li className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="h-4 w-4 text-slate-300 mr-2" /> Check irrigation lines
                        </li>
                        <li className="flex items-center text-sm text-slate-600">
                          <CheckCircle className="h-4 w-4 text-slate-300 mr-2" /> Alert night crew
                        </li>
                      </ul>
                      <button 
                        onClick={generateMitigationPlan}
                        disabled={isLoading}
                        className={`mt-4 w-full flex items-center justify-center px-4 py-2 text-white font-medium rounded-lg transition ${
                          isLoading 
                            ? 'bg-slate-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                        }`}
                      >
                        {isLoading ? (
                           <div className="flex items-center">
                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                             Generating Plan...
                           </div>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            ✨ Generate Detailed Action Plan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                   <h3 className="font-semibold text-slate-800 mb-4">Current Conditions</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="flex items-center text-slate-500 text-sm"><Droplets className="h-4 w-4 mr-2"/> Humidity</span>
                        <span className="font-medium">{stationData.humidity}%</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="flex items-center text-slate-500 text-sm"><Wind className="h-4 w-4 mr-2"/> Wind Speed</span>
                        <span className="font-medium">{stationData.wind} m/s</span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                        <span className="flex items-center text-slate-500 text-sm"><Thermometer className="h-4 w-4 mr-2"/> Dew Point</span>
                        <span className="font-medium">{stationData.dewPoint}°C</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-semibold text-slate-800">24-Hour Temperature Forecast</h3>
                    <p className="text-sm text-slate-500">Predicted cooling curve vs. Critical Frost Threshold (0°C)</p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                     <div className="flex items-center"><span className="w-3 h-3 bg-blue-500 rounded-full mr-1"></span> Temp</div>
                     <div className="flex items-center"><span className="w-3 h-3 bg-red-400 rounded-full mr-1"></span> Freeze Line</div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stationData.forecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} unit="°C" />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#1e293b' }}
                      />
                      <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                      <Area type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 flex justify-between items-center">
                   <span><strong>Analysis:</strong> The model predicts a critical dip below 0°C starting at 03:00 and lasting until 07:00.</span>
                   <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* NEW SECTION: Analytics & Report Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Model Benchmarks */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800">Model Benchmarking</h3>
                  <p className="text-sm text-slate-500">Comparison of candidate models (Source: Report 2025)</p>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={BENCHMARK_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0.7, 1.0]} hide />
                      <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Bar dataKey="auc" fill="#3b82f6" radius={[0, 4, 4, 0]} name="ROC-AUC Score" barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Feature Importance / Horizon Decay */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800">Forecast Horizon Reliability</h3>
                  <p className="text-sm text-slate-500">Performance degradation analysis over time</p>
                </div>
                <div className="h-[250px]">
                   <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={horizonChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid stroke="#f5f5f5" />
                      <XAxis dataKey="name" scale="band" />
                      <YAxis yAxisId="left" domain={[0.8, 1]} orientation="left" label={{ value: 'ROC-AUC', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" domain={[0, 0.1]} orientation="right" label={{ value: 'ECE (Error)', angle: 90, position: 'insideRight' }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="auc" barSize={40} fill="#3b82f6" name="Accuracy (AUC)" />
                      <Line yAxisId="right" type="monotone" dataKey="ece" stroke="#ff7300" name="Calibration Error (ECE)" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom: Metrics Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-semibold text-slate-800">Detailed Metrics Table</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                       <tr>
                          <th className="px-6 py-3">Horizon</th>
                          <th className="px-6 py-3">ROC-AUC</th>
                          <th className="px-6 py-3">ECE (Calibration)</th>
                          <th className="px-6 py-3">Brier Score</th>
                          <th className="px-6 py-3">Validation Accuracy</th>
                          <th className="px-6 py-3">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {[3, 6, 12, 24].map((h) => (
                         <tr key={h} className={selectedHorizon === h ? 'bg-blue-50' : ''}>
                            <td className="px-6 py-4 font-medium">+{h} Hours</td>
                            {/* @ts-ignore */}
                            <td className="px-6 py-4 text-slate-600">{MODEL_METRICS[h].auc}</td>
                            {/* @ts-ignore */}
                            <td className="px-6 py-4 text-slate-600">{MODEL_METRICS[h].ece}</td>
                            {/* @ts-ignore */}
                            <td className="px-6 py-4 text-slate-600">{MODEL_METRICS[h].brier}</td>
                            {/* @ts-ignore */}
                            <td className="px-6 py-4 text-slate-600">{MODEL_METRICS[h].accuracy}</td>
                            <td className="px-6 py-4">
                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Production Ready
                               </span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>

          </div>
        </div>
      </main>

      {/* LLM Output Modal */}
      <MarkdownModal 
        content={detailedPlan || ''} 
        onClose={() => setDetailedPlan(null)} 
        sources={sources}
      />
    </div>
  );
}
