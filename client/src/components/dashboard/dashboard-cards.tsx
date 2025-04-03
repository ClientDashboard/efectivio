import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CircleDollarSign, Receipt, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  linkHref: string;
  linkText: string;
}

function DashboardCard({
  title,
  value,
  icon,
  iconColor,
  bgColor,
  linkHref,
  linkText,
}: DashboardCardProps) {
  return (
    <Card className="bg-white overflow-hidden shadow rounded-lg">
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${bgColor}`}>
            <div className={`h-6 w-6 ${iconColor}`}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a
            href={linkHref}
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            {linkText}
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}

interface DashboardCardsProps {
  monthlySales: number;
  pendingInvoices: number;
  monthlyExpenses: number;
}

export default function DashboardCards({
  monthlySales,
  pendingInvoices,
  monthlyExpenses,
}: DashboardCardsProps) {
  const hasData = monthlySales > 0 || pendingInvoices > 0 || monthlyExpenses > 0;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {!hasData && (
        <div className="col-span-full bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No hay datos disponibles aún. Los indicadores se actualizarán automáticamente cuando comience a registrar transacciones.</p>
        </div>
      )}
      {hasData && (
      <DashboardCard
        title="Ventas del mes"
        value={formatCurrency(monthlySales)}
        icon={<CircleDollarSign />}
        iconColor="text-primary-600"
        bgColor="bg-primary-100"
        linkHref="/invoices"
        linkText="Ver detalle"
      />
      
      <DashboardCard
        title="Facturas pendientes"
        value={pendingInvoices.toString()}
        icon={<FileText />}
        iconColor="text-amber-600"
        bgColor="bg-amber-100"
        linkHref="/invoices?status=pendiente"
        linkText="Ver facturas"
      />
      
      <DashboardCard
        title="Gastos del mes"
        value={formatCurrency(monthlyExpenses)}
        icon={<Receipt />}
        iconColor="text-red-600"
        bgColor="bg-red-100"
        linkHref="/expenses"
        linkText="Ver detalle"
      />
    )}
    </div>
  );
}
