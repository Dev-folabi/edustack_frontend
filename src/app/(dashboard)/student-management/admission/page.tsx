"use client";

import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import AdmissionForm from "@/components/dashboard/student-management/AdmissionForm";

const AdmissionPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Admission</h1>
      <Tabs defaultValue="single">
        <TabsContent value="single">
          <AdmissionForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(AdmissionPage, [UserRole.ADMIN, UserRole.FINANCE]);
