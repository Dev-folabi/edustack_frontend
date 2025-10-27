"use client";

import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Settings, Plus } from "lucide-react";
import { GradeCriteriaTable } from "@/components/dashboard/examinations/GradeCriteriaTable";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CreateEditGradeDialog } from "@/components/dashboard/examinations/CreateEditGradeDialog";

const GradeCriteriaSettings = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Grade Criteria</CardTitle>
            <CardDescription>Define the grading scale for your school.</CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Grade
          </Button>
        </CardHeader>
        <CardContent>
          <GradeCriteriaTable />
        </CardContent>
      </Card>
      <CreateEditGradeDialog isOpen={isDialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

import { PsychomotorSkillsTable } from "@/components/dashboard/examinations/PsychomotorSkillsTable";
import { CreateEditPsychomotorSkillDialog } from "@/components/dashboard/examinations/CreateEditPsychomotorSkillDialog";

const PsychomotorSkillsSettings = () => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Psychomotor Skills</CardTitle>
            <CardDescription>Manage the psychomotor skills to be assessed.</CardDescription>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </CardHeader>
        <CardContent>
          <PsychomotorSkillsTable />
        </CardContent>
      </Card>
      <CreateEditPsychomotorSkillDialog isOpen={isDialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

import { GeneralSettingsForm } from "@/components/dashboard/examinations/GeneralSettingsForm";

const GeneralExamSettings = () => (
    <Card>
        <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Manage general examination settings for your school.</CardDescription>
        </CardHeader>
        <CardContent>
            <GeneralSettingsForm />
        </CardContent>
    </Card>
);

const GlobalSettingsPage = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Global Exam Settings</h1>
        </div>
      <Tabs defaultValue="grade-criteria">
        <TabsList>
          <TabsTrigger value="grade-criteria">Grade Criteria</TabsTrigger>
          <TabsTrigger value="psychomotor">Psychomotor Skills</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="grade-criteria">
          <GradeCriteriaSettings />
        </TabsContent>
        <TabsContent value="psychomotor">
          <PsychomotorSkillsSettings />
        </TabsContent>
        <TabsContent value="general">
            <GeneralExamSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default withAuth(GlobalSettingsPage, [UserRole.SUPER_ADMIN, UserRole.ADMIN]);
