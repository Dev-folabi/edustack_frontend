"use client";

import { useAuthStore } from "@/store/authStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const SchoolSelector = () => {
  const { userSchools, selectedSchool, setSelectedSchool, isLoading } =
    useAuthStore();

  if (isLoading) {
    return <Skeleton className="h-10 w-[180px]" />;
  }

  if (!userSchools || userSchools.length < 0) {
    return null;
  }

  return (
    <Select
      value={selectedSchool?.schoolId || ""}
      onValueChange={(schoolId) => {
        const school = userSchools.find((s) => s.schoolId === schoolId);
        if (school) {
          setSelectedSchool(school);
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a school" />
      </SelectTrigger>
      <SelectContent>
        {userSchools.map((school) => (
          <SelectItem key={school.schoolId} value={school.schoolId}>
            {school.school.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SchoolSelector;
