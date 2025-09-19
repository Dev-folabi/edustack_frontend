"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { studentService, PaginatedStudents, StudentFilters } from "@/services/studentService";
import { Student } from "@/types/student";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { EditStudentForm } from "./EditStudentForm";
import { ADMINS_ROLES } from "@/constants/roles";

export const StudentTable = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const [students, setStudents] = useState<PaginatedStudents | null>(null);
  const [filters, setFilters] = useState<StudentFilters>({ page: 1, limit: 10 });
  const [isLoading, setIsLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const canPerformActions = user && ADMINS_ROLES.includes(user.role);

  const fetchStudents = async () => {
    if (!user?.schoolId) return;
    setIsLoading(true);
    try {
      const res = await studentService.getStudentsBySchool(user.schoolId, filters);
      setStudents(res.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch students.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.schoolId) {
      fetchStudents();
    }
  }, [user?.schoolId, filters.page]);

  const handleFilterChange = (key: keyof StudentFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = () => {
    fetchStudents();
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleDeactivate = async (studentId: string) => {
    if (!confirm("Are you sure you want to deactivate this student?")) return;

    try {
      await studentService.updateStudent(studentId, { isActive: false });
      toast.success("Student deactivated successfully.");
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || "Failed to deactivate student.");
    }
  };

  const handleEditSuccess = () => {
    setEditingStudent(null);
    fetchStudents();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
        <Input
          placeholder="Filter by Name..."
          onChange={(e) => handleFilterChange('name', e.target.value)}
        />
        <Input
          placeholder="Filter by Admission No..."
          onChange={(e) => handleFilterChange('admissionNumber', e.target.value)}
        />
        <Input
          placeholder="Filter by Email..."
          onChange={(e) => handleFilterChange('email', e.target.value)}
        />
        <Select onValueChange={(value) => handleFilterChange('gender', value)}>
          <SelectTrigger><SelectValue placeholder="Filter by Gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} className="md:col-span-4">Search</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Admission No</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center">Loading...</TableCell></TableRow>
            ) : students?.data.length ? (
              students.data.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.admission_number}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.class?.name} - {student.section?.name}</TableCell>
                  <TableCell>{student.isActive ? "Active" : "Inactive"}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/student-management/profiles/${student.id}`)}>View Profile</DropdownMenuItem>
                        {canPerformActions && (
                          <>
                            <DropdownMenuItem onClick={() => setEditingStudent(student)}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeactivate(student.id)} className="text-red-600">Deactivate</DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={6} className="text-center">No students found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(students?.prevPage || 1)}
          disabled={!students?.prevPage}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {students?.currentPage || 1} of {students?.totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(students?.nextPage || 1)}
          disabled={!students?.nextPage}
        >
          Next
        </Button>
      </div>

      {editingStudent && (
        <Dialog open={!!editingStudent} onOpenChange={(isOpen) => !isOpen && setEditingStudent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student: {editingStudent.name}</DialogTitle>
            </DialogHeader>
            <EditStudentForm student={editingStudent} onSuccess={handleEditSuccess} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
