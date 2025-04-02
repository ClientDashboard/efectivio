import { useQuery } from '@tanstack/react-query';
import IncomeExpenseChart from '../charts/IncomeExpenseChart';
import CashFlowAnalysis from '../charts/CashFlowAnalysis';

export default function DashboardOverview() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['/api/dashboard'],
    enabled: false, // Disabled until we have a real endpoint
  });

  // For now, we'll use static data
  const stats = [
    {
      id: 1,
      title: 'Ingresos Mensuales',
      amount: 'B/. 24,500.00',
      change: 12,
      isPositive: true,
      icon: 'ri-money-dollar-circle-line',
      iconBgClass: 'bg-primary-50',
      iconClass: 'text-primary-500'
    },
    {
      id: 2,
      title: 'Gastos Mensuales',
      amount: 'B/. 9,850.00',
      change: 5,
      isPositive: false,
      icon: 'ri-shopping-bag-3-line',
      iconBgClass: 'bg-accent-50',
      iconClass: 'text-accent-500'
    },
    {
      id: 3,
      title: 'Facturas Pendientes',
      amount: 'B/. 12,380.00',
      change: 3,
      isPositive: true,
      icon: 'ri-bill-line',
      iconBgClass: 'bg-red-50',
      iconClass: 'text-error-500'
    },
    {
      id: 4,
      title: 'ITBMS por Pagar',
      amount: 'B/. 1,575.00',
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
          <div key={stat.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <span className={`w-10 h-10 rounded-full ${stat.iconBgClass} flex items-center justify-center`}>
                <i className={`${stat.icon} text-xl ${stat.iconClass}`}></i>
              </span>
            </div>
            <div className="flex items-end">
              <span className="financial-figure text-2xl font-semibold">{stat.amount}</span>
              {stat.change !== null && (
                <span className={`ml-2 ${stat.isPositive ? 'text-secondary-500' : 'text-error-500'} flex items-center text-sm`}>
                  <i className={`${stat.isPositive ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
                  {stat.change}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart />
        <CashFlowAnalysis />
      </div>
    </section>
  );
}
