"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subjectService, staffService, Subject, Teacher } from '@/services/subjectService';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/constants/roles';
import { PlusCircle, Pencil, Trash2, UserPlus } from 'lucide-react';

const SubjectsList = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [isAssignTeacherDialogOpen, setIsAssignTeacherDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedSchool } = useAuthStore.getState();
  const userRole = selectedSchool?.role;
  const canManage = userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;

  const fetchSubjects = useCallback(async () => {
    if (!selectedSchool) return;
    try {
      setLoading(true);
      const response = await subjectService.getSubjects({ schoolId: selectedSchool.id });
      if (response.success) {
        setSubjects(response.data.data);
      } else {
        throw new Error(response.message);
      }
      setError(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch subjects');
      setError('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  }, [selectedSchool]);

  const fetchTeachers = useCallback(async () => {
    if (!selectedSchool) return;
    try {
      const response = await staffService.getAllStaff(selectedSchool.id);
      if (response.success) {
        const teacherList = response.data.data
          .filter((staff: any) => staff.user.role === UserRole.TEACHER)
          .map((staff: any) => ({ id: staff.id, name: staff.user.name }));
        setTeachers(teacherList);
      }
    } catch (error) {
      toast.error('Failed to fetch teachers');
    }
  }, [selectedSchool]);

  useEffect(() => {
    fetchSubjects();
    if (canManage) {
      fetchTeachers();
    }
  }, [fetchSubjects, fetchTeachers, canManage]);

  const handleAssignTeacher = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsAssignTeacherDialogOpen(true);
  };

  const handleConfirmAssignTeacher = async () => {
    if (!selectedSubject || !selectedTeacher) {
      toast.error('Please select a teacher.');
      return;
    }
    try {
      await subjectService.assignTeacher(selectedSubject.id, selectedTeacher);
      toast.success('Teacher assigned successfully');
      setIsAssignTeacherDialogOpen(false);
      fetchSubjects();
    } catch (error) {
      toast.error('Failed to assign teacher');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectService.deleteSubject(id);
        toast.success('Subject deleted successfully');
        fetchSubjects();
      } catch (error) {
        toast.error('Failed to delete subject');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
            {canManage && (
                <Button onClick={() => router.push('/academics/subjects/create')} className="inline-flex items-center gap-2">
                    <PlusCircle size={18} />
                    Add Subject
                </Button>
            )}
        </div>
        <div className="p-6">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-100">
                            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
                            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</TableHead>
                            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</TableHead>
                            <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                            {canManage && <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                        {subjects.map((subject) => (
                        <TableRow key={subject.id}>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.name}</TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.code}</TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.teacher || 'Unassigned'}</TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                                <Badge variant={subject.isActive ? 'default' : 'destructive'}>
                                    {subject.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </TableCell>
                            {canManage && (
                            <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-4">
                                    <button onClick={() => router.push(`/academics/subjects/edit/${subject.id}`)} className="flex items-center gap-1 text-gray-500 transition-colors hover:text-blue-600">
                                        <Pencil size={16} />
                                        Edit
                                    </button>
                                    <button onClick={() => handleAssignTeacher(subject)} className="flex items-center gap-1 text-gray-500 transition-colors hover:text-blue-600">
                                        <UserPlus size={16} />
                                        Assign Teacher
                                    </button>
                                    <button onClick={() => handleDelete(subject.id)} className="flex items-center gap-1 text-red-500 transition-colors hover:text-red-700">
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>
                            </TableCell>
                            )}
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>

        {canManage && (
            <Dialog open={isAssignTeacherDialogOpen} onOpenChange={setIsAssignTeacherDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Assign Teacher to {selectedSubject?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Select onValueChange={setSelectedTeacher}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAssignTeacherDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmAssignTeacher}>Confirm</Button>
                    </div>
                </DialogContent>
            </Dialog>
        )}
    </div>
  );
};

export default SubjectsList;
