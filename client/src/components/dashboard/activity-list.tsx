import { formatDate } from "@/lib/utils";
import { CheckCircle, PieChart, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ActivityItem {
  id: string;
  type: "payment" | "invoice" | "reminder";
  message: string;
  link?: string;
  linkText?: string;
  timestamp: Date;
}

interface ActivityListProps {
  activities: ActivityItem[];
}

export default function ActivityList({ activities }: ActivityListProps) {
  return (
    <Card className="mt-5 bg-white overflow-hidden shadow rounded-lg">
      <CardHeader className="px-4 py-5 sm:px-6">
        <CardTitle className="text-lg leading-6 font-medium text-gray-900">
          Actividad reciente
        </CardTitle>
      </CardHeader>
      
      <CardContent className="bg-gray-50 px-4 py-5 sm:p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < activities.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  
                  <div className="relative flex space-x-3">
                    <div>
                      <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                        activity.type === "payment" ? "bg-green-500" :
                        activity.type === "invoice" ? "bg-primary-500" :
                        "bg-amber-500"
                      }`}>
                        {activity.type === "payment" ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : activity.type === "invoice" ? (
                          <PieChart className="h-5 w-5 text-white" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-white" />
                        )}
                      </span>
                    </div>
                    
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: activity.message }} />
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={activity.timestamp.toISOString()}>
                          {formatDate(activity.timestamp, true)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6">
          <Button variant="outline" className="w-full">
            Ver todas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
