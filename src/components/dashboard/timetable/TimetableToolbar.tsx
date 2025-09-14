"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useTimetableStore } from "@/store/timetableStore";
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
import { sessionService } from "@/services/sessionService";
import { classService, Class, Section } from "@/services/classService";
import { type Session } from "@/services/sessionService";

const TimetableToolbar = () => {
  const { selectedSchool } = useAuthStore();
  const { fetchClassTimetable, selectTimetable } = useTimetableStore();
  const { hasRole } = usePermissions();
  const isAdmin = hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [selectedSession, setSelectedSession] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  useEffect(() => {
    const loadSessions = async () => {
      if (selectedSchool) {
        try {
          const res = await sessionService.getAllSessions();
          if (res.success && res.data) {
            setSessions(res.data.data);
          }
        } catch (error) {
          console.error("Failed to load sessions", error);
        }
      }
    };
    loadSessions();
  }, [selectedSchool]);

  useEffect(() => {
    const loadClasses = async () => {
      if (selectedSchool) {
        try {
          const res = await classService.getClasses(selectedSchool.schoolId);
          if (res.success && res.data) {
            setClasses(res.data.data);
          }
        } catch (error) {
          console.error("Failed to load classes", error);
        }
      }
    };
    loadClasses();
  }, [selectedSchool]);

  useEffect(() => {
    if (selectedClass) {
      const classData = classes.find((c) => c.id === selectedClass);
      if (classData) {
        setSections(classData.sections);
      }
    } else {
      setSections([]);
    }
  }, [selectedClass, classes]);

  const handleViewTimetable = () => {
    if (selectedSection) {
      fetchClassTimetable(selectedSection);
    }
  };

  const handleCreateTimetable = () => {
    // This will likely open a modal, to be handled in the main page
    console.log("Create new timetable clicked");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        <Select value={selectedSession} onValueChange={setSelectedSession}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Session" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
        <Button onClick={handleCreateTimetable}>Create New Timetable</Button>
      )}
    </div>
  );
};

export default TimetableToolbar;
