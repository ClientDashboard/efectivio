import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Datos simplificados para el gráfico
const data = [
  { name: 'Ene', ingresos: 18500, gastos: 8200 },
  { name: 'Feb', ingresos: 20000, gastos: 8500 },
  { name: 'Mar', ingresos: 21500, gastos: 9000 },
  { name: 'Abr', ingresos: 19000, gastos: 8800 },
  { name: 'May', ingresos: 22000, gastos: 9300 },
  { name: 'Jun', ingresos: 24500, gastos: 9850 }
];

// Componente simple para mostrar ingresos vs gastos
export default function BasicIncomeExpenseWidget() {
  const incomeColor = "#0062ff";
  const expenseColor = "#F48E21";
  
  return (
    <div className="h-full w-full">
      <div className="flex justify-around mb-4">
        <div className="text-center">
          <div className="text-sm font-medium text-blue-600">Ingresos</div>
          <div className="text-lg font-bold">$125,500</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-orange-600">Gastos</div>
          <div className="text-lg font-bold">$53,650</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-green-600">Diferencia</div>
          <div className="text-lg font-bold">$71,850</div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
            <Tooltip />
            <Legend />
            <Bar dataKey="ingresos" name="Ingresos" fill={incomeColor} />
            <Bar dataKey="gastos" name="Gastos" fill={expenseColor} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}