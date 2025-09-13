"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subjectService, staffService, Subject, Teacher } from '@/services/subjectService';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/constants/roles';


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

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const response = await subjectService.getSubjects();
        setSubjects(response.data);
        setError(null);
      } catch (error) {
        toast.error('Failed to fetch subjects');
        setError('Failed to fetch subjects');
      } finally {
        setLoading(false);
      }
    };

    const fetchTeachers = async () => {
        try {
          const response = await staffService.getAllStaff();
          const teacherList = response.data
            .filter((staff: any) => staff.user.role === UserRole.TEACHER)
            .map((staff: any) => ({ id: staff.id, name: staff.name }));
          setTeachers(teacherList);
        } catch (error) {
          toast.error('Failed to fetch teachers');
        }
      };

    fetchSubjects();
    fetchTeachers();
  }, []);

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
      // Refresh subjects list
      const response = await subjectService.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      toast.error('Failed to assign teacher');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectService.deleteSubject(id);
        toast.success('Subject deleted successfully');
        setSubjects(subjects.filter((s) => s.id !== id));
      } catch (error) {
        toast.error('Failed to delete subject');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Subjects</CardTitle>
          {canManage && (
            <Button onClick={() => router.push('/academics/subjects/create')}>
              Add Subject
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.code}</TableCell>
                <TableCell>{subject.className}</TableCell>
                <TableCell>{subject.teacher}</TableCell>
                <TableCell>
                  <Badge variant={subject.isActive ? 'default' : 'destructive'}>
                    {subject.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                {canManage && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => router.push(`/academics/subjects/edit/${subject.id}`)}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAssignTeacher(subject)}>
                          Assign Teacher
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(subject.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {canManage && (
        <Dialog open={isAssignTeacherDialogOpen} onOpenChange={setIsAssignTeacherDialogOpen}>
          <DialogContent>
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
    </Card>
  );
};

export default SubjectsList;
