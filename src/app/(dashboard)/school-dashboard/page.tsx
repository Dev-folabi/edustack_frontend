"use client";

import React from "react";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/constants/roles";
import { useQuery } from "@tanstack/react-query";
import { schoolService } from "@/services/schoolService";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaMoneyBillWave,
  FaChartPie,
  FaUserPlus,
  FaClipboardList,
  FaCalendarAlt,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";

const SchoolDashboardPage = () => {
  const { selectedSchool } = useAuthStore();

  const { data: dashboardResponse, isLoading } = useQuery({
    queryKey: ["schoolDashboard", selectedSchool?.schoolId],
    queryFn: () =>
      schoolService.getDashboardData(selectedSchool?.schoolId || ""),
    enabled: !!selectedSchool?.schoolId,
  });

  const dashboardData = dashboardResponse?.data;

  const stats = dashboardData?.overview;
  const financial = dashboardData?.financialSummary;
  const academic = dashboardData?.academicInfo;
  const students = dashboardData?.studentBreakdown;
  const staff = dashboardData?.staffBreakdown;
  const recentAdmissions = dashboardData?.recentAdmissions || [];
  const attendance = dashboardData?.attendance;
  const examinations = dashboardData?.examinations;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 bg-gray-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {selectedSchool?.school?.name || "School Dashboard"}
          </h1>
          <div className="flex items-center gap-2 text-gray-500 mt-1">
            <FaCalendarAlt className="w-4 h-4" />
            <span>
              {academic?.currentSession?.name || "No Session"} •{" "}
              {academic?.currentTerm?.name || "No Term"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-600">
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </span>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Students
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-full">
              <FaUserGraduate className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalStudents || 0}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {stats?.activeStudents || 0} Active
              </p>
              <Badge
                variant="secondary"
                className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100"
              >
                {stats?.totalStudents
                  ? Math.round(
                      ((stats.activeStudents || 0) / stats.totalStudents) * 100
                    )
                  : 0}
                % Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Staff
            </CardTitle>
            <div className="p-2 bg-green-50 rounded-full">
              <FaChalkboardTeacher className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalStaff || 0}
            </div>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {stats?.activeStaff || 0} Active
              </p>
              <Badge
                variant="secondary"
                className="text-xs bg-green-100 text-green-700 hover:bg-green-100"
              >
                {stats?.totalStaff
                  ? Math.round(
                      ((stats.activeStaff || 0) / stats.totalStaff) * 100
                    )
                  : 0}
                % Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Classes & Sections
            </CardTitle>
            <div className="p-2 bg-purple-50 rounded-full">
              <FaSchool className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalClasses || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Across {stats?.totalSections || 0} Sections
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Attendance Rate
            </CardTitle>
            <div className="p-2 bg-orange-50 rounded-full">
              <FaClipboardList className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {attendance?.attendanceRate || 0}%
            </div>
            <div className="mt-2">
              <Progress
                value={attendance?.attendanceRate || 0}
                className="h-1.5 bg-orange-100"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Today: {attendance?.todayPresent || 0} Present /{" "}
              {attendance?.todayTotal || 0} Total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts & Admissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FaChartPie className="text-gray-400" /> Student Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={students?.byClass.map((c) => ({
                      name: c.className,
                      students: c.studentCount,
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <Tooltip
                      cursor={{ fill: "#f9fafb" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="students"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FaChartPie className="text-gray-400" /> Staff Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={staff?.byRole.map((r) => ({
                        name: r.role
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase()),
                        value: r.count,
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {staff?.byRole.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => (
                        <span className="text-xs text-gray-600 ml-1">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Admissions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FaUserPlus className="text-gray-400" /> Recent Admissions
              </CardTitle>
              <Badge variant="outline" className="font-normal">
                Last 30 Days
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAdmissions.length > 0 ? (
                  recentAdmissions.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarImage src={student.photo_url || ""} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {student.admissionNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {student.class.name}
                        </Badge>
                        <p className="text-xs text-gray-400">
                          {format(
                            new Date(student.admission_date),
                            "MMM d, yyyy"
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent admissions found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Financial & Exams */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-700 to-blue-600 text-white">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FaMoneyBillWave className="text-yellow-400" /> Financial
                Overview
              </CardTitle>
              <CardDescription className="text-gray-300">
                Current Term Summary
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Collection Rate</span>
                    <span className="font-medium text-gray-900">
                      {financial?.collectionRate || 0}%
                    </span>
                  </div>
                  <Progress
                    value={financial?.collectionRate || 0}
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p className="text-xs text-green-600 font-medium mb-1">
                      Revenue
                    </p>
                    <p className="text-lg font-bold text-green-700">
                      {formatCurrency(financial?.totalRevenue || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <p className="text-xs text-red-600 font-medium mb-1">
                      Expenses
                    </p>
                    <p className="text-lg font-bold text-red-700">
                      {formatCurrency(financial?.totalExpenses || 0)}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Net Income
                    </span>
                    <Badge
                      className={
                        financial?.netIncome && financial.netIncome >= 0
                          ? "bg-green-500"
                          : "bg-red-500"
                      }
                    >
                      {financial?.netIncome && financial.netIncome >= 0
                        ? "Profit"
                        : "Loss"}
                    </Badge>
                  </div>
                  <p
                    className={`text-2xl font-bold ${
                      financial?.netIncome && financial.netIncome >= 0
                        ? "text-gray-900"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(financial?.netIncome || 0)}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Total Invoices</span>
                    <span className="font-medium">
                      {financial?.totalInvoices || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Amount Due</span>
                    <span className="font-medium text-orange-600">
                      {formatCurrency(financial?.totalAmountDue || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Amount Paid</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(financial?.totalAmountPaid || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Examinations Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FaClipboardList className="text-gray-400" /> Examinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-2xl font-bold text-blue-600">
                    {examinations?.upcomingExams || 0}
                  </span>
                  <span className="text-xs text-blue-600 font-medium mt-1">
                    Upcoming
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-lg">
                  <span className="text-2xl font-bold text-yellow-600">
                    {examinations?.ongoingExams || 0}
                  </span>
                  <span className="text-xs text-yellow-600 font-medium mt-1">
                    Ongoing
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-2xl font-bold text-green-600">
                    {examinations?.completedExams || 0}
                  </span>
                  <span className="text-xs text-green-600 font-medium mt-1">
                    Completed
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                  <span className="text-2xl font-bold text-purple-600">
                    {examinations?.pendingResults || 0}
                  </span>
                  <span className="text-xs text-purple-600 font-medium mt-1">
                    Pending Results
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SchoolDashboardPage, [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
]);
