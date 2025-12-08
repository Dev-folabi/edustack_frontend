"use client";

import React, { useState } from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financeService } from "@/services/financeService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import ExpenseForm from "@/components/finance/ExpenseForm";
import { Expense } from "@/types/finance";
import { useToast } from "@/components/ui/Toast";
import {
  DollarSign,
  Search,
  Filter,
  Plus,
  Loader2,
  FileText,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Package,
  Receipt,
} from "lucide-react";

const ExpensesPage = () => {
  const { selectedSchool } = useAuthStore();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["expenses", selectedSchool?.schoolId, page],
    queryFn: () =>
      financeService.getExpenses(selectedSchool?.schoolId || "", page, 10),
    enabled: !!selectedSchool?.schoolId,
  });

  const createMutation = useMutation({
    mutationFn: financeService.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      showToast({
        type: "success",
        title: "Success",
        message: "Expense created successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "Failed to create expense",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      financeService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      showToast({
        type: "success",
        title: "Success",
        message: "Expense updated successfully",
      });
      setIsDialogOpen(false);
      setSelectedExpense(undefined);
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "Failed to update expense",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: financeService.deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      showToast({
        type: "success",
        title: "Success",
        message: "Expense deleted successfully",
      });
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    },
    onError: (error: any) => {
      showToast({
        type: "error",
        title: "Error",
        message: error?.response?.data?.message || "Failed to delete expense",
      });
    },
  });

  const handleSubmit = (values: any) => {
    if (selectedExpense) {
      updateMutation.mutate({ id: selectedExpense.id, data: values });
    } else {
      createMutation.mutate({ ...values, schoolId: selectedSchool?.schoolId });
    }
  };

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteMutation.mutate(expenseToDelete.id);
    }
  };

  const getCategoryConfig = (category: string) => {
    const configs: {
      [key: string]: { color: string; label: string; icon: any };
    } = {
      SUPPLIES: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        label: "Supplies",
        icon: Package,
      },
      UTILITIES: {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Utilities",
        icon: DollarSign,
      },
      MAINTENANCE: {
        color: "bg-orange-100 text-orange-800 border-orange-300",
        label: "Maintenance",
        icon: FileText,
      },
      SALARY: {
        color: "bg-blue-100 text-blue-800 border-blue-300",
        label: "Salary",
        icon: DollarSign,
      },
      OTHER: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        label: "Other",
        icon: FileText,
      },
    };
    return configs[category] || configs.OTHER;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredExpenses =
    data?.data?.data?.filter((expense: Expense) => {
      const matchesSearch =
        expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || expense.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }) || [];

  // Calculate summary stats
  const stats = React.useMemo(() => {
    const allExpenses = data?.data?.data || [];
    return {
      total: allExpenses.reduce((sum: number, e: Expense) => sum + e.amount, 0),
      count: allExpenses.length,
      thisMonth: allExpenses
        .filter((e: Expense) => {
          const expenseDate = new Date(e.expenseDate);
          const now = new Date();
          return (
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()
          );
        })
        .reduce((sum: number, e: Expense) => sum + e.amount, 0),
    };
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Expense Management
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage all school expenses
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setSelectedExpense(undefined)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {selectedExpense ? "Edit Expense" : "Add New Expense"}
                </DialogTitle>
              </DialogHeader>
              <ExpenseForm
                onSubmit={handleSubmit}
                initialValues={selectedExpense}
                isSubmitting={
                  createMutation.isPending || updateMutation.isPending
                }
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold mt-1">{stats.count}</p>
                </div>
                <Receipt className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatCurrency(stats.total)}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {formatCurrency(stats.thisMonth)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="SUPPLIES">Supplies</SelectItem>
                  <SelectItem value="UTILITIES">Utilities</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="SALARY">Salary</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Expenses List
              {filteredExpenses.length !== data?.data?.data?.length && (
                <span className="text-sm font-normal text-gray-500">
                  ({filteredExpenses.length} of {data?.data?.data?.length})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredExpenses.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Expense Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExpenses.map((expense: Expense) => {
                        const categoryConfig = getCategoryConfig(
                          expense.category
                        );
                        const CategoryIcon = categoryConfig.icon;
                        return (
                          <TableRow
                            key={expense.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="font-medium">
                              {expense.title}
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-gray-600">
                              {expense.description || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge className={categoryConfig.color}>
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                {categoryConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(expense.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">
                                  {formatDate(expense.expenseDate)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(expense)}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(expense)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {filteredExpenses.map((expense: Expense) => {
                    const categoryConfig = getCategoryConfig(expense.category);
                    const CategoryIcon = categoryConfig.icon;
                    return (
                      <Card
                        key={expense.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">
                                  {expense.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {expense.description || "No description"}
                                </p>
                              </div>
                              <Badge className={categoryConfig.color}>
                                <CategoryIcon className="w-3 h-3 mr-1" />
                                {categoryConfig.label}
                              </Badge>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {formatDate(expense.expenseDate)}
                              </div>
                              <p className="text-xl font-bold text-gray-900">
                                {formatCurrency(expense.amount)}
                              </p>
                            </div>

                            <div className="flex gap-2 pt-3 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => handleEdit(expense)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(expense)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {(data?.data?.totalPages ?? 0) > 1 && (
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-600">
                      Page {page} of {data?.data?.totalPages ?? 0} (
                      {data?.data?.totalItems ?? 0} total expenses)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPage((p) =>
                            Math.min(data?.data?.totalPages ?? p, p + 1)
                          )
                        }
                        disabled={page === (data?.data?.totalPages ?? page)}
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">
                  No expenses found
                </p>
                <p className="text-sm text-gray-500">
                  {searchQuery || categoryFilter !== "all"
                    ? "Try adjusting your filters or search query"
                    : "Add your first expense to get started"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              expense
              {expenseToDelete && (
                <>
                  {" "}
                  <strong className="text-gray-900">
                    {expenseToDelete.title}
                  </strong>
                </>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setExpenseToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Expense"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default withAuth(ExpensesPage, [
  UserRole.ADMIN,
  UserRole.FINANCE,
  UserRole.SUPER_ADMIN,
]);
