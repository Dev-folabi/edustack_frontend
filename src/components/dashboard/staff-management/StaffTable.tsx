"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import {
  staffService,
  PaginatedStaff,
  StaffFilters,
} from "@/services/staffService";
import { useDebounce } from "@/hooks/useDebounce";
import { Staff } from "@/types/staff";
import { useToast } from "@/components/ui/Toast";
import { UserRole, ADMINS_ROLES } from "@/constants/roles";

// Icons
import {
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Filter,
  Eye,
  UserCheck,
  UserX,
  Briefcase,
  Mail,
  Phone,
} from "lucide-react";

// UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const roles = ["all", "admin", "teacher", "finance", "librarian"];

export const StaffTable = () => {
  const router = useRouter();
  const { selectedSchool } = useAuthStore();

  const [staff, setStaff] = useState<PaginatedStaff | null>(null);
  const [filters, setFilters] = useState<StaffFilters>({
    page: 1,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { showToast } = useToast();
  const canPerformActions =
    selectedSchool && ADMINS_ROLES.includes(selectedSchool.role as UserRole);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!selectedSchool?.schoolId) return;
      setIsLoading(true);
      try {
        const currentFilters = { ...filters };
        const res = await staffService.getStaffBySchool(
          selectedSchool.schoolId,
          currentFilters
        );
        setStaff(res.data || null);
      } catch (error: unknown) {
        showToast({
          type: "error",
          title: "Error",
          message:
            error instanceof Error ? error.message : "Failed to fetch staff.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaff();
  }, [selectedSchool?.schoolId, filters, debouncedSearchQuery, showToast]);

  const handleFilterChange = (key: keyof StaffFilters, value: string) => {
    const newValue = value === "all" ? undefined : value;
    setFilters((prev) => ({ ...prev, [key]: newValue, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (staff?.totalPages || 1)) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleStaffStatus = async (staffMember: Staff, isActive: boolean) => {
    try {
      await staffService.updateStaff(staffMember?.user?.staff?.id, {
        isActive,
      });
      showToast({
        type: "success",
        title: "Success",
        message: `Staff ${
          isActive ? "activated" : "deactivated"
        } successfully.`,
      });
      // Refresh the data
      const currentFilters = {
        ...filters,
        name: debouncedSearchQuery,
        email: debouncedSearchQuery,
      };
      const res = await staffService.getStaffBySchool(
        selectedSchool?.schoolId || "",
        currentFilters
      );
      setStaff(res.data || null);
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to update staff status.",
      });
    }
  };

  const paginationItems = useMemo(() => {
    if (!staff || staff.totalPages <= 1) return [];
    const { currentPage, totalPages } = staff;
    const items: (number | string)[] = [];
    const pageRange = 2;

    items.push(1);
    if (currentPage - pageRange > 2) {
      items.push("...");
    }
    for (
      let i = Math.max(2, currentPage - pageRange);
      i <= Math.min(totalPages - 1, currentPage + pageRange);
      i++
    ) {
      items.push(i);
    }
    if (currentPage + pageRange < totalPages - 1) {
      items.push("...");
    }
    if (totalPages > 1) {
      items.push(totalPages);
    }
    return items.filter((item, index, arr) => arr.indexOf(item) === index);
  }, [staff]);

  return (
    <Card className="bg-white shadow-xl rounded-2xl border-0 overflow-hidden ">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-gray-800">
              Filter Staff
            </CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email..."
                className="pl-10 bg-white shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select
                onValueChange={(value) => handleFilterChange("role", value)}
                value={filters.role || "all"}
              >
                <SelectTrigger className="w-[140px] bg-white shadow-sm">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {staff && !isLoading && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600 pl-2 pr-2">
              <span>
                Showing {(staff.currentPage - 1) * filters.limit! + 1} to{" "}
                {Math.min(staff.currentPage * filters.limit!, staff.totalItems)}{" "}
                of {staff.totalItems} staff
              </span>
              <span>{staff.totalPages} pages</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto p-3">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>Staff</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-20 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-32 h-4" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-16 h-6 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="w-8 h-8 rounded ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : staff?.data.length ? (
                (console.log(staff.data),
                staff.data.map((staffMember) => (
                  <TableRow
                    key={staffMember?.user?.staff?.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={staffMember?.user?.staff?.photo_url}
                            alt={staffMember?.user?.staff?.name}
                          />
                          <AvatarFallback>
                            {staffMember?.user?.staff?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">
                            {staffMember?.user?.staff?.name}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {staffMember.role}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {staffMember?.user?.staff?.email}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          {staffMember?.user?.staff?.phone.join(", ")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          staffMember?.user?.staff?.isActive
                            ? "default"
                            : "outline"
                        }
                        className={`${
                          staffMember?.user?.staff?.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {staffMember?.user?.staff?.isActive
                          ? "Active"
                          : "Inactive"}
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
                                `/staff-management/profiles/${staffMember?.user.staff.id}`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          {canPerformActions && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleStaffStatus(
                                    staffMember,
                                    !staffMember?.user?.staff?.isActive
                                  )
                                }
                                className={
                                  staffMember?.user?.staff?.isActive
                                    ? "text-red-500"
                                    : "text-green-500"
                                }
                              >
                                {staffMember?.user?.staff?.isActive ? (
                                  <UserX className="mr-2 h-4 w-4" />
                                ) : (
                                  <UserCheck className="mr-2 h-4 w-4" />
                                )}
                                {staffMember?.user?.staff?.isActive
                                  ? "Deactivate"
                                  : "Activate"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Users className="w-8 h-8" />
                      <p>No staff found</p>
                      <p className="text-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {staff && staff.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Page {staff.currentPage} of {staff.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(staff.currentPage - 1)}
                disabled={!staff.prevPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {paginationItems.map((item, index) =>
                typeof item === "number" ? (
                  <Button
                    key={index}
                    variant={item === staff.currentPage ? "default" : "outline"}
                    size="sm"
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
                onClick={() => handlePageChange(staff.currentPage + 1)}
                disabled={!staff.nextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
