"use client";

import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export const StudentAcademics = () => {
  const { student, selectedSchool } = useAuthStore();
  const school = selectedSchool?.school;
  const studentId = student?.id;
  const schoolId = school?.id;
  const classId = student?.student_enrolled[0]?.classId;
  const sectionId = student?.student_enrolled[0]?.sectionId;

  const academicsLinks = [
    {
      label: "Subjects",
      icon: BookOpen,
      href: `/student/academics/subjects?studentId=${studentId}&schoolId=${schoolId}&classId=${classId}&sectionId=${sectionId}`,
      description: "View your subjects",
    },
    {
      label: "Timetable",
      icon: CalendarDays,
      href: `/student/academics/timetable?studentId=${studentId}&schoolId=${schoolId}&classId=${classId}&sectionId=${sectionId}`,
      description: "Check your class schedule",
    },
    {
      label: "Attendance",
      icon: ClipboardCheck,
      href: `/student/academics/attendance?studentId=${studentId}&schoolId=${schoolId}&classId=${classId}&sectionId=${sectionId}`,
      description: "Track your attendance",
    },
    {
      label: "Report Card",
      icon: ClipboardList,
      href: `/student/academics/report-card?studentId=${studentId}&schoolId=${schoolId}&classId=${classId}&sectionId=${sectionId}`,
      description: "View your academic performance",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {academicsLinks.map((link) => (
        <Link
          href={link.href}
          key={link.label}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <link.icon className="w-8 h-8 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">{link.label}</h3>
              <p className="text-gray-500">{link.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
