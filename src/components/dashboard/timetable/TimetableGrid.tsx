"use client";

import React from "react";
import { useTimetableStore } from "@/store/timetableStore";
import { WeekDay } from "@/services/timetableService";
import EntryCard from "./EntryCard";
import { usePermissions } from "@/utils/permissions";
import { UserRole } from "@/constants/roles";
import { Loader } from "lucide-react";

const TimetableGrid = () => {
  const { selectedTimetable, openModal, isLoading } = useTimetableStore();
  const { hasRole } = usePermissions();
  const isAdmin = hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader className="h-6 w-6 animate-spin" />
          <p className="text-gray-500">Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (!selectedTimetable) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">
          Select a class and section to view the timetable.
        </p>
      </div>
    );
  }

  // Check if timetable has no entries
  if (selectedTimetable.entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Timetable Found
          </h3>
          <p className="text-gray-500 mb-4">
            This class doesn't have a timetable yet.
          </p>
          {isAdmin && (
            <p className="text-sm text-gray-400">
              Create a timetable to get started.
            </p>
          )}
        </div>
      </div>
    );
  }

  const days = [
    WeekDay.MONDAY,
    WeekDay.TUESDAY,
    WeekDay.WEDNESDAY,
    WeekDay.THURSDAY,
    WeekDay.FRIDAY,
    WeekDay.SATURDAY,
  ];

  // Get unique time slots from the entries to create rows
  const timeSlots = selectedTimetable.entries
    .reduce((acc, entry) => {
      const startTime = new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      if (!acc.includes(startTime)) {
        acc.push(startTime);
      }
      return acc;
    }, [] as string[])
    .sort();

  const getEntryForSlot = (day: WeekDay, time: string) => {
    return selectedTimetable.entries.find(
      (entry) =>
        entry.day.includes(day) &&
        new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) === time
    );
  };

  const handleCellClick = (day: WeekDay, time: string) => {
    if (isAdmin) {
      // Logic to open modal with pre-filled day and time
      openModal();
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border border-gray-300 w-24">Time</th>
            {days.map((day) => (
              <th key={day} className="p-2 border border-gray-300 capitalize">
                {day.toLowerCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, index) => (
            <tr key={index}>
              <td className="p-2 border border-gray-300 text-center font-medium">
                {new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
              </td>
              {days.map((day) => {
                const entry = getEntryForSlot(day, time);
                return (
                  <td
                    key={day}
                    className="p-1 border border-gray-300 h-28 align-top"
                    onClick={() => !entry && handleCellClick(day, time)}
                  >
                    {entry ? (
                      <EntryCard entry={entry} />
                    ) : (
                      isAdmin && (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer">
                          + Add
                        </div>
                      )
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableGrid;
