import DashboardOverview from '@/components/dashboard/DashboardOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function Dashboard() {
  return (
    <div>
      <DashboardOverview />
      <RecentActivity />
    </div>
  );
}
