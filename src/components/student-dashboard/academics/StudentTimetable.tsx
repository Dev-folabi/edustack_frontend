"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";
import { timetableService } from "@/services/timetableService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Clock,
  Calendar,
  BookOpen,
  User,
  Loader2,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

const StudentTimetable = () => {
  const [timetable, setTimetable] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("ALL");

  const { student, selectedSchool } = useAuthStore();
  const studentEnrollment = student?.student_enrolled?.[0];

  const fetchTimetable = useCallback(async () => {
    if (!studentEnrollment || !selectedSchool) return;
    try {
      setLoading(true);
      const response = await timetableService.getClassTimetable(
        studentEnrollment.sectionId,
        "PUBLISHED"
      );
      if (response.success) {
        setTimetable(response?.data);
      } else {
        throw new Error(response.message);
      }
      setError(null);
    } catch (error: any) {
      setError(error.message || "Failed to fetch timetable");
    } finally {
      setLoading(false);
    }
  }, [studentEnrollment, selectedSchool]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const groupEntriesByDay = () => {
    if (!timetable?.entries) return {};

    const grouped: { [key: string]: any[] } = {};
    const daysOrder = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ];

    timetable.entries.forEach((entry: any) => {
      entry.day.forEach((dayName: string) => {
        if (!grouped[dayName]) grouped[dayName] = [];
        grouped[dayName].push(entry);
      });
    });

    Object.keys(grouped).forEach((day) => {
      grouped[day].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
    });

    const sortedGrouped: { [key: string]: any[] } = {};
    daysOrder.forEach((day) => {
      if (grouped[day]) sortedGrouped[day] = grouped[day];
    });

    return sortedGrouped;
  };

  const getAvailableDays = () => {
    if (!timetable?.entries) return [];
    const days = new Set<string>();
    timetable.entries.forEach((entry: any) => {
      entry.day.forEach((dayName: string) => days.add(dayName));
    });

    const order = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ];

    return order.filter((d) => days.has(d));
  };

  const getDayColor = (day: string) => {
    const colors: { [key: string]: string } = {
      MONDAY: "bg-blue-100 text-blue-800 border-blue-300",
      TUESDAY: "bg-green-100 text-green-800 border-green-300",
      WEDNESDAY: "bg-yellow-100 text-yellow-800 border-yellow-300",
      THURSDAY: "bg-indigo-100 text-indigo-800 border-indigo-300",
      FRIDAY: "bg-pink-100 text-pink-800 border-pink-300",
      SATURDAY: "bg-orange-100 text-orange-800 border-orange-300",
      SUNDAY: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[day] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen py-12 px-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 md:w-12 md:h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 text-sm md:text-base">
            Loading your timetable...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-red-500 mx-auto" />
              <p className="text-red-600 font-medium text-sm md:text-base">
                {error}
              </p>
              <button
                onClick={fetchTimetable}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedEntries = groupEntriesByDay();
  const availableDays = getAvailableDays();

  // Apply tab filter
  const filteredEntries =
    selectedDay === "ALL"
      ? groupedEntries
      : { [selectedDay]: groupedEntries[selectedDay] || [] };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              My Timetable
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Your class schedule for the term
            </p>
          </div>

          {/* Timetable Info Card */}
          {timetable && (
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="grid grid-cols lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm opacity-90">Term</p>
                      <p className="font-semibold text-sm sm:text-base truncate">
                        {timetable.term?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm opacity-90">Class</p>
                      <p className="font-semibold text-sm sm:text-base truncate">
                        {timetable.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm opacity-90">Section</p>
                      <p className="font-semibold text-sm sm:text-base truncate">
                        {timetable.section?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* --- 🟦 TABS FILTER --- */}
        <Tabs value={selectedDay} onValueChange={setSelectedDay}>
          <Card>
            <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
              <TabsList className="w-full grid grid-cols-4 sm:flex sm:flex-wrap bg-gray-100 p-1 sm:p-2 rounded-md gap-1">
                <TabsTrigger
                  value="ALL"
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 sm:mr-2 sm:mb-2"
                >
                  All Days
                </TabsTrigger>

                {availableDays.map((day) => (
                  <TabsTrigger
                    key={day}
                    value={day}
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 sm:mr-2 sm:mb-2"
                  >
                    <span className="hidden sm:inline">
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </span>
                    <span className="sm:hidden">{day.slice(0, 3)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardContent>
          </Card>

          {/* --- CONTENT FOR EACH TAB --- */}
          <TabsContent value={selectedDay}>
            {/* Timetable Content */}
            {timetable && Object.keys(filteredEntries).length > 0 ? (
              <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                {Object.entries(filteredEntries).map(
                  ([day, entries]: [string, any]) => (
                    <Card key={day}>
                      <CardHeader className="pb-2 sm:pb-3 pt-4 sm:pt-6">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg sm:text-xl font-bold">
                            {day.charAt(0) + day.slice(1).toLowerCase()}
                          </CardTitle>
                          <Badge
                            className={`${getDayColor(day)} text-xs sm:text-sm`}
                          >
                            {entries.length}{" "}
                            {entries.length === 1 ? "Class" : "Classes"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4 sm:pb-6">
                        {/* Desktop View */}
                        <div className="hidden lg:block space-y-3">
                          {entries.map((entry: any, index: number) => (
                            <div
                              key={entry.id}
                              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex-shrink-0 w-16 text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                                  <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                              </div>
                              <div className="flex-1 grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Time
                                  </p>
                                  <p className="font-semibold text-sm">
                                    {formatTime(entry.startTime)} -{" "}
                                    {formatTime(entry.endTime)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Subject
                                  </p>
                                  <p className="font-semibold text-sm flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                    {entry.subject?.name}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    Teacher
                                  </p>
                                  <p className="font-semibold text-sm flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    {entry.teacher?.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex-shrink-0">
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-300"
                                >
                                  {entry.type}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Tablet View */}
                        <div className="hidden md:block lg:hidden space-y-3">
                          {entries.map((entry: any, index: number) => (
                            <div
                              key={entry.id}
                              className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-sm">
                                      {formatTime(entry.startTime)} -{" "}
                                      {formatTime(entry.endTime)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Period {index + 1}
                                    </p>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-300 text-xs"
                                >
                                  {entry.type}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                      Subject
                                    </p>
                                    <p className="font-medium text-sm truncate">
                                      {entry.subject?.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs text-gray-500">
                                      Teacher
                                    </p>
                                    <p className="font-medium text-sm truncate">
                                      {entry.teacher?.name}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-2 sm:space-y-3">
                          {entries.map((entry: any, index: number) => (
                            <div
                              key={entry.id}
                              className="p-3 sm:p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-xs sm:text-sm truncate">
                                      {formatTime(entry.startTime)} -{" "}
                                      {formatTime(entry.endTime)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      Period {index + 1}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500">
                                      Subject
                                    </p>
                                    <p className="font-medium text-sm break-words">
                                      {entry.subject?.name}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500">
                                      Teacher
                                    </p>
                                    <p className="font-medium text-sm break-words">
                                      {entry.teacher?.name}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            ) : (
              <Card className="mt-4 sm:mt-6">
                <CardContent className="py-12 sm:py-24 px-4">
                  <div className="text-center space-y-3 sm:space-y-4">
                    <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto" />
                    <p className="text-gray-600 font-medium text-base sm:text-lg">
                      No Timetable Available
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2">
                      Your class timetable hasn't been published yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentTimetable;
