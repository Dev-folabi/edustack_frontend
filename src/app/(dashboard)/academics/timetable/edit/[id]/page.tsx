"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import withAuth from '@/components/withAuth';
import { STAFF_ROLES } from '@/constants/roles';
import { useToast } from '@/components/ui/Toast';
import { Loader } from '@/components/ui/Loader';
import { getSectionTimetable, updateTimetable } from '@/services/timetableService';
import { ITimetable } from '@/types/timetable';
import TimetableForm from '@/components/dashboard/academics/timetable/TimetableForm';

const EditTimetablePage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { showToast } = useToast();
  const [timetable, setTimetable] = useState<ITimetable | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await getSectionTimetable(id as string);
        if (res.success && res.data) {
          setTimetable(res.data);
        } else {
          showToast({ type: 'error', title: 'Error', message: res.message });
        }
      } catch (error: any) {
        showToast({ type: 'error', title: 'Error', message: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTimetable();
    }
  }, [id, showToast]);

  const handleSubmit = async (data: any) => {
    try {
      const res = await updateTimetable(id as string, data);
      if (res.success) {
        showToast({ type: 'success', title: 'Success', message: 'Timetable updated successfully' });
        router.push('/academics/timetable');
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message });
      }
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error', message: error.message });
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!timetable) {
    return <div>Timetable not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Timetable</h1>
      <TimetableForm timetable={timetable} onSubmit={handleSubmit} />
    </div>
  );
};

export default withAuth(EditTimetablePage, STAFF_ROLES);
