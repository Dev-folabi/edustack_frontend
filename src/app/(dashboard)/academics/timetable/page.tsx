"use client";

import React, { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import { STAFF_ROLES, UserRole } from '@/constants/roles';
import { useAuthStore } from '@/store/authStore';
import { getSchoolTimetables, getSectionTimetable } from '@/services/timetableService';
import { ITimetable } from '@/types/timetable';
import TimetableListView from '@/components/dashboard/academics/timetable/TimetableListView';
import TimetableGridView from '@/components/dashboard/academics/timetable/TimetableGridView';
import ClassAndSectionSelector from '@/components/dashboard/academics/timetable/ClassAndSectionSelector';
import { useToast } from '@/components/ui/Toast';
import { Loader } from '@/components/ui/Loader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteTimetable, deleteTimetableEntry, updateTimetableEntry } from '@/services/timetableService';
import { useRouter } from 'next/navigation';
import { subjectService, Subject } from '@/services/subjectService';
import TimetableForm from '@/components/dashboard/academics/timetable/TimetableForm';
import { staffService } from '@/services/staffService';
import { Staff } from '@/types/staff';
import { useClassStore } from '@/store/classStore';

const TimetablePage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const [timetables, setTimetables] = useState<ITimetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<ITimetable | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const { classes, fetchClasses } = useClassStore();
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [isDeleting, setIsDeleting] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState<ITimetable | null>(null);
  const [isDeletingEntry, setIsDeletingEntry] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<any | null>(null);
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<any | null>(null);

  const fetchTimetables = async () => {
    if (user?.schoolId) {
      try {
        setIsLoading(true);
        const [timetableRes, subjectRes, staffRes] = await Promise.all([
          getSchoolTimetables(user.schoolId),
          subjectService.getSubjects({ schoolId: user.schoolId }),
          staffService.getStaffBySchool(user.schoolId)
        ]);

        if (timetableRes.success) {
          setTimetables(timetableRes.data || []);
        } else {
          showToast({ type: 'error', title: 'Error', message: timetableRes.message });
        }

        if (subjectRes.success) {
          setSubjects(subjectRes.data.data || []);
        } else {
          showToast({ type: 'error', title: 'Error', message: subjectRes.message });
        }

        if (staffRes.success) {
          setStaff(staffRes.data.data || []);
        } else {
          showToast({ type: 'error', title: 'Error', message: staffRes.message });
        }
      } catch (error: any) {
        showToast({ type: 'error', title: 'Error', message: error.message });
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user?.schoolId) {
      fetchClasses(user.schoolId);
    }
    fetchTimetables();
  }, [user]);

  const handleView = (timetable: ITimetable) => {
    setSelectedTimetable(timetable);
    setView('grid');
  };

  const handleSelectionChange = async (classId: string, sectionId: string) => {
    try {
      setIsLoading(true);
      const res = await getSectionTimetable(sectionId);
      if (res.success && res.data) {
        setSelectedTimetable(res.data);
        setView('grid');
      } else {
        showToast({ type: 'error', title: 'Error', message: res.message });
      }
    } catch (error: any) {
      showToast({ type: 'error', title: 'Error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedTimetable(null);
    setView('list');
    fetchTimetables();
  };

  const handleEdit = (timetable: ITimetable) => {
    router.push(`/academics/timetable/edit/${timetable.id}`);
  };

  const handleDelete = (timetable: ITimetable) => {
    setTimetableToDelete(timetable);
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    if (timetableToDelete) {
      try {
        const res = await deleteTimetable(timetableToDelete.id);
        if (res.success) {
          showToast({ type: 'success', title: 'Success', message: res.message });
          fetchTimetables();
        } else {
          showToast({ type: 'error', title: 'Error', message: res.message });
        }
      } catch (error: any) {
        showToast({ type: 'error', title: 'Error', message: error.message });
      } finally {
        setIsDeleting(false);
        setTimetableToDelete(null);
      }
    }
  };

  const handleDeleteEntry = (entry: any) => {
    setEntryToDelete(entry);
    setIsDeletingEntry(true);
  };

  const confirmDeleteEntry = async () => {
    if (entryToDelete) {
      try {
        const res = await deleteTimetableEntry(entryToDelete.id);
        if (res.success) {
          showToast({ type: 'success', title: 'Success', message: res.message });
          // Refresh the timetable view
          if (selectedTimetable) {
            handleSelectionChange(selectedTimetable.classId, selectedTimetable.sectionId);
          }
        } else {
          showToast({ type: 'error', title: 'Error', message: res.message });
        }
      } catch (error: any) {
        showToast({ type: 'error', title: 'Error', message: error.message });
      } finally {
        setIsDeletingEntry(false);
        setEntryToDelete(null);
      }
    }
  };

  const handleEditEntry = (entry: any) => {
    setEntryToEdit(entry);
    setIsEditingEntry(true);
  };

  const confirmEditEntry = async (data: any) => {
    if (entryToEdit) {
      try {
        const res = await updateTimetableEntry(entryToEdit.id, data);
        if (res.success) {
          showToast({ type: 'success', title: 'Success', message: 'Timetable entry updated successfully' });
          // Refresh the timetable view
          if (selectedTimetable) {
            handleSelectionChange(selectedTimetable.classId, selectedTimetable.sectionId);
          }
        } else {
          showToast({ type: 'error', title: 'Error', message: res.message });
        }
      } catch (error: any) {
        showToast({ type: 'error', title: 'Error', message: error.message });
      } finally {
        setIsEditingEntry(false);
        setEntryToEdit(null);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Timetable</h1>
        {view === 'grid' && (
          <button onClick={handleBackToList} className="text-indigo-600 hover:text-indigo-900">
            &larr; Back to List
          </button>
        )}
      </div>

      {view === 'list' && (
        <ClassAndSectionSelector onSelectionChange={handleSelectionChange} />
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <>
          {view === 'list' ? (
            <TimetableListView
              timetables={timetables}
              classes={classes}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            selectedTimetable && (
              <TimetableGridView
                timetable={selectedTimetable}
                subjects={subjects}
                staff={staff}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
              />
            )
          )}
        </>
      )}

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the timetable.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTimetableToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeletingEntry} onOpenChange={setIsDeletingEntry}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the timetable entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEntryToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEntry}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditingEntry} onOpenChange={setIsEditingEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Timetable Entry</DialogTitle>
          </DialogHeader>
          {entryToEdit && (
            <TimetableForm entry={entryToEdit} isEntryForm={true} onSubmit={confirmEditEntry} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withAuth(TimetablePage, [...STAFF_ROLES, UserRole.STUDENT, UserRole.PARENT]);
