"use client";

import React, { useState, useEffect } from "react";
import { useSchoolStore, School } from "@/store/schoolStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserShield,
} from "react-icons/fa";
import Link from "next/link";
import { DASHBOARD_ROUTES } from "@/constants/routes";
import { useToast } from "@/components/ui/Toast";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { Skeleton } from "@/components/ui/skeleton";
import { EditSchoolModal } from "@/components/dashboard/schools/EditSchoolModal";

const SchoolCardSkeleton = () => (
  <Card className="flex flex-col">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
    </CardHeader>
    <CardContent className="flex-grow space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </CardContent>
    <CardFooter className="p-4 border-t flex justify-end">
      <Skeleton className="h-8 w-20" />
    </CardFooter>
  </Card>
);

const SchoolsPage = () => {
  const { schools, fetchSchools, updateSchool, deleteSchool, isLoading } =
    useSchoolStore();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleToggleActive = async (school: School) => {
    try {
      await updateSchool(school.id, { isActive: !school.isActive });
      showToast({
        title: "Success",
        message: `School has been ${
          !school.isActive ? "activated" : "deactivated"
        }.`,
        type: "success",
      });
    } catch (error) {
      showToast({
        title: "Error",
        message: "Failed to update school status.",
        type: "error",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!schoolToDelete) return;
    try {
      await deleteSchool(schoolToDelete.id);
      showToast({
        title: "Success",
        message: "School deleted successfully.",
        type: "success",
      });
      setSchoolToDelete(null);
    } catch (error) {
      showToast({
        title: "Error",
        message: "Failed to delete school.",
        type: "error",
      });
    }
  };

  const filteredSchools = schools.filter((school) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Actions = ({ school }: { school: School }) => (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <span className="text-sm">
          {school.isActive ? "Active" : "Inactive"}
        </span>
        <Switch
          checked={school.isActive}
          onCheckedChange={() => handleToggleActive(school)}
          aria-label="Toggle Active Status"
        />
      </div>
      <EditSchoolModal school={school}>
        <Button variant="outline" size="icon">
          <FaEdit />
        </Button>
      </EditSchoolModal>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setSchoolToDelete(school)}
        >
          <FaTrash />
        </Button>
      </AlertDialogTrigger>
    </div>
  );

  const SchoolGrid = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredSchools.map((school) => (
        <Card
          key={school.id}
          className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <CardHeader className="bg-gray-50 p-4 border-b">
            <CardTitle className="text-lg font-bold text-gray-800">
              {school.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <FaEnvelope className="mr-2" />
              <span>{school.email}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <FaMapMarkerAlt className="mr-2" />
              <span>{school.address}</span>
            </div>
            <div className="flex items-start text-sm text-gray-600">
              <FaPhone className="mr-2 mt-1" />
              <div>
                {school.phone.map((p, i) => (
                  <span key={i} className="block">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            {school.userSchools && school.userSchools.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Admins:
                </h4>
                {school.userSchools
                  .filter((us) => us.user?.staff)
                  .map((userSchool, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-600 mb-1"
                    >
                      <FaUserShield className="mr-2 text-blue-500" />
                      <span> {userSchool.user?.staff?.name}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 border-t bg-gray-50 flex justify-end">
            <Actions school={school} />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <AlertDialog>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Schools Management</h1>
          <Link href={DASHBOARD_ROUTES.CREATE_SCHOOL}>
            <Button>
              <FaPlus className="mr-2" /> Add New School
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <SchoolCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <SchoolGrid />
        )}
      </div>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            school and all of its associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSchoolToDelete(null)}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default withAuth(SchoolsPage, [UserRole.SUPER_ADMIN]);
