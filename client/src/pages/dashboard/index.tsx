
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import RecentActivity from "@/components/dashboard/RecentActivity";
import DashboardWidgets from "@/components/dashboard/DashboardWidgets";
import DashboardCards from "@/components/dashboard/dashboard-cards";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      
      <DashboardCards 
        monthlySales={25000}
        pendingInvoices={5}
        monthlyExpenses={12000}
      />
      
      <div className="mt-8">
        <DashboardOverview />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div>
          <DashboardWidgets />
        </div>
      </div>
    </div>
  );
}
