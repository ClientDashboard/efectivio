import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import IncomeExpenseChart from "../charts/IncomeExpenseChart";
import CashFlowAnalysis from "../charts/CashFlowAnalysis";

export default function DashboardOverview() {
  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
    enabled: true,
  });

  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const stats = [
    {
      id: 1,
      title: "Ingresos Mensuales",
      amount: dashboardData?.ingresos || "B/. 0.00",
      change: dashboardData?.ingresosChange || 0,
      isPositive: true,
      icon: "ri-money-dollar-circle-line",
      iconBgClass: "bg-emerald-50",
      iconClass: "text-emerald-500",
      description: "Total de ingresos del mes actual",
    },
    {
      id: 2,
      title: "Gastos Mensuales",
      amount: dashboardData?.gastos || "B/. 0.00",
      change: dashboardData?.gastosChange || 0,
      isPositive: false,
      icon: "ri-shopping-bag-3-line",
      iconBgClass: "bg-red-50",
      iconClass: "text-red-500",
      description: "Total de gastos del mes actual",
    },
    {
      id: 3,
      title: "Facturas Pendientes",
      amount: dashboardData?.facturasPendientes || "B/. 0.00",
      change: dashboardData?.facturasPendientesChange || 0,
      isPositive: null,
      icon: "ri-bill-line",
      iconBgClass: "bg-blue-50",
      iconClass: "text-blue-500",
      description: "Facturas por cobrar",
    },
    {
      id: 4,
      title: "ITBMS por Pagar",
      amount: dashboardData?.itbms || "B/. 0.00",
      change: null,
      isPositive: null,
      icon: "ri-government-line",
      iconBgClass: "bg-purple-50",
      iconClass: "text-purple-500",
      description: "Impuesto pendiente por pagar",
    },
  ];

  return (
    <section className="mb-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 
              transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg
              ${hoveredCard === stat.id ? "ring-2 ring-primary-500 ring-opacity-50" : ""}`}
            onMouseEnter={() => setHoveredCard(stat.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl ${stat.iconBgClass} flex items-center justify-center 
                transition-transform duration-300 ${hoveredCard === stat.id ? "scale-110" : ""}`}
              >
                <i className={`${stat.icon} text-2xl ${stat.iconClass}`}></i>
              </div>
            </div>
            <div className="flex items-baseline">
              <span className="text-2xl font-semibold text-gray-900">
                {stat.amount}
              </span>
              {stat.change !== null && (
                <span
                  className={`ml-2 ${stat.isPositive ? "text-emerald-500" : "text-red-500"} 
                  flex items-center text-sm font-medium`}
                >
                  <i
                    className={`${stat.isPositive ? "ri-arrow-up-line" : "ri-arrow-down-line"} mr-1`}
                  ></i>
                  {Math.abs(stat.change)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 
          transition-all duration-300 hover:shadow-md"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <i className="ri-line-chart-line mr-2 text-primary-500"></i>
            Ingresos vs Gastos
          </h3>
          <IncomeExpenseChart />
        </div>
        <div
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 
          transition-all duration-300 hover:shadow-md"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <i className="ri-funds-line mr-2 text-primary-500"></i>
            Flujo de Efectivo
          </h3>
          <CashFlowAnalysis />
        </div>
      </div>
    </section>
  );
}
