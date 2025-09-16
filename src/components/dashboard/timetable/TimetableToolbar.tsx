"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useClassStore } from "@/store/classStore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClassSection } from "@/services/classService";
import { Eye, Loader } from "lucide-react";

const TimetableToolbar = () => {
  const router = useRouter();
  const { selectedSchool } = useAuthStore();
  const { classes, fetchClasses, isLoading } = useClassStore();

  const [sections, setSections] = useState<ClassSection[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

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
      router.push(`/academics/timetable/view/${selectedSection}`);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm mb-4">
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

        <Button
          onClick={handleViewTimetable}
          disabled={!selectedSection || isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              View Timetable
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TimetableToolbar;
