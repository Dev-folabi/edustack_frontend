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

// Icons
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Reusable UI Components (e.g., from shadcn/ui)
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
import { EditStudentForm } from "./EditStudentForm";
import { ADMINS_ROLES, UserRole } from "@/constants/roles";
import { Loader } from "@/components/ui/Loader";

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
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    null
  );

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
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to deactivate student.",
      });
    }
  };
  const handleActionSuccess = () => {
    setEditingStudent(null);
    setFilters((prev) => ({ ...prev }));
  };

  const paginationItems = useMemo(() => {
    if (!students || students.totalPages <= 1) return [];
    const { currentPage, totalPages } = students;
    const items: (number | string)[] = [];
    const pageRange = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - pageRange && i <= currentPage + pageRange)
      ) {
        if (items[items.length - 1] !== i) items.push(i);
      } else if (items[items.length - 1] !== "...") {
        items.push("...");
      }
    }
    return items;
  }, [students]);

  const availableSections = useMemo(() => {
    if (!selectedClassId) return [];
    const selectedClass = classes.find((cls) => cls.id === selectedClassId);
    return selectedClass?.sections || [];
  }, [selectedClassId, classes]);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
      {/* ## Responsive Filters & Search Bar ## */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, class, etc..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            onValueChange={(value) => handleFilterChange("classId", value)}
            value={filters.classId || "all"}
          >
            <SelectTrigger className="w-[160px]">
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Sections" />
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
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Genders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ## Responsive Table Container ## */}
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Adm No.</TableHead>
              <TableHead>Adm Date</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <Loader className="h-4 w-4 animate-spin" />
                  </div>
                </TableCell>
              </TableRow>
            ) : students?.data.length ? (
              students.data.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{`${student.currentClass || "N/A"} - ${
                    student.currentSection || "N/A"
                  }`}</TableCell>
                  <TableCell>{student.admissionNumber}</TableCell>
                  <TableCell>
                    {new Date(student.admissionDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>
                    <Badge variant={student.isActive ? "default" : "outline"}>
                      {student.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onSelect={() =>
                            router.push(
                              `/student-management/profiles/${student.studentId}`
                            )
                          }
                        >
                          View Profile
                        </DropdownMenuItem>
                        {canPerformActions && (
                          <>
                            <DropdownMenuItem
                              onSelect={() => setEditingStudent(student)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              onSelect={() =>
                                handleStudentStatus(student, !student.isActive)
                              }
                              className={`text-${
                                student.isActive ? "destructive" : "success"
                              }`}
                            >
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
                <TableCell colSpan={7} className="h-24 text-center">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ## Pagination Section ## */}
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(students?.currentPage - 1)}
          disabled={!students?.prevPage}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {paginationItems.map((item, index) =>
          typeof item === "number" ? (
            <Button
              key={index}
              variant={item === students?.currentPage ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePageChange(item)}
            >
              {item}
            </Button>
          ) : (
            <span key={index} className="px-1 text-sm">
              ...
            </span>
          )
        )}
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handlePageChange(students?.currentPage + 1)}
          disabled={!students?.nextPage}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ## Edit Student Dialog (Modal) ## */}
      {editingStudent && (
        <Dialog
          open={!!editingStudent}
          onOpenChange={(isOpen) => !isOpen && setEditingStudent(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit: {editingStudent.name}</DialogTitle>
            </DialogHeader>
            <EditStudentForm
              student={editingStudent}
              onSuccess={handleActionSuccess}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
