"use client";

import React from "react";
import { type Entry } from "@/services/timetableService";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/utils/permissions";
import { UserRole } from "@/constants/roles";
import { Clock, Book, User } from "lucide-react";
import { useTimetableStore } from "@/store/timetableStore";

interface EntryCardProps {
  entry: Entry;
}

const EntryCard = ({ entry }: EntryCardProps) => {
  const { hasRole } = usePermissions();
  const { openModal, deleteEntry } = useTimetableStore();
  const isAdmin = hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      deleteEntry(entry.id);
    }
  };

  return (
    <div className="p-2 bg-gray-100 rounded-lg shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Book className="w-4 h-4" />
          <span>{entry.subject?.name || entry.type}</span>
        </div>
        {entry.teacher && (
          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
            <User className="w-3 h-3" />
            <span>{entry.teacher.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
          <Clock className="w-3 h-3" />
          <span>
            {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
          </span>
        </div>
      </div>
      {isAdmin && (
        <div className="flex items-center justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={() => openModal(entry)}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default EntryCard;
