"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { financeService } from "@/services/financeService";
import { useToast } from "@/components/ui/Toast";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Search,
  FileText,
  Calendar,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Receipt,
} from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Invoice } from "@/types/finance";
import { useRouter } from "next/navigation";
import EditInvoiceModal from "@/components/dashboard/finance/EditInvoiceModal";

export const InvoicesTable = () => {
  const { selectedSchool } = useAuthStore();
  const { showToast } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const router = useRouter();

  const fetchInvoices = useCallback(async () => {
    if (!selectedSchool?.schoolId) return;
    setIsLoading(true);
    try {
      const res = await financeService.getInvoices("", currentPage, 10);
      if (res.success && res.data) {
        setInvoices(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.totalItems || 0);
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to fetch invoices.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedSchool, currentPage, showToast]);

  useEffect(() => {
    if (selectedSchool?.schoolId) {
      fetchInvoices();
    }
  }, [selectedSchool, fetchInvoices]);

  const handleDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      const res = await financeService.deleteInvoice(invoiceToDelete.id);
      if (res.success) {
        showToast({
          type: "success",
          title: "Success",
          message: "Invoice deleted successfully.",
        });
        fetchInvoices();
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Error",
        message: error.message || "Failed to delete invoice.",
      });
    } finally {
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleViewDetails = (invoiceId: string) => {
    router.push(`/finance/invoices/${invoiceId}`);
  };

  const handleEdit = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setEditModalOpen(true);
  };

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title, invoice number"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Invoices List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredInvoices.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Session/Term</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Due</TableHead>
                      <TableHead className="text-center">Students</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      return (
                        <TableRow key={invoice.id} className="hover:bg-gray-50">
                          <TableCell className="font-mono text-sm font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium truncate">
                                {invoice.title}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">
                                {invoice.session?.name || "N/A"}
                              </p>
                              <p className="text-gray-500">
                                {invoice.term?.name || "N/A"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">
                                {new Date(invoice.dueDate).toLocaleDateString(
                                  "en-NG",
                                  {
                                    day: "numeric",
                                    month: "short",
                                  }
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              minimumFractionDigits: 0,
                            }).format(invoice.totalAmount)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-green-600 whitespace-nowrap">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              minimumFractionDigits: 0,
                            }).format(invoice.amountPaid)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-600 whitespace-nowrap">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              minimumFractionDigits: 0,
                            }).format(invoice.amountDue)}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {invoice.studentInvoicesCount || 0}
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
                                  onClick={() => handleViewDetails(invoice.id)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(invoice)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setInvoiceToDelete(invoice);
                                    setDeleteDialogOpen(true);
                                  }}
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredInvoices.map((invoice) => {
                  return (
                    <Card
                      key={invoice.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-mono text-sm text-gray-600">
                                {invoice.invoiceNumber}
                              </p>
                              <h3 className="font-semibold text-lg mt-1">
                                {invoice.title}
                              </h3>
                            </div>
                          </div>

                          {/* Session/Term */}
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium">
                              {invoice.session?.name || "N/A"}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600">
                              {invoice.term?.name || "N/A"}
                            </span>
                          </div>

                          {/* Due Date */}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Due:{" "}
                              {new Date(invoice.dueDate).toLocaleDateString(
                                "en-NG",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )}
                            </span>
                          </div>

                          {/* Financial Info */}
                          <div className="grid grid-cols-3 gap-2 py-3 border-t border-b">
                            <div>
                              <p className="text-xs text-gray-600">Total</p>
                              <p className="font-semibold text-sm mt-1">
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                  minimumFractionDigits: 0,
                                }).format(invoice.totalAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Paid</p>
                              <p className="font-semibold text-sm text-green-600 mt-1">
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                  minimumFractionDigits: 0,
                                }).format(invoice.amountPaid)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Due</p>
                              <p className="font-semibold text-sm text-red-600 mt-1">
                                {new Intl.NumberFormat("en-NG", {
                                  style: "currency",
                                  currency: "NGN",
                                  minimumFractionDigits: 0,
                                }).format(invoice.amountDue)}
                              </p>
                            </div>
                          </div>

                          {/* Students Count */}
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {invoice.studentInvoicesCount || 0} student(s)
                              assigned
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleViewDetails(invoice.id)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleEdit(invoice)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setInvoiceToDelete(invoice);
                                setDeleteDialogOpen(true);
                              }}
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
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t">
                  <p className="text-sm text-gray-600">
                    Showing page {currentPage} of {totalPages} ({totalItems}{" "}
                    total invoices)
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <Button
                              key={page}
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          );
                        }
                      )}
                      {totalPages > 5 && (
                        <>
                          <span className="px-2 text-gray-500">...</span>
                          <Button
                            variant={
                              currentPage === totalPages ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            className="w-10"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
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
                No invoices found
              </p>
              <p className="text-sm text-gray-500">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Create your first invoice to get started"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice
              {invoiceToDelete && (
                <>
                  {" "}
                  <strong className="text-gray-900">
                    {invoiceToDelete.invoiceNumber}
                  </strong>{" "}
                  ({invoiceToDelete.title})
                </>
              )}{" "}
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setInvoiceToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Edit Invoice Modal */}
      <EditInvoiceModal
        invoice={invoiceToEdit}
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setInvoiceToEdit(null);
        }}
        onUpdated={() => fetchInvoices()}
      />
    </div>
  );
};
