import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export interface FinanceData {
  month: string;
  income: number;
  expenses: number;
}

interface FinanceChartProps {
  data: FinanceData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-primary-600">
          Ingresos: {formatCurrency(payload[0].value)}
        </p>
        <p className="text-red-600">
          Gastos: {formatCurrency(payload[1].value)}
        </p>
        <p className="text-gray-800 font-medium mt-1">
          Utilidad: {formatCurrency(payload[0].value - payload[1].value)}
        </p>
      </div>
    );
  }

  return null;
};

export default function FinanceChart({ data }: FinanceChartProps) {
  return (
    <Card className="mt-5 bg-white overflow-hidden shadow rounded-lg">
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">
          Resumen financiero
        </CardTitle>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Ingresos vs. Gastos (últimos 6 meses)
        </p>
      </CardHeader>
      
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value, undefined).replace(/[^0-9]+/g, '')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                name="Ingresos"
                dataKey="income"
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                name="Gastos"
                dataKey="expenses"
                fill="hsl(var(--chart-3))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
