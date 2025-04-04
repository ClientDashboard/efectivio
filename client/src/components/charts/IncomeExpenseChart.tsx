import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

type ChartPeriod = 'month' | 'quarter' | 'year';

interface IncomeExpenseChartProps {
  incomeColor?: string;
  expenseColor?: string;
}

export default function IncomeExpenseChart({ 
  incomeColor = "#0062ff", 
  expenseColor = "#F48E21" 
}: IncomeExpenseChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>('month');
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  
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
    <div className="bg-white rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['month', 'quarter', 'year'].map((p) => (
            <button
              key={p}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                period === p 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setPeriod(p as ChartPeriod)}
            >
              {p === 'month' ? 'Mes' : p === 'quarter' ? 'Trimestre' : 'Año'}
            </button>
          ))}
        </div>
        
        <div className="ml-auto flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: incomeColor }}></span>
            <span>Ingresos</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: expenseColor }}></span>
            <span>Gastos</span>
          </div>
        </div>
      </div>
      
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            barGap={8}
            onMouseMove={(data) => {
              if (data.activeTooltipIndex !== undefined) {
                setHoveredBar(data.activeTooltipIndex.toString());
              }
            }}
            onMouseLeave={() => setHoveredBar(null)}
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
              formatter={(value) => [`B/. ${value.toLocaleString()}`, null]}
              labelFormatter={(name) => `${period === 'month' ? 'Mes' : period === 'quarter' ? 'Trimestre' : 'Año'}: ${name}`}
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                border: 'none', 
                padding: '10px 14px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="ingresos" 
              name="Ingresos" 
              fill={incomeColor} 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Bar 
              dataKey="gastos" 
              name="Gastos" 
              fill={expenseColor} 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
