import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CashFlowAnalysis() {
  const [isLoading, setIsLoading] = useState(false);

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
  
  useEffect(() => {
    setIsLoading(true);
    // Simulate AI analysis loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-gray-900">Análisis de Flujo de Caja</h3>
        <div className="flex text-sm text-gray-500 items-center">
          <i className="ri-ai-generate text-primary-500 mr-1.5"></i>
          <span>Impulsado por IA</span>
        </div>
      </div>
      
      {isLoading ? (
        <div className="h-64 w-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
            <p className="mt-3 text-sm text-gray-500">Generando análisis avanzado...</p>
          </div>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `B/. ${value ? value.toLocaleString() : 'N/A'}`}
                labelFormatter={(name) => `Mes: ${name}`}
              />
              <Legend />
              <Line type="monotone" dataKey="real" name="Real" stroke="#0062ff" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="proyectado" name="Proyectado" stroke="#00C875" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="optimista" name="Optimista" stroke="#8884d8" strokeWidth={1} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="pesimista" name="Pesimista" stroke="#d88884" strokeWidth={1} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
