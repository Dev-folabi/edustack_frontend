"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaSchool, FaUserGraduate, FaUserTie, FaDollarSign } from 'react-icons/fa';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/constants/roles';

const SuperAdminDashboardPage = () => {
  const stats = [
    {
      title: 'Total Schools',
      value: '12',
      icon: <FaSchool className="h-6 w-6 text-gray-500" />,
      description: 'The total number of schools in the system.',
    },
    {
      title: 'Active Students',
      value: '4,582',
      icon: <FaUserGraduate className="h-6 w-6 text-gray-500" />,
      description: 'Total active students across all schools.',
    },
    {
      title: 'Total Staff',
      value: '345',
      icon: <FaUserTie className="h-6 w-6 text-gray-500" />,
      description: 'Total teaching and non-teaching staff.',
    },
    {
      title: 'Monthly Revenue',
      value: '$75,940',
      icon: <FaDollarSign className="h-6 w-6 text-gray-500" />,
      description: 'Estimated revenue for the current month.',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8">
        {/* The Schools List/Grid will be rendered here in a future step */}
        <h2 className="text-2xl font-bold mb-4">School Management</h2>
        <p>The list of schools will be displayed here.</p>
      </div>
    </div>
  );
};

export default withAuth(SuperAdminDashboardPage, [UserRole.SUPER_ADMIN]);
