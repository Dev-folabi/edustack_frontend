"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { financeService, PaginatedResponse } from "@/services/financeService";
import { Invoice } from "@/types/finance";
import { useToast } from "@/components/ui/Toast";
import { MoreHorizontal, Edit, Trash2, Plus, FileText, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const InvoicesTable = () => {
  const router = useRouter();
  const { selectedSchool } = useAuthStore();
  const { showToast } = useToast();

  const [invoices, setInvoices] = useState<PaginatedResponse<Invoice> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchInvoices = async () => {
    if (!selectedSchool?.schoolId) return;
    setIsLoading(true);
    try {
      const res = await financeService.getInvoices(statusFilter === 'ALL' ? '' : statusFilter);
      setInvoices(res.data);
    } catch (error: any) {
      showToast({ type: "error", title: "Error", message: error.message || "Failed to fetch invoices." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [selectedSchool?.schoolId, statusFilter]);

  const handleDelete = async (id: string) => {
    try {
      await financeService.deleteInvoice(id);
      showToast({ type: "success", title: "Success", message: "Invoice deleted successfully." });
      fetchInvoices();
    } catch (error: any) {
      showToast({ type: "error", title: "Error", message: error.message || "Failed to delete invoice." });
    }
  };

  const statusOptions = ['ALL', 'DRAFT', 'SENT', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED'];

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Invoices</CardTitle>
          <div className="flex items-center gap-4">
            <Select onValueChange={setStatusFilter} value={statusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={() => router.push('/finance/invoices/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
            ) : invoices?.data.length ? (
              invoices.data.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.title}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell><Badge>{invoice.status}</Badge></TableCell>
                  <TableCell>{invoice.totalAmount}</TableCell>
                  <TableCell>{invoice.paidAmount}</TableCell>
                  <TableCell>{invoice.balance}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => router.push(`/finance/invoices/${invoice.id}`)}><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => router.push(`/finance/invoices/${invoice.id}/edit`)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleDelete(invoice.id)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={7} className="text-center">No invoices found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
