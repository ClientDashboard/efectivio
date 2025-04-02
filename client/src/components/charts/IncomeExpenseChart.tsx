import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ChartPeriod = 'month' | 'quarter' | 'year';

export default function IncomeExpenseChart() {
  const [period, setPeriod] = useState<ChartPeriod>('month');
  
  // Sample data
  const monthlyData = [
    { name: 'Ene', ingresos: 18500, gastos: 8200 },
    { name: 'Feb', ingresos: 20000, gastos: 8500 },
    { name: 'Mar', ingresos: 21500, gastos: 9000 },
    { name: 'Abr', ingresos: 19000, gastos: 8800 },
    { name: 'May', ingresos: 22000, gastos: 9300 },
    { name: 'Jun', ingresos: 24500, gastos: 9850 }
  ];

  const quarterlyData = [
    { name: 'Q1', ingresos: 60000, gastos: 25700 },
    { name: 'Q2', ingresos: 65500, gastos: 27950 },
    { name: 'Q3', ingresos: 70000, gastos: 29300 },
    { name: 'Q4', ingresos: 72500, gastos: 31200 }
  ];

  const yearlyData = [
    { name: '2019', ingresos: 210000, gastos: 95000 },
    { name: '2020', ingresos: 220000, gastos: 98500 },
    { name: '2021', ingresos: 245000, gastos: 105000 },
    { name: '2022', ingresos: 255000, gastos: 108000 },
    { name: '2023', ingresos: 268000, gastos: 114150 }
  ];

  const chartData = 
    period === 'month' ? monthlyData : 
    period === 'quarter' ? quarterlyData : yearlyData;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-medium text-gray-900">Ingresos vs Gastos</h3>
        <div className="flex text-sm space-x-2">
          <button 
            className={`px-3 py-1 rounded font-medium ${period === 'month' ? 'bg-primary-50 text-primary-500' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setPeriod('month')}
          >
            Mes
          </button>
          <button 
            className={`px-3 py-1 rounded font-medium ${period === 'quarter' ? 'bg-primary-50 text-primary-500' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setPeriod('quarter')}
          >
            Trimestre
          </button>
          <button 
            className={`px-3 py-1 rounded font-medium ${period === 'year' ? 'bg-primary-50 text-primary-500' : 'text-gray-500 hover:bg-gray-100'}`}
            onClick={() => setPeriod('year')}
          >
            Año
          </button>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => `B/. ${value.toLocaleString()}`}
              labelFormatter={(name) => `Período: ${name}`}
            />
            <Legend />
            <Bar dataKey="ingresos" name="Ingresos" fill="#0062ff" />
            <Bar dataKey="gastos" name="Gastos" fill="#F48E21" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
