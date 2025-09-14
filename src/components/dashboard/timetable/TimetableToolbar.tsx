"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTimetableStore } from "@/store/timetableStore";
import { useClassStore } from "@/store/classStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/utils/permissions";
import { UserRole } from "@/constants/roles";
import { ClassSection } from "@/services/classService";
import { CreateTimetableData } from "@/services/timetableService";
import CreateTimetableModal from "./CreateTimetableModal";

const TimetableToolbar = () => {
  const { selectedSchool } = useAuthStore();
  const { fetchClassTimetable, createTimetable } = useTimetableStore();
  const { classes, fetchClasses } = useClassStore();
  const { hasRole } = usePermissions();
  const isAdmin = hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN);

  const [sections, setSections] = useState<ClassSection[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch classes when selectedSchool changes
  useEffect(() => {
    if (selectedSchool) {
      fetchClasses(selectedSchool.schoolId);
    }
  }, [selectedSchool, fetchClasses]);

  // Update sections when selectedClass changes
  useEffect(() => {
    if (selectedClass) {
      const selectedClassObj = classes.find((c) => c.id === selectedClass);
      if (selectedClassObj) {
        setSections(selectedClassObj.sections);
        setSelectedSection(""); // Reset section selection
      }
    } else {
      setSections([]);
      setSelectedSection("");
    }
  }, [selectedClass, classes]);

  const handleViewTimetable = () => {
    if (selectedSection) {
      fetchClassTimetable(selectedSection);
    }
  };

  const handleCreateTimetable = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateTimetableSubmit = async (data: CreateTimetableData) => {
    try {
      const result = await createTimetable(data);
      if (result) {
        setIsCreateModalOpen(false);
        // Refresh the timetable view
        if (selectedSection) {
          fetchClassTimetable(selectedSection);
        }
      }
    } catch (error) {
      console.error("Failed to create timetable:", error);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleViewTimetable} disabled={!selectedSection}>
            View Timetable
          </Button>
        </div>
        {isAdmin && (
          <Button
            onClick={handleCreateTimetable}
            disabled={!selectedClass || !selectedSection}
          >
            Create New Timetable
          </Button>
        )}
      </div>

      {/* Create Timetable Modal */}
      {isCreateModalOpen && (
        <CreateTimetableModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTimetableSubmit}
          classId={selectedClass}
          sectionId={selectedSection}
        />
      )}
    </>
  );
};

export default TimetableToolbar;
