"use client";

import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from 'lucide-react';

const SchoolSelector = () => {
  const { userSchools, selectedSchool, setSelectedSchool, schools, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="w-[180px] h-10 flex items-center justify-center"><Loader className="animate-spin" /></div>;
  }

  if (!userSchools || userSchools.length === 0) {
    return null;
  }

  if (!selectedSchool) {
      return null;
  }

  const getSchoolName = (schoolId: string) => {
    const school = schools.find(s => s.id === schoolId);
    return school ? school.name : schoolId;
  };

  return (
    <Select
      value={selectedSchool.schoolId}
      onValueChange={(schoolId) => {
        const school = userSchools.find(s => s.schoolId === schoolId);
        if (school) {
          setSelectedSchool(school);
        }
      }}
    >
      <SelectTrigger className="w-full md:w-[180px]">
        <SelectValue placeholder="Select a school">
          {getSchoolName(selectedSchool.schoolId)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {userSchools.map((userSchool) => (
          <SelectItem key={userSchool.schoolId} value={userSchool.schoolId}>
            {getSchoolName(userSchool.schoolId)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SchoolSelector;
