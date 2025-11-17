"use client";

import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { PageHeader } from "@/components/ui/page-header";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";

export const StudentNotifications = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["student-notifications"],
    queryFn: () => notificationService.getNotifications(),
  });

  return (
    <div>
      <PageHeader title="My Notifications" />
      {isLoading ? (
        <Loading />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.data.map((notification: { id: string; title: string; message: string }) => (
              <div
                key={notification.id}
                className="flex items-center space-x-4 mb-4"
              >
                <Bell className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p className="text-gray-500">{notification.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
