"use client";

import React, { useEffect } from 'react';
import { useSchoolStore } from '@/store/schoolStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const SchoolSelector = () => {
  const { schools, selectedSchool, fetchSchools, setSelectedSchool, isLoading } = useSchoolStore();

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  if (isLoading) {
    return <Skeleton className="h-10 w-[180px]" />;
  }

  if (!selectedSchool) {
    return null;
  }

  return (
    <Select
      value={selectedSchool.id}
      onValueChange={(schoolId) => {
        const school = schools.find(s => s.id === schoolId);
        if (school) {
          setSelectedSchool(school);
        }
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a school" />
      </SelectTrigger>
      <SelectContent>
        {schools.map((school) => (
          <SelectItem key={school.id} value={school.id}>
            {school.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SchoolSelector;
