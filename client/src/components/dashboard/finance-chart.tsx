
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
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

export interface FinanceData {
  month: string;
  income: number;
  expenses: number;
}

interface FinanceChartProps {
  data: FinanceData[];
}

export default function FinanceChart({ data }: FinanceChartProps) {
  const hasData = data.some(item => item.income > 0 || item.expenses > 0);

  return (
    <Card className="mt-5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-normal">Resumen Financiero</CardTitle>
        <div className="text-xs text-muted-foreground">Últimos 6 meses</div>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[350px] flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay datos financieros disponibles</p>
          </div>
        ) : (
          <div className="h-[350px]">
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
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month"
                  tick={{ fill: '#666' }}
                  axisLine={{ stroke: '#f0f0f0' }}
                />
                <YAxis
                  tickFormatter={(value) => `${formatCurrency(value, undefined).slice(0, -3)}K`}
                  tick={{ fill: '#666' }}
                  axisLine={{ stroke: '#f0f0f0' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    padding: '8px',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar
                  name="Ingresos"
                  dataKey="income"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Gastos"
                  dataKey="expenses"
                  fill="hsl(var(--destructive))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
