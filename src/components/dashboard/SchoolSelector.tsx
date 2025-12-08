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
import { useRouter } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/constants/routes";
import { UserRole } from "@/constants/roles";

const SchoolSelector = () => {
  const { userSchools, selectedSchool, setSelectedSchool, isLoading } =
    useAuthStore();
  const router = useRouter();

  if (isLoading) {
    return <Skeleton className="h-10 w-[180px]" />;
  }

  if (!userSchools || userSchools.length < 0) {
    return null;
  }

  const handleSchoolChange = (schoolId: string) => {
    const school = userSchools.find((s) => s.schoolId === schoolId);
    if (school) {
      setSelectedSchool(school);
      const role = school.role;
      if (
        role &&
        [
          UserRole.ADMIN,
          UserRole.TEACHER,
          UserRole.FINANCE,
          UserRole.SUPER_ADMIN,
        ].includes(role as UserRole)
      ) {
        router.push(DASHBOARD_ROUTES.PROFILE);
      }
      if (role && [UserRole.STUDENT, UserRole.PARENT].includes(role as UserRole)) {
        router.push(DASHBOARD_ROUTES.STUDENT_PROFILE);
      }
    }
  };

  return (
    <Select
      value={selectedSchool?.schoolId || ""}
      onValueChange={handleSchoolChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a school" />
      </SelectTrigger>
      <SelectContent>
        {userSchools.map((school) => (
          <SelectItem key={school.schoolId || ""} value={school.schoolId || ""}>
            {school.school?.name || ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SchoolSelector;
