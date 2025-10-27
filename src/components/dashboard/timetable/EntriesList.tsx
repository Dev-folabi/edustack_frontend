"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Entry as TimetableEntry } from "@/services/timetableService";
import { format } from "date-fns";

interface EntriesListProps {
  entries: TimetableEntry[];
  onEdit: (entry: TimetableEntry) => void;
  onDelete: (entry: TimetableEntry) => void;
}

const EntriesList = ({ entries, onEdit, onDelete }: EntriesListProps) => {
  if (entries.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No entries added yet. Click "Add New Entry" to start building the timetable.
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "h:mm a");
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Day</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow key={index}>
              <TableCell>{entry.day.join(", ")}</TableCell>
              <TableCell>
                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
              </TableCell>
              <TableCell>{entry.subject ? entry.subject.name : "N/A"}</TableCell>
              <TableCell>{entry.teacher ? entry.teacher.name : "N/A"}</TableCell>
              <TableCell>{entry.type}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(entry)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EntriesList;
