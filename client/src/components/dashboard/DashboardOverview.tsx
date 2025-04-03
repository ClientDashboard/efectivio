
import { useQuery } from '@tanstack/react-query';
import IncomeExpenseChart from '../charts/IncomeExpenseChart';
import CashFlowAnalysis from '../charts/CashFlowAnalysis';

export default function DashboardOverview() {
  const { data: dashboardData } = useQuery({
    queryKey: ['/api/dashboard'],
    enabled: true,
  });

  const stats = [
    {
      id: 1,
      title: 'Ingresos Mensuales',
      amount: dashboardData?.ingresos || 'B/. 0.00',
      change: dashboardData?.ingresosChange || 0,
      isPositive: true,
      icon: 'ri-money-dollar-circle-line',
      iconBgClass: 'bg-emerald-50',
      iconClass: 'text-emerald-500'
    },
    {
      id: 2,
      title: 'Gastos Mensuales',
      amount: dashboardData?.gastos || 'B/. 0.00',
      change: dashboardData?.gastosChange || 0,
      isPositive: false,
      icon: 'ri-shopping-bag-3-line',
      iconBgClass: 'bg-red-50',
      iconClass: 'text-red-500'
    },
    {
      id: 3,
      title: 'Facturas Pendientes',
      amount: dashboardData?.facturasPendientes || 'B/. 0.00',
      change: dashboardData?.facturasPendientesChange || 0,
      isPositive: null,
      icon: 'ri-bill-line',
      iconBgClass: 'bg-blue-50',
      iconClass: 'text-blue-500'
    },
    {
      id: 4,
      title: 'ITBMS por Pagar',
      amount: dashboardData?.itbms || 'B/. 0.00',
      change: null,
      isPositive: null,
      icon: 'ri-government-line',
      iconBgClass: 'bg-purple-50',
      iconClass: 'text-purple-500'
    }
  ];

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map(stat => (
          <div key={stat.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <span className={`w-10 h-10 rounded-lg ${stat.iconBgClass} flex items-center justify-center`}>
                <i className={`${stat.icon} text-xl ${stat.iconClass}`}></i>
              </span>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold text-gray-900">{stat.amount}</span>
              {stat.change !== null && (
                <span className={`ml-2 ${stat.isPositive ? 'text-emerald-500' : 'text-red-500'} flex items-center text-sm`}>
                  <i className={`${stat.isPositive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
                  {Math.abs(stat.change)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ingresos vs Gastos</h3>
          <IncomeExpenseChart />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Flujo de Efectivo</h3>
          <CashFlowAnalysis />
        </div>
      </div>
    </section>
  );
}
