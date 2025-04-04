import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

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
  
  // Totales calculados
  const totalIngresos = 125500;
  const totalGastos = 53650;
  const diferencia = totalIngresos - totalGastos;
  
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
    { name: '2021', ingresos: 245000, gastos: 105000 },
    { name: '2022', ingresos: 255000, gastos: 108000 },
    { name: '2023', ingresos: 268000, gastos: 114150 },
    { name: '2024', ingresos: 280000, gastos: 120000 },
    { name: '2025', ingresos: 290000, gastos: 125000 }
  ];

  const chartData = 
    period === 'month' ? monthlyData : 
    period === 'quarter' ? quarterlyData : yearlyData;
  
  return (
    <div className="w-full h-full px-1">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Ingresos vs Gastos</h2>
        
        <div className="flex items-center">
          <div className="relative">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md px-3 py-1.5">
              {period === 'month' ? 'Este semestre' : period === 'quarter' ? 'Este año (trimestres)' : 'Últimos 5 años'}
              <ChevronDown className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-blue-600 text-sm mb-1">Ingresos totales</p>
          <p className="text-2xl font-semibold">${totalIngresos.toLocaleString()}</p>
          <p className="text-blue-600 text-xs mt-1">+8.2% vs periodo anterior</p>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="text-orange-600 text-sm mb-1">Gastos totales</p>
          <p className="text-2xl font-semibold">${totalGastos.toLocaleString()}</p>
          <p className="text-orange-600 text-xs mt-1">+4.5% vs periodo anterior</p>
        </div>
        
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-emerald-600 text-sm mb-1">Diferencia</p>
          <p className="text-2xl font-semibold">${diferencia.toLocaleString()}</p>
          <p className="text-emerald-600 text-xs mt-1">+12.3% vs periodo anterior</p>
        </div>
      </div>
      
      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
            onMouseMove={(data) => {
              if (data.activeTooltipIndex !== undefined) {
                setHoveredBar(data.activeTooltipIndex.toString());
              }
            }}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <defs>
              <linearGradient id="ingresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={incomeColor} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={incomeColor} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gastos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={expenseColor} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={expenseColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            
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
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, null]}
              labelFormatter={(name) => `${period === 'month' ? 'Mes' : period === 'quarter' ? 'Trimestre' : 'Año'}: ${name}`}
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                border: 'none', 
                padding: '10px 14px'
              }}
            />
            
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke={incomeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#ingresos)"
              name="Ingresos"
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Area
              type="monotone"
              dataKey="gastos"
              stroke={expenseColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gastos)"
              name="Gastos"
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-center gap-8 mt-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: incomeColor }}></span>
          <span>Ingresos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: expenseColor }}></span>
          <span>Gastos</span>
        </div>
      </div>
    </div>
  );
}
