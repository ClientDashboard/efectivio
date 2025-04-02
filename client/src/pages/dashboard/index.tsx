import { useEffect, useState } from "react";
import { Link } from "wouter";
import MainLayout from "@/components/layout/main-layout";
import DashboardCards from "@/components/dashboard/dashboard-cards";
import FinanceChart, { FinanceData } from "@/components/dashboard/finance-chart";
import ActivityList, { ActivityItem } from "@/components/dashboard/activity-list";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { toast } = useToast();
  const [chartData, setChartData] = useState<FinanceData[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Example chart data generation
  useEffect(() => {
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"];
    const data = months.map((month) => ({
      month,
      income: Math.floor(Math.random() * 40000) + 10000,
      expenses: Math.floor(Math.random() * 20000) + 5000,
    }));
    setChartData(data);
  }, []);

  // Example activity data
  useEffect(() => {
    const now = new Date();
    
    const activities: ActivityItem[] = [
      {
        id: "1",
        type: "payment",
        message: 'Pago recibido de <a href="/clients/3" class="font-medium text-gray-900">Cliente XYZ</a>',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: "2",
        type: "invoice",
        message: 'Nueva factura creada <a href="/invoices/1234" class="font-medium text-gray-900">#1234</a>',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      },
      {
        id: "3",
        type: "reminder",
        message: 'Recordatorio de factura vencida <a href="/invoices/0987" class="font-medium text-gray-900">#0987</a>',
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      },
    ];
    
    setActivities(activities);
  }, []);

  // Fetch invoices for summary
  const { data: invoices } = useQuery({
    queryKey: ['/api/invoices'],
    onError: (error) => {
      toast({
        title: "Error al cargar facturas",
        description: "No se pudieron cargar las facturas. Intente nuevamente.",
        variant: "destructive",
      });
    }
  });

  // Fetch expenses for summary
  const { data: expenses } = useQuery({
    queryKey: ['/api/expenses'],
    onError: (error) => {
      toast({
        title: "Error al cargar gastos",
        description: "No se pudieron cargar los gastos. Intente nuevamente.",
        variant: "destructive",
      });
    }
  });

  // Calculate summary values
  const monthlySales = invoices 
    ? invoices
      .filter((invoice: any) => {
        const invoiceDate = new Date(invoice.issueDate);
        const now = new Date();
        return invoiceDate.getMonth() === now.getMonth() && 
               invoiceDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum: number, invoice: any) => sum + parseFloat(invoice.total), 0)
    : 24500;

  const pendingInvoices = invoices
    ? invoices.filter((invoice: any) => invoice.status === 'sent' || invoice.status === 'draft').length
    : 15;

  const monthlyExpenses = expenses
    ? expenses
      .filter((expense: any) => {
        const expenseDate = new Date(expense.date);
        const now = new Date();
        return expenseDate.getMonth() === now.getMonth() && 
               expenseDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum: number, expense: any) => sum + parseFloat(expense.amount), 0)
    : 12760;

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/invoices/create">
            <Button>
              Nueva Factura
            </Button>
          </Link>
          <Link href="/expenses/create">
            <Button variant="outline">
              Nuevo Gasto
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <DashboardCards 
        monthlySales={monthlySales}
        pendingInvoices={pendingInvoices}
        monthlyExpenses={monthlyExpenses}
      />

      {/* Chart */}
      <FinanceChart data={chartData} />

      {/* Recent Activity */}
      <ActivityList activities={activities} />
    </MainLayout>
  );
}
