"use client";

import { FaFileInvoiceDollar, FaMoneyBillWave } from "react-icons/fa";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export const StudentFinance = () => {
  const { student, selectedSchool } = useAuthStore();
  const school = selectedSchool?.school;
  const studentId = student?.id;
  const schoolId = school?.id;

  const financeLinks = [
    {
      label: "Invoices",
      icon: FaFileInvoiceDollar,
      href: `/student/finance/invoices?studentId=${studentId}&schoolId=${schoolId}`,
      description: "View your invoices",
    },
    {
      label: "Payments",
      icon: FaMoneyBillWave,
      href: `/student/finance/payments?studentId=${studentId}&schoolId=${schoolId}`,
      description: "Track your payments",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {financeLinks.map((link) => (
        <Link
          href={link.href}
          key={link.label}
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <link.icon className="w-8 h-8 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">{link.label}</h3>
              <p className="text-gray-500">{link.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
