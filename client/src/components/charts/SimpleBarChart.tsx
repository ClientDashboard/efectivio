import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

type ChartPeriod = 'month' | 'quarter' | 'year';

interface SimpleBarChartProps {
  incomeColor?: string;
  expenseColor?: string;
}

export default function SimpleBarChart({ 
  incomeColor = "#0062ff", 
  expenseColor = "#F48E21" 
}: SimpleBarChartProps) {
  const [period, setPeriod] = useState<ChartPeriod>('month');
  
  // Totales calculados
  const totalIngresos = 125500;
  const totalGastos = 53650;
  const diferencia = totalIngresos - totalGastos;
  
  // Sample data - simplificada para el enfoque de barras
  const monthlyData = [
    { name: 'Ene', ingresos: 18500, gastos: 8200 },
    { name: 'Feb', ingresos: 20000, gastos: 8500 },
    { name: 'Mar', ingresos: 21500, gastos: 9000 },
    { name: 'Abr', ingresos: 19000, gastos: 8800 },
    { name: 'May', ingresos: 22000, gastos: 9300 },
    { name: 'Jun', ingresos: 24500, gastos: 9850 }
  ];

  const chartData = monthlyData;
  
  return (
    <div className="w-full h-full overflow-hidden flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-800">Ingresos vs Gastos - Primer Semestre</div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
          <p className="text-blue-600 text-xs">Ingresos</p>
          <p className="text-base font-semibold">${totalIngresos.toLocaleString()}</p>
          <p className="text-blue-600 text-[10px] mt-0.5">+8.2%</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-2 border border-orange-100">
          <p className="text-orange-600 text-xs">Gastos</p>
          <p className="text-base font-semibold">${totalGastos.toLocaleString()}</p>
          <p className="text-orange-600 text-[10px] mt-0.5">+4.5%</p>
        </div>
        
        <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
          <p className="text-emerald-600 text-xs">Diferencia</p>
          <p className="text-base font-semibold">${diferencia.toLocaleString()}</p>
          <p className="text-emerald-600 text-[10px] mt-0.5">+12.3%</p>
        </div>
      </div>
      
      <div className="flex-grow w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 10 }}
              dy={5}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666', fontSize: 10 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, null]}
              contentStyle={{ 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                border: 'none', 
                padding: '8px 10px',
                fontSize: '12px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={20} 
              wrapperStyle={{ fontSize: "12px" }}
            />
            <Bar 
              dataKey="ingresos" 
              name="Ingresos" 
              fill={incomeColor} 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="gastos" 
              name="Gastos" 
              fill={expenseColor} 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}