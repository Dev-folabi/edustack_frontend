"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { financeService, PaginatedResponse } from "@/services/financeService";
import {
  FeeCategory,
  CreateFeeCategoryPayload,
  UpdateFeeCategoryPayload,
} from "@/types/finance";
import { useToast } from "@/components/ui/Toast";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  FileText,
  Eye,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const FeeTypesTable = () => {
  const { selectedSchool } = useAuthStore();
  const { showToast } = useToast();

  const [feeCategories, setFeeCategories] =
    useState<PaginatedResponse<FeeCategory> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedFeeCategory, setSelectedFeeCategory] =
    useState<FeeCategory | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });

  const fetchFeeCategories = async () => {
    if (!selectedSchool?.schoolId) return;
    setIsLoading(true);
    try {
      const res = await financeService.getFeeCategories(
        selectedSchool.schoolId
      );
      setFeeCategories(res?.data ?? null);
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to fetch fee categories.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeCategories();
  }, [selectedSchool?.schoolId]);

  const handleModalOpen = (feeCategory: FeeCategory | null = null) => {
    setSelectedFeeCategory(feeCategory);
    setFormData(
      feeCategory
        ? { name: feeCategory.name, description: feeCategory.description }
        : { name: "", description: "" }
    );
    setIsModalOpen(true);
  };

  const handleDetailsModalOpen = (feeCategory: FeeCategory) => {
    setSelectedFeeCategory(feeCategory);
    setIsDetailsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedFeeCategory(null);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedFeeCategory(null);
  };

  const handleSubmit = async () => {
    if (!selectedSchool?.schoolId) return;

    try {
      if (selectedFeeCategory) {
        const payload: UpdateFeeCategoryPayload = {
          name: formData.name,
          description: formData.description,
        };
        await financeService.updateFeeCategory(selectedFeeCategory.id, payload);
        showToast({
          type: "success",
          title: "Success",
          message: "Fee category updated successfully.",
        });
      } else {
        const payload: CreateFeeCategoryPayload = {
          ...formData,
          schoolId: selectedSchool.schoolId,
        };
        await financeService.createFeeCategory(payload);
        showToast({
          type: "success",
          title: "Success",
          message: "Fee category created successfully.",
        });
      }
      fetchFeeCategories();
      handleModalClose();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to save fee category.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await financeService.deleteFeeCategory(id);
      showToast({
        type: "success",
        title: "Success",
        message: "Fee category deleted successfully.",
      });
      fetchFeeCategories();
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to delete fee category.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Fee Types</CardTitle>
          <Button onClick={() => handleModalOpen()}>
            <Plus className="mr-2 h-4 w-4" />
            Create Fee Type
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : feeCategories?.data.length ? (
              feeCategories.data.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
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
                          onSelect={() => handleDetailsModalOpen(category)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleModalOpen(category)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onSelect={() => handleDelete(category.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No fee categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFeeCategory ? "Edit" : "Create"} Fee Type
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fee Category Details</DialogTitle>
          </DialogHeader>
          {selectedFeeCategory && (
            <div className="p-4">
              <p>
                <strong>Name:</strong> {selectedFeeCategory.name}
              </p>
              <p>
                <strong>Description:</strong> {selectedFeeCategory.description}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
