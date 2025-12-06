// src/components/FrostDashboard.tsx

import React, { useState } from 'react';
import { 
  Thermometer, Wind, Droplets, AlertTriangle, Clock, MapPin, TrendingDown, Activity, 
  CheckCircle, Menu, X, ChevronRight, BarChart2, PieChart
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, ReferenceLine, BarChart, Bar, ComposedChart, Line, Legend
} from 'recharts';
import { 
  STATIONS, STATION_DATA, MODEL_METRICS, BENCHMARK_DATA, HourlyDataPoint, StationDetail 
} from '../data/mockData';

export default function FrostDashboard() {
  const [selectedStationId, setSelectedStationId] = useState(4);
  const [selectedHorizon, setSelectedHorizon] = useState(12);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentStation = STATIONS.find(s => s.id === selectedStationId);
  const stationData: StationDetail = STATION_DATA[selectedStationId] as StationDetail;
  
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
    { name: '+3h', auc: MODEL_METRICS[3].auc, ece: MODEL_METRICS[3].ece },
    { name: '+6h', auc: MODEL_METRICS[6].auc, ece: MODEL_METRICS[6].ece },
    { name: '+12h', auc: MODEL_METRICS[12].auc, ece: MODEL_METRICS[12].ece },
    { name: '+24h', auc: MODEL_METRICS[24].auc, ece: MODEL_METRICS[24].ece },
  ];

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
                    <h3 className="text-3xl font-bold text-slate-900 mt-2">{MODEL_METRICS[selectedHorizon as keyof typeof MODEL_METRICS].auc}</h3>
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

              {/* Chart 2: Forecast Horizon Reliability */}
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
                            <td className="px-6 py-4 text-slate-600">{MODEL_METRICS[h as keyof typeof MODEL_METRICS].auc}</td>
                            <td className="px-6 py-4 text-slate-600">{MODEL_METRICS[h as keyof typeof MODEL_METRICS].ece}</td>
                            <td className="px-6 py-4 text-slate-600">{MODEL_METRICS[h as keyof typeof MODEL_METRICS].brier}</td>
                            <td className="px-6 py-4 text-slate-600">{MODEL_METRICS[h as keyof typeof MODEL_METRICS].accuracy}</td>
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
    </div>
  );
}
