"use client";

import React, { useState } from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useQuery } from "@tanstack/react-query";
import { financeService } from "@/services/financeService";
import { useAuthStore } from "@/store/authStore";
import FinancialOverviewCard from "@/components/finance/FinancialOverviewCard";
import RevenueExpenseChart from "@/components/finance/RevenueExpenseChart";
import CategoryPieChart from "@/components/finance/CategoryPieChart";
import { DateRangePicker } from "@/components/ui/DatePicker";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";

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

  const chartData = [
    {
      name: "Overview",
      revenue: data?.data.totalRevenue || 0,
      expenses: data?.data.totalExpenses || 0,
    },
  ];

  const revenueByCategoryData =
    data?.data.revenueByFeeCategory.map((item) => ({
      name: item.feeCategory,
      value: item.total,
    })) || [];

  const expensesByCategoryData =
    data?.data.expensesByCategory.map((item) => ({
      name: item.category,
      value: item.total,
    })) || [];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Finance Dashboard</h1>
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
          maxDate={new Date()}
        />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <FinancialOverviewCard
            title="Total Revenue"
            value={`$${data?.data.totalRevenue.toLocaleString()}`}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
          <FinancialOverviewCard
            title="Total Expenses"
            value={`$${data?.data.totalExpenses.toLocaleString()}`}
            icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          />
          <FinancialOverviewCard
            title="Net Profit"
            value={`$${data?.data.netProfit.toLocaleString()}`}
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}

      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-2">Revenue vs. Expenses</h2>
          <RevenueExpenseChart data={chartData} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Revenue by Category</h2>
          <CategoryPieChart data={revenueByCategoryData} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Expenses by Category</h2>
          <CategoryPieChart data={expensesByCategoryData} />
        </div>
      </div>
    </div>
  );
};

export default withAuth(FinanceDashboardPage, [
  UserRole.ADMIN,
  UserRole.FINANCE,
  UserRole.SUPER_ADMIN,
]);
