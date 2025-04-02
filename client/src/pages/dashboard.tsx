import DashboardOverview from '@/components/dashboard/DashboardOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DashboardWidgets from '@/components/dashboard/DashboardWidgets';

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <DashboardOverview />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <div className="lg:col-span-1">
          <DashboardWidgets />
        </div>
      </div>
    </div>
  );
}
