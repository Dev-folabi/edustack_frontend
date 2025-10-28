// src/app/(dashboard)/finance/page.tsx
"use client";

import { useEffect, useState } from "react";
import { financeService, FinancialOverview } from "@/services/financeService";
import SummaryCard from "@/components/finance/SummaryCard";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useAuthStore } from "@/store/authStore";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { subDays } from "date-fns";
import IncomeExpensesChart from "@/components/finance/IncomeExpensesChart";

const AdminFinancePage = () => {
  const [overview, setOverview] = useState<FinancialOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedSchool = useAuthStore((state) => state.selectedSchool);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 29),
    to: new Date(),
  });

  useEffect(() => {
    const fetchOverview = async () => {
      if (!selectedSchool) return;

      try {
        const startDate = dateRange.from.toISOString().split("T")[0];
        const endDate = dateRange.to.toISOString().split("T")[0];
        const response = await financeService.getFinancialOverview(
          selectedSchool.schoolId,
          startDate,
          endDate
        );
        if (response.success) {
          setOverview(response.data);
        } else {
          setError(response.message || "Failed to fetch financial overview.");
        }
      } catch (err) {
        setError("An error occurred while fetching the financial overview.");
      }
    };

    fetchOverview();
  }, [selectedSchool, dateRange]);

  const chartData = overview
    ? [
        {
          name: "Financial Overview",
          income: overview.totalRevenue,
          expenses: overview.totalExpenses,
        },
      ]
    : [];

  return (
    <div>
      <h1>Admin Finance Dashboard</h1>
      <div style={{ marginBottom: "20px" }}>
        <DateRangePicker
          date={dateRange}
          onDateChange={setDateRange}
        />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {overview ? (
        <>
          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <SummaryCard title="Total Revenue" value={overview.totalRevenue} />
            <SummaryCard title="Total Expenses" value={overview.totalExpenses} />
            <SummaryCard title="Net Profit" value={overview.netProfit} />
          </div>
          <div>
            <h2>Income vs. Expenses Chart</h2>
            <IncomeExpensesChart data={chartData} />
          </div>
        </>
      ) : (
        <p>Loading overview...</p>
      )}
    </div>
  );
};

export default withAuth(AdminFinancePage, [UserRole.ADMIN, UserRole.FINANCE]);
