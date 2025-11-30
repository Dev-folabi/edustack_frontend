"use client";

import React, { useState } from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useQuery } from "@tanstack/react-query";
import { financeService } from "@/services/financeService";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/DatePicker";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  Receipt,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import RevenueExpenseChart from "@/components/finance/RevenueExpenseChart";
import CategoryPieChart from "@/components/finance/CategoryPieChart";

const FinanceDashboardPage = () => {
  const { selectedSchool } = useAuthStore();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "financialOverview",
      selectedSchool?.schoolId,
      dateRange?.from,
      dateRange?.to,
    ],
    queryFn: () =>
      financeService.getFinancialOverview(
        selectedSchool?.schoolId || "",
        dateRange?.from?.toISOString(),
        dateRange?.to?.toISOString()
      ),
    enabled: !!selectedSchool?.schoolId,
  });

  const summary = data?.data?.summary;
  const invoiceBreakdown = data?.data?.invoiceStatusBreakdown || [];
  const expenseBreakdown = data?.data?.expenseCategoryBreakdown || [];
  const recentTransactions = data?.data?.recentTransactions || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-NG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    const configs: {
      [key: string]: { color: string; label: string; icon: any };
    } = {
      UNPAID: {
        color: "bg-red-100 text-red-800 border-red-300",
        label: "Unpaid",
        icon: XCircle,
      },
      PAID: {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Paid",
        icon: CheckCircle,
      },
      PARTIALLY_PAID: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        label: "Partially Paid",
        icon: Clock,
      },
      COMPLETED: {
        color: "bg-green-100 text-green-800 border-green-300",
        label: "Completed",
        icon: CheckCircle,
      },
    };
    return configs[status] || configs.UNPAID;
  };

  // Prepare chart data
  const chartData = [
    {
      name: "Overview",
      revenue: summary?.totalRevenue || 0,
      expenses: summary?.totalExpenses || 0,
    },
  ];

  const expenseCategoryData = expenseBreakdown.map((item: any) => ({
    name: item.category.replace(/_/g, " "),
    value: item._sum.amount,
    count: item._count,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Finance Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Complete financial overview and analytics
            </p>
          </div>
          <DateRangePicker
            date={dateRange}
            onDateChange={setDateRange}
            maxDate={new Date()}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
              <p className="text-gray-600">Loading financial data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary?.totalRevenue || 0)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">
                          {summary?.totalPayments || 0} payments
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Expenses */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        Total Expenses
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(summary?.totalExpenses || 0)}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                        <span className="text-xs text-red-600 font-medium">
                          {summary?.expenseCount || 0} expenses
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Net Income */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">Net Income</p>
                      <p
                        className={`text-2xl font-bold ${
                          (summary?.netIncome || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(summary?.netIncome || 0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Revenue - Expenses
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        (summary?.netIncome || 0) >= 0
                          ? "bg-blue-100"
                          : "bg-orange-100"
                      }`}
                    >
                      <DollarSign
                        className={`w-6 h-6 ${
                          (summary?.netIncome || 0) >= 0
                            ? "text-blue-600"
                            : "text-orange-600"
                        }`}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Invoices */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">
                        Total Invoices
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {summary?.totalInvoices || 0}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatCurrency(summary?.totalInvoiceAmount || 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Receipt className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Invoice & Payment Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Amount Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5" />
                    Amount Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Invoice Amount
                        </p>
                        <p className="text-lg font-semibold mt-1">
                          {formatCurrency(summary?.totalInvoiceAmount || 0)}
                        </p>
                      </div>
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Amount Paid</p>
                        <p className="text-lg font-semibold text-green-700 mt-1">
                          {formatCurrency(summary?.totalAmountPaid || 0)}
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Amount Due</p>
                        <p className="text-lg font-semibold text-red-700 mt-1">
                          {formatCurrency(summary?.totalAmountDue || 0)}
                        </p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-600" />
                    </div>

                    {/* Payment Progress */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Collection Progress
                        </span>
                        <span className="text-sm font-semibold">
                          {summary?.totalInvoiceAmount
                            ? (
                                ((summary?.totalAmountPaid || 0) /
                                  summary?.totalInvoiceAmount) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                          style={{
                            width: `${
                              summary?.totalInvoiceAmount
                                ? ((summary?.totalAmountPaid || 0) /
                                    summary?.totalInvoiceAmount) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Invoice Status Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoiceBreakdown.map((item: any) => {
                      const statusConfig = getStatusConfig(item.status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <div
                          key={item.status}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                item.status === "PAID"
                                  ? "bg-green-100"
                                  : item.status === "PARTIALLY_PAID"
                                  ? "bg-yellow-100"
                                  : "bg-red-100"
                              }`}
                            >
                              <StatusIcon
                                className={`w-5 h-5 ${
                                  item.status === "PAID"
                                    ? "text-green-600"
                                    : item.status === "PARTIALLY_PAID"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                                }`}
                              />
                            </div>
                            <div>
                              <Badge className={statusConfig.color}>
                                {statusConfig.label}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                {item._count} invoice(s)
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatCurrency(item._sum.totalAmount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue vs Expenses */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueExpenseChart data={chartData} />
                </CardContent>
              </Card>

              {/* Expense Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Expenses by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  {expenseCategoryData.length > 0 ? (
                    <CategoryPieChart data={expenseCategoryData} />
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No expense data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions.length > 0 ? (
                  <>
                    {/* Desktop View */}
                    <div className="hidden md:block space-y-3">
                      {recentTransactions
                        .slice(0, 5)
                        .map((transaction: any) => {
                          const statusConfig = getStatusConfig(
                            transaction.status
                          );
                          const StatusIcon = statusConfig.icon;
                          return (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate">
                                    {transaction.studentInvoice?.student?.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {
                                      transaction.studentInvoice?.invoice
                                        ?.invoiceNumber
                                    }{" "}
                                    -{" "}
                                    {transaction.studentInvoice?.invoice?.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      className={
                                        statusConfig.color + " text-xs"
                                      }
                                    >
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {statusConfig.label}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {transaction.paymentMethod?.replace(
                                        /_/g,
                                        " "
                                      )}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <p className="font-bold text-green-600">
                                  {formatCurrency(transaction.amount)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {formatDateTime(
                                    transaction.paidAt || transaction.createdAt
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden space-y-3">
                      {recentTransactions
                        .slice(0, 5)
                        .map((transaction: any) => {
                          const statusConfig = getStatusConfig(
                            transaction.status
                          );
                          const StatusIcon = statusConfig.icon;
                          return (
                            <div
                              key={transaction.id}
                              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm">
                                    {transaction.studentInvoice?.student?.name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {
                                      transaction.studentInvoice?.invoice
                                        ?.invoiceNumber
                                    }
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {transaction.studentInvoice?.invoice?.title}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mb-3">
                                <div className="flex flex-wrap gap-2">
                                  <Badge
                                    className={statusConfig.color + " text-xs"}
                                  >
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {transaction.paymentMethod?.replace(
                                      /_/g,
                                      " "
                                    )}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t">
                                <p className="text-xs text-gray-500">
                                  {formatDateTime(
                                    transaction.paidAt || transaction.createdAt
                                  )}
                                </p>
                                <p className="font-bold text-green-600">
                                  {formatCurrency(transaction.amount)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default withAuth(FinanceDashboardPage, [
  UserRole.ADMIN,
  UserRole.FINANCE,
  UserRole.SUPER_ADMIN,
]);
