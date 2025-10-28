// src/app/student/finance/make-payment/page.tsx
"use client";

import { useEffect, useState } from "react";
import { financeService } from "@/services/financeService";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/services/financeService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MakePaymentPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedSchool = useAuthStore((state) => state.selectedSchool);
  const student = useAuthStore((state) => state.student);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!selectedSchool || !student) return;

      try {
        const response = await financeService.getInvoices("UNPAID");
        if (response.success) {
          setInvoices(response.data.data);
        } else {
          setError(response.message || "Failed to fetch invoices.");
        }
      } catch (err) {
        setError("An error occurred while fetching the invoices.");
      }
    };

    fetchInvoices();
  }, [selectedSchool, student]);

  const handlePayment = () => {
    if (!selectedInvoice) return;
    // Handle Paystack integration logic here
    console.log("Paying for invoice:", selectedInvoice);
  };

  return (
    <div>
      <h1>Make a Payment</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ marginBottom: "20px" }}>
        <Select onValueChange={setSelectedInvoice}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select an invoice to pay" />
          </SelectTrigger>
          <SelectContent>
            {invoices.map((invoice) => (
              <SelectItem key={invoice.id} value={invoice.id}>
                {invoice.title} - ${invoice.balance.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handlePayment} disabled={!selectedInvoice}>
        Pay with Paystack
      </Button>
    </div>
  );
};

export default withAuth(MakePaymentPage, [UserRole.STUDENT, UserRole.PARENT]);
