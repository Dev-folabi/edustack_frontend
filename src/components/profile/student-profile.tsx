"use client";

import { useAuthStore } from "@/store/authStore";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export const StudentProfile = () => {
  const { student, user } = useAuthStore();

  return (
    <div>
      <PageHeader title="My Profile" />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <Button variant="outline" size="icon">
              <Pencil className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={student?.photo_url} />
              <AvatarFallback>
                {student?.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{student?.name}</h3>
              <p className="text-gray-500">{user?.email}</p>
              <p className="text-gray-500">{student?.phone}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
