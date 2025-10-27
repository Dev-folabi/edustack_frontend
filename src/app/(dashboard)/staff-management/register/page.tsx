"use client";

import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StaffRegistrationForm from '@/components/dashboard/staff-management/StaffRegistrationForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { staffService } from '@/services/staffService';
import { useAuthStore } from '@/store/authStore';
import { Download, Upload } from 'lucide-react';

const RegisterStaffPage = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();
  const { selectedSchool } = useAuthStore();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setCsvFile(event.target.files[0]);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) {
      showToast({
        type: 'error',
        title: 'No file selected',
        message: 'Please select a CSV file to upload.',
      });
      return;
    }
    if (!selectedSchool) {
        showToast({
            type: 'error',
            title: 'No school selected',
            message: 'Please select a school to upload the staff to.',
        });
        return;
    }

    setIsUploading(true);
    try {
      const response = await staffService.bulkRegisterStaff(selectedSchool.schoolId, csvFile);
      if (response.success) {
        showToast({
          type: 'success',
          title: 'Bulk registration successful',
          message: 'Staff members have been registered.',
        });
      } else {
        showToast({
          type: 'error',
          title: 'Bulk registration failed',
          message: response.message || 'An error occurred during bulk registration.',
        });
      }
    } catch (error: any) {
        showToast({
            type: 'error',
            title: 'Bulk registration failed',
            message: error.message || 'An error occurred during bulk registration.',
        });
    } finally {
      setIsUploading(false);
      setCsvFile(null);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Staff Registration</h1>
      <Tabs defaultValue="single">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Registration</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Registration</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <StaffRegistrationForm />
        </TabsContent>
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Staff Registration</CardTitle>
              <CardDescription>
                Upload a CSV file to register multiple staff members at once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input type="file" accept=".csv" onChange={handleFileChange} />
                <Button onClick={handleBulkUpload} disabled={isUploading}>
                  {isUploading ? "Uploading..." : <><Upload className="mr-2 h-4 w-4" /> Upload CSV</>}
                </Button>
              </div>
              <a href="/staff_registration_template.csv" download>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                </Button>
              </a>
              <p className="text-sm text-muted-foreground">
                Download the template file to see the required format and fields for the CSV upload.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(RegisterStaffPage, [UserRole.ADMIN]);
