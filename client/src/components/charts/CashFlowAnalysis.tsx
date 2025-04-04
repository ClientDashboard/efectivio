import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface CashFlowAnalysisProps {
  realColor?: string;
  projectedColor?: string;
  optimisticColor?: string;
  pessimisticColor?: string;
}

export default function CashFlowAnalysis({
  realColor = "#0062ff",
  projectedColor = "#00C875",
  optimisticColor = "#8884d8",
  pessimisticColor = "#d88884"
}: CashFlowAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForecast, setShowForecast] = useState(true);

  // Sample data
  const data = [
    { name: 'Ene', real: 12000, proyectado: 11500, optimista: 13000, pesimista: 10000 },
    { name: 'Feb', real: 13200, proyectado: 12500, optimista: 14000, pesimista: 11000 },
    { name: 'Mar', real: 14500, proyectado: 13500, optimista: 15000, pesimista: 12000 },
    { name: 'Abr', real: 13800, proyectado: 14000, optimista: 15500, pesimista: 12500 },
    { name: 'May', real: 15000, proyectado: 14500, optimista: 16000, pesimista: 13000 },
    { name: 'Jun', real: null, proyectado: 15000, optimista: 16500, pesimista: 13500 },
    { name: 'Jul', real: null, proyectado: 15500, optimista: 17000, pesimista: 14000 },
    { name: 'Ago', real: null, proyectado: 16000, optimista: 17500, pesimista: 14500 },
  ];
  
  // Índice donde comienza la proyección
  const forecastStartIndex = data.findIndex(item => item.real === null);
  
  useEffect(() => {
    setIsLoading(true);
    // Simulate AI analysis loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-base font-medium text-gray-900">Análisis de Flujo de Caja</h3>
          <div className="ml-2 px-2 py-1 bg-blue-50 rounded-full flex items-center text-xs text-blue-600">
            <Sparkles className="h-3 w-3 mr-1" />
            <span>AI-Powered</span>
          </div>
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <span className="text-sm mr-2 text-gray-600">Proyección</span>
            <div className="relative">
              <input 
                type="checkbox" 
                checked={showForecast}
                onChange={() => setShowForecast(!showForecast)}
                className="sr-only"
              />
              <div className={`block ${showForecast ? 'bg-blue-500' : 'bg-gray-300'} w-10 h-5 rounded-full transition-colors`}></div>
              <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform transform ${showForecast ? 'translate-x-5' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>
      
      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-80 w-full flex items-center justify-center"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-sm text-gray-500">Generando análisis avanzado...</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-80 w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666', fontSize: 12 }}
                tickFormatter={(value) => `B/.${value / 1000}k`}
              />
              <Tooltip 
                formatter={(value) => [`B/. ${value ? value.toLocaleString() : 'N/A'}`, null]}
                labelFormatter={(name) => `Mes: ${name}`}
                contentStyle={{ 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                  border: 'none', 
                  padding: '10px 14px'
                }}
              />
              <Legend 
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  paddingTop: 15
                }}
              />
              
              {showForecast && forecastStartIndex > 0 && (
                <ReferenceArea 
                  x1={data[forecastStartIndex-1].name} 
                  x2={data[data.length-1].name} 
                  fill="#f8f9fa" 
                  fillOpacity={0.6} 
                  strokeOpacity={0}
                />
              )}
              
              <Line 
                type="monotone" 
                dataKey="real" 
                name="Real" 
                stroke={realColor} 
                strokeWidth={3} 
                dot={{ r: 5, fill: realColor, strokeWidth: 0 }} 
                activeDot={{ r: 7, strokeWidth: 1, stroke: 'white' }}
                isAnimationActive={true}
                animationDuration={1500}
              />
              
              {showForecast && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="proyectado" 
                    name="Proyectado" 
                    stroke={projectedColor} 
                    strokeWidth={2.5} 
                    dot={{ r: 4, fill: projectedColor, strokeWidth: 0 }} 
                    strokeDasharray="5 5" 
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationBegin={300}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="optimista" 
                    name="Optimista" 
                    stroke={optimisticColor} 
                    strokeWidth={1.5} 
                    dot={{ r: 3, fill: optimisticColor, strokeWidth: 0 }} 
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationBegin={600}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pesimista" 
                    name="Pesimista" 
                    stroke={pessimisticColor} 
                    strokeWidth={1.5} 
                    dot={{ r: 3, fill: pessimisticColor, strokeWidth: 0 }} 
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationBegin={900}
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
