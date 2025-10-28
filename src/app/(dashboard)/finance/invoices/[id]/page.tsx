"use client";

import React, { useState, useEffect } from 'react';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';
import { financeService } from '@/services/financeService';
import { Invoice } from '@/types/finance';
import { useToast } from '@/components/ui/Toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const InvoiceDetailsPage = ({ params }: { params: { id: string } }) => {
    const { id } = params;
    const { showToast } = useToast();
    const [invoice, setInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const res = await financeService.getInvoiceById(id);
                setInvoice(res.data);
            } catch (error: any) {
                showToast({ type: 'error', title: 'Error', message: error.message || 'Failed to fetch invoice data' });
            }
        };
        fetchInvoice();
    }, [id]);

    if (!invoice) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Invoice Details</CardTitle>
                        <Badge>{invoice.status}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div><p><strong>Title:</strong> {invoice.title}</p></div>
                        <div><p><strong>Description:</strong> {invoice.description}</p></div>
                        <div><p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p></div>
                        <div><p><strong>Total Amount:</strong> {invoice.totalAmount}</p></div>
                        <div><p><strong>Paid Amount:</strong> {invoice.paidAmount}</p></div>
                        <div><p><strong>Balance:</strong> {invoice.balance}</p></div>
                    </div>

                    <h3 className="text-lg font-semibold">Invoice Items</h3>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoice.items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>{item.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default withAuth(InvoiceDetailsPage, [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FINANCE]);
