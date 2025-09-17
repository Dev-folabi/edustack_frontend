"use client";

import React, { useMemo, useEffect } from "react";
import { useTimetableStore } from "@/store/timetableStore";
import { WeekDay, Entry as TimetableEntry } from "@/services/timetableService";
import { Loader, Clock, Calendar, Users } from "lucide-react";

/* Helper: format Date -> "HH:mm" */
const formatHHMM = (d: string | Date) => {
  const date = new Date(d);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

/* Helper: format time to 12-hour format */
const formatTime12Hour = (hour: number, minute: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
};

const dayOrder = [
  WeekDay.MONDAY,
  WeekDay.TUESDAY,
  WeekDay.WEDNESDAY,
  WeekDay.THURSDAY,
  WeekDay.FRIDAY,
  WeekDay.SATURDAY,
  WeekDay.SUNDAY,
];

// Generate time slots from 7 AM to 6 PM with 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour <= 18; hour++) {
    slots.push({ hour, minute: 0, key: `${hour}:00` });
    if (hour < 18) {
      slots.push({ hour, minute: 30, key: `${hour}:30` });
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Type color mapping based on PeriodType
const getTypeColor = (type: string) => {
  switch (type) {
    case "REGULAR":
      return "bg-blue-100 border-blue-200 text-blue-800";
    case "BREAK":
      return "bg-orange-100 border-orange-200 text-orange-800";
    case "LUNCH":
      return "bg-green-100 border-green-200 text-green-800";
    case "ASSEMBLY":
      return "bg-purple-100 border-purple-200 text-purple-800";
    case "SPORTS":
      return "bg-red-100 border-red-200 text-red-800";
    case "LIBRARY":
      return "bg-indigo-100 border-indigo-200 text-indigo-800";
    case "FREE_PERIOD":
      return "bg-gray-100 border-gray-200 text-gray-800";
    default:
      return "bg-slate-100 border-slate-200 text-slate-800";
  }
};

interface SchoolIdProps {
  sectionId: string;
}

const TimetableGrid = ({ sectionId }: SchoolIdProps) => {
  const { selectedTimetable, isLoading, fetchClassTimetable } =
    useTimetableStore();

  const entries: TimetableEntry[] = selectedTimetable?.entries || [];

  // Organize entries by day and time slot
  const organizedEntries = useMemo(() => {
    const organized: Record<
      string,
      Record<string, TimetableEntry & { span: number; skipSlots: Set<string> }>
    > = {};
    const occupiedSlots: Record<string, Set<string>> = {};

    // Initialize structure
    dayOrder.forEach((day) => {
      organized[day] = {};
      occupiedSlots[day] = new Set();
    });

    // Place entries in the grid
    entries.forEach((entry) => {
      const startTime = new Date(entry.startTime);
      const endTime = new Date(entry.endTime);

      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();

      // Convert to minutes for comparison
      const startMinutes = startHour * 60 + startMinute;

      // Find nearest slot at or before start time
      const matchingSlotIndex = timeSlots.findIndex((slot, idx) => {
        const slotMinutes = slot.hour * 60 + slot.minute;
        const nextSlot = timeSlots[idx + 1];
        const nextSlotMinutes = nextSlot
          ? nextSlot.hour * 60 + nextSlot.minute
          : Infinity;

        return startMinutes >= slotMinutes && startMinutes < nextSlotMinutes;
      });

      if (matchingSlotIndex === -1) return;

      // Calculate span (# of slots the entry should cover)
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMinutes = durationMs / (1000 * 60);
      const span = Math.max(1, Math.ceil(durationMinutes / 30));

      // Use the actual slot key we matched to
      const firstSlot = timeSlots[matchingSlotIndex];
      const timeKey = `${firstSlot.hour}:${firstSlot.minute
        .toString()
        .padStart(2, "0")}`;

      // Build skip slots set
      const skipSlots = new Set<string>();
      for (let i = 1; i < span; i++) {
        const nextSlotIndex = matchingSlotIndex + i;
        if (nextSlotIndex < timeSlots.length) {
          const nextSlot = timeSlots[nextSlotIndex];
          const nextTimeKey = `${nextSlot.hour}:${nextSlot.minute
            .toString()
            .padStart(2, "0")}`;
          skipSlots.add(nextTimeKey);
        }
      }

      // Assign entry to each day
      entry.day.forEach((day) => {
        if (organized[day]) {
          organized[day][timeKey] = { ...entry, span, skipSlots };
          occupiedSlots[day].add(timeKey);
          skipSlots.forEach((slot) => occupiedSlots[day].add(slot));
        }
      });
    });

    return { organized, occupiedSlots };
  }, [entries]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-full mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Loading Timetable
          </h3>
          <p className="text-gray-500">
            Please wait while we fetch the schedule...
          </p>
        </div>
      </div>
    );
  }

  if (!selectedTimetable) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border p-12 text-center max-w-md">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-4 rounded-full mx-auto mb-6 w-20 h-20 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            No Timetable Available
          </h3>
          <p className="text-gray-500">
            Select a class and section to view the timetable schedule.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {selectedTimetable.name}
                </h1>
                <p className="text-sm text-gray-500">
                  {selectedTimetable.session?.name} -{" "}
                  {selectedTimetable.term?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{selectedTimetable.section?.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>7:00 AM - 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border relative">
          <div className="overflow-auto">
            <div className="min-w-[800px] sm:min-w-[1000px] lg:min-w-[1200px] relative z-10">
              {/* Time header */}
              <div className="grid grid-cols-[100px_repeat(23,minmax(40px,1fr))] bg-gradient-to-r from-gray-50 to-slate-100 border-b border-gray-200">
                <div className="p-2 font-semibold text-gray-700 border-r border-gray-200 flex items-center justify-center text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  Day/Time
                </div>
                {timeSlots.map((slot) => (
                  <div
                    key={slot.key}
                    className="p-1 text-center font-medium text-gray-700 border-r border-gray-200 last:border-r-0 text-xs leading-tight"
                  >
                    <div>
                      {formatTime12Hour(slot.hour, slot.minute).split(" ")[0]}
                    </div>
                    <div className="text-xs opacity-75">
                      {formatTime12Hour(slot.hour, slot.minute).split(" ")[1]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {dayOrder.map((day) => (
                <div
                  key={day}
                  className="grid grid-cols-[100px_repeat(23,minmax(40px,1fr))] border-b border-gray-100 last:border-b-0 hover:bg-gray-50/30 transition-colors duration-200"
                >
                  <div className="p-2 font-medium text-gray-700 border-r border-gray-200 bg-gradient-to-r from-gray-50 to-white capitalize flex items-center justify-center text-xs">
                    {day.toLowerCase().slice(0, 3)}
                  </div>

                  {timeSlots.map((slot, index) => {
                    const timeKey = `${slot.hour}:${slot.minute
                      .toString()
                      .padStart(2, "0")}`;
                    const entry = organizedEntries.organized[day]?.[timeKey];

                    if (
                      organizedEntries.occupiedSlots[day]?.has(timeKey) &&
                      !entry
                    ) {
                      return null;
                    }

                    if (entry) {
                      const colorClass = getTypeColor(entry.type);
                      const isTopRow = day === WeekDay.MONDAY && index === 0;

                      return (
                        <div
                          key={slot.key}
                          className={`relative p-1 border-r border-gray-100 last:border-r-0 ${colorClass} border-l-2 cursor-pointer group transition-all duration-200 hover:shadow-md hover:scale-[1.02] flex items-center justify-center text-center min-h-[60px]`}
                          style={{ gridColumn: `span ${entry.span || 1}` }}
                        >
                          <div className="w-full text-xs">
                            <div className="font-medium truncate text-center leading-tight">
                              {entry.subject?.name ||
                                entry.type.replace("_", " ")}
                            </div>
                            {entry.teacher && (
                              <div className="text-center opacity-75 truncate mt-1">
                                {entry.teacher.name}
                              </div>
                            )}
                          </div>

                          {/* Tooltip */}
                          <div
                            className={`absolute left-1/2 -translate-x-1/2 z-50 min-w-48
                              bg-white shadow-xl rounded-lg p-3 border
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                              ${
                                isTopRow ? "top-full mt-2" : "bottom-full mb-2"
                              }`}
                          >
                            <div className="font-medium text-sm">
                              {entry.subject?.name || entry.type}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {entry.teacher && (
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {entry.teacher.name}
                                </div>
                              )}
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatHHMM(entry.startTime)} –{" "}
                                {formatHHMM(entry.endTime)}
                              </div>
                              <div className="mt-1 text-xs px-2 py-1 bg-gray-100 rounded capitalize">
                                {entry.type.toLowerCase().replace("_", " ")}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={slot.key}
                        className="p-1 border-r border-gray-100 last:border-r-0 min-h-[60px] flex items-center justify-center"
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Period Types
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              "REGULAR",
              "BREAK",
              "LUNCH",
              "ASSEMBLY",
              "SPORTS",
              "LIBRARY",
              "FREE_PERIOD",
            ].map((type) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border ${getTypeColor(type)}`}
                ></div>
                <span className="text-sm text-gray-600 capitalize">
                  {type.toLowerCase().replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;
