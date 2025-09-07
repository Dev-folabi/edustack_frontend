"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore, School } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { FaPlus, FaList, FaTh, FaEdit, FaTrash } from 'react-icons/fa';
import Link from 'next/link';
import { DASHBOARD_ROUTES } from '@/constants/routes';
import { schoolService } from '@/services/schoolService';
import { useToast } from '@/components/ui/Toast';

const SchoolsPage = () => {
  const { schools, loadSchools, isLoading } = useAuthStore();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);

  useEffect(() => {
    loadSchools();
  }, [loadSchools]);

  const handleToggleActive = async (school: School) => {
    try {
      await schoolService.updateSchool(school.id, { isActive: !school.isActive });
      showToast({ title: 'Success', message: `School has been ${!school.isActive ? 'activated' : 'deactivated'}.`, type: 'success' });
      loadSchools(); // Refresh the list
    } catch (error) {
      showToast({ title: 'Error', message: 'Failed to update school status.', type: 'error' });
    }
  };

  const handleDeleteSchool = async () => {
    if (!schoolToDelete) return;
    try {
      await schoolService.deleteSchool(schoolToDelete.id);
      showToast({ title: 'Success', message: 'School deleted successfully.', type: 'success' });
      loadSchools(); // Refresh the list
      setSchoolToDelete(null);
    } catch (error) {
      showToast({ title: 'Error', message: 'Failed to delete school.', type: 'error' });
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Actions = ({ school }: { school: School }) => (
    <div className="flex items-center space-x-2">
      <Switch
        checked={school.isActive}
        onCheckedChange={() => handleToggleActive(school)}
        aria-label="Toggle Active Status"
      />
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon" onClick={() => setSchoolToDelete(school)}>
          <FaTrash />
        </Button>
      </AlertDialogTrigger>
    </div>
  );

  const SchoolGrid = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {filteredSchools.map(school => (
        <Card key={school.id} className="flex flex-col">
          <CardHeader>
            <CardTitle>{school.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-gray-500">{school.address}</p>
            <p className="mt-2">{school.email}</p>
          </CardContent>
          <div className="p-4 border-t flex justify-end">
            <Actions school={school} />
          </div>
        </Card>
      ))}
    </div>
  );

  const SchoolTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>School Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredSchools.map(school => (
          <TableRow key={school.id}>
            <TableCell>{school.name}</TableCell>
            <TableCell>{school.email}</TableCell>
            <TableCell>
              <div className={`px-2 py-1 rounded-full text-xs text-center inline-block ${school.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {school.isActive ? 'Active' : 'Inactive'}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <Actions school={school} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <AlertDialog>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Schools Management</h1>
          <Link href={DASHBOARD_ROUTES.CREATE_SCHOOL}>
            <Button>
              <FaPlus className="mr-2" /> Add New School
            </Button>
          </Link>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)}>
            <ToggleGroupItem value="grid" aria-label="Grid view"><FaTh /></ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view"><FaList /></ToggleGroupItem>
          </ToggleGroup>
        </div>

        {isLoading ? (
          <p>Loading schools...</p>
        ) : (
          viewMode === 'grid' ? <SchoolGrid /> : <SchoolTable />
        )}
      </div>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the school
            and all of its associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setSchoolToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteSchool}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SchoolsPage;
