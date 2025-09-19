"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  studentService,
  PaginatedStudents,
  StudentFilters,
} from "@/services/studentService";
import { useDebounce } from "@/hooks/useDebounce";
import { Student } from "@/types/student";
import { useToast } from "@/components/ui/Toast";
import { useClassStore } from "@/store/classStore";
import withAuth from "@/components/withAuth";
import { UserRole, ADMINS_ROLES } from "@/constants/roles";

// Icons
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Plus,
  Users,
  Filter,
  Eye,
  Edit,
  UserCheck,
  UserX,
  GraduationCap,
  Calendar,
  Mail,
} from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
// import { EditStudentForm } from "@/components/dashboard/student-management/EditStudentForm";

// Define props to accept filter data
interface StudentTableProps {
  classes?: {
    id: string;
    name: string;
    sections: { id: string; name: string }[];
  }[];
}

export const StudentTable = ({ classes = [] }: StudentTableProps) => {
  const router = useRouter();
  const { selectedSchool } = useAuthStore();

  const [students, setStudents] = useState<PaginatedStudents | null>(null);
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { showToast } = useToast();
  const canPerformActions =
    selectedSchool && ADMINS_ROLES.includes(selectedSchool.role as UserRole);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedSchool?.schoolId) return;
      setIsLoading(true);
      try {
        const currentFilters = { ...filters, search: debouncedSearchQuery };
        const res = await studentService.getStudentsBySchool(
          selectedSchool.schoolId,
          currentFilters
        );
        setStudents(res.data || null);
      } catch (error: any) {
        showToast({
          type: "error",
          title: "Error",
          message: error.message || "Failed to fetch students.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSchool?.schoolId, filters, debouncedSearchQuery]);

  const handleFilterChange = (key: keyof StudentFilters, value: string) => {
    const newValue = value === "all" ? null : value;

    if (key === "classId") {
      setSelectedClassId(newValue);
      setFilters((prev) => ({
        ...prev,
        [key]: newValue,
        sectionId: null,
        page: 1,
      }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: newValue, page: 1 }));
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (students?.totalPages || 1)) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleStudentStatus = async (student: Student, isActive: boolean) => {
    try {
      await studentService.updateStudent(student.studentId, { isActive });
      showToast({
        type: "success",
        title: "Success",
        message: `Student ${
          isActive ? "activated" : "deactivated"
        } successfully.`,
      });
      // Refresh the data
      const currentFilters = { ...filters, search: debouncedSearchQuery };
      const res = await studentService.getStudentsBySchool(
        selectedSchool?.schoolId!,
        currentFilters
      );
      setStudents(res.data || null);
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update student status.",
      });
    }
  };

  const handleActionSuccess = () => {
    setEditingStudent(null);
    // Refresh data after successful edit
    setFilters((prev) => ({ ...prev }));
  };

  const paginationItems = useMemo(() => {
    if (!students || students.totalPages <= 1) return [];
    const { currentPage, totalPages } = students;
    const items: (number | string)[] = [];
    const pageRange = 2; // Show 2 pages before and after current page

    // Always show page 1
    items.push(1);

    // Add ellipsis if there's a gap between 1 and the range around current page
    if (currentPage - pageRange > 2) {
      items.push("...");
    }

    // Add pages around current page
    for (let i = Math.max(2, currentPage - pageRange); i <= Math.min(totalPages - 1, currentPage + pageRange); i++) {
      items.push(i);
    }

    // Add ellipsis if there's a gap between the range around current page and the last page
    if (currentPage + pageRange < totalPages - 1) {
      items.push("...");
    }

    // Always show last page (if it's not page 1)
    if (totalPages > 1) {
      items.push(totalPages);
    }

    // Remove duplicates while preserving order
    return items.filter((item, index, arr) => arr.indexOf(item) === index);
  }, [students]);

  const availableSections = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = classes.find((cls) => cls.id === selectedClassId);
    return selectedClass?.sections || [];
  }, [selectedClassId, classes]);

  return (
    <Card className="bg-white shadow-xl rounded-2xl border-0 overflow-hidden ">
      {/* Filters Header */}
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-gray-800">
              Filter Students
            </CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, admission number..."
                className="pl-10 bg-white shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Selects */}
            <div className="flex gap-2">
              <Select
                onValueChange={(value) => handleFilterChange("classId", value)}
                value={filters.classId || "all"}
              >
                <SelectTrigger className="w-[140px] bg-white shadow-sm">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                onValueChange={(value) => handleFilterChange("sectionId", value)}
                value={filters.sectionId || "all"}
                disabled={!selectedClassId}
              >
                <SelectTrigger className="w-[130px] bg-white shadow-sm">
                  <SelectValue placeholder="Section" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {availableSections.map((sec) => (
                    <SelectItem key={sec.id} value={sec.id}>
                      {sec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                onValueChange={(value) => handleFilterChange("gender", value)}
                value={filters.gender || "all"}
              >
                <SelectTrigger className="w-[120px] bg-white shadow-sm">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Results Summary */}
        {students && !isLoading && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600 pl-2 pr-2">
              <span>
                Showing {((students.currentPage - 1) * filters.limit) + 1} to{" "}
                {Math.min(students.currentPage * filters.limit, students.totalItems)} of{" "}
                {students.totalItems} students
              </span>
              <span>{students.totalPages} pages</span>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto p-3">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Student</TableHead>
                <TableHead className="font-semibold text-gray-700">Class & Section</TableHead>
                <TableHead className="font-semibold text-gray-700">Admission</TableHead>
                <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="w-24 h-4" />
                          <Skeleton className="w-16 h-3" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="w-20 h-4" /></TableCell>
                    <TableCell><Skeleton className="w-16 h-4" /></TableCell>
                    <TableCell><Skeleton className="w-32 h-4" /></TableCell>
                    <TableCell><Skeleton className="w-16 h-6 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="w-8 h-8 rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : students?.data.length ? (
                students.data.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={student.photo_url} alt={student.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-300 to-indigo-300 text-white text-sm">
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{student.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {student.currentClass || "N/A"}
                        </span>
                        {student.currentSection && (
                          <Badge variant="outline" className="text-xs">
                            {student.currentSection}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm font-medium">
                          {student.admissionNumber}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(student.admissionDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {student.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={student.isActive ? "default" : "outline"}
                        className={`${
                          student.isActive 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}
                      >
                        {student.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onSelect={() =>
                              router.push(
                                `/student-management/profiles/${student.studentId}`
                              )
                            }
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          {canPerformActions && (
                            <>
                              <DropdownMenuItem
                                onSelect={() => setEditingStudent(student)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleStudentStatus(student, !student.isActive)
                                }
                                className={`cursor-pointer ${
                                  student.isActive 
                                    ? "text-red-600 focus:text-red-600" 
                                    : "text-green-600 focus:text-green-600"
                                }`}
                              >
                                {student.isActive ? (
                                  <UserX className="mr-2 h-4 w-4" />
                                ) : (
                                  <UserCheck className="mr-2 h-4 w-4" />
                                )}
                                {student.isActive ? "Deactivate" : "Activate"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Users className="w-8 h-8" />
                      <p>No students found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {students && students.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Page {students.currentPage} of {students.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(students.currentPage - 1)}
                disabled={!students.prevPage}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {paginationItems.map((item, index) =>
                typeof item === "number" ? (
                  <Button
                    key={index}
                    variant={item === students.currentPage ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(item)}
                  >
                    {item}
                  </Button>
                ) : (
                  <span key={index} className="px-1 text-sm text-gray-400">
                    ...
                  </span>
                )
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(students.currentPage + 1)}
                disabled={!students.nextPage}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Edit Student Dialog */}
      {editingStudent && (
        <Dialog
          open={!!editingStudent}
          onOpenChange={(isOpen) => !isOpen && setEditingStudent(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Student: {editingStudent.name}
              </DialogTitle>
            </DialogHeader>
            {/* Placeholder for EditStudentForm - replace with actual form component */}
            <div className="p-4 text-center text-gray-500">
              <p>EditStudentForm component would be rendered here</p>
              <p className="text-sm mt-2">Student: {editingStudent.name}</p>
              <Button onClick={handleActionSuccess} className="mt-4">
                Close (Demo)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};
