"use client";

import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdmissionForm } from '@/components/dashboard/student-management/AdmissionForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

const AdmissionPage = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setCsvFile(event.target.files[0]);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file to upload.");
      return;
    }
    setIsUploading(true);
    // This is a placeholder for the actual API call.
    // The user will provide the API endpoint for this.
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success("Bulk upload functionality is not yet implemented.");
    console.log("Uploading file:", csvFile.name);
    setIsUploading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Admission</h1>
      <Tabs defaultValue="single">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">Single Admission</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Admission</TabsTrigger>
        </TabsList>
        <TabsContent value="single">
          <AdmissionForm />
        </TabsContent>
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Student Admission</CardTitle>
              <CardDescription>
                Upload a CSV file to register multiple students at once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input type="file" accept=".csv" onChange={handleFileChange} />
                <Button onClick={handleBulkUpload} disabled={isUploading}>
                  {isUploading ? "Uploading..." : "Upload CSV"}
                </Button>
              </div>
              <a href="/student_admission_template.csv" download>
                <Button variant="outline">Download Template</Button>
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

export default withAuth(AdmissionPage, [UserRole.ADMIN]);
