"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimetableEntry {
  day: string[];
  startTime: string;
  endTime: string;
  subject: {
    name: string;
  };
  teacher: {
    name: string;
  };
}

interface TimetableProps {
  timetable: {
    entries: TimetableEntry[];
  };
}

export const Timetable = ({ timetable }: TimetableProps) => {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {days.map((day) => (
        <Card key={day}>
          <CardHeader>
            <CardTitle>{day}</CardTitle>
          </CardHeader>
          <CardContent>
            {timetable?.entries
              .filter((entry) => entry.day.includes(day))
              .map((entry) => (
                <div key={entry.startTime} className="mb-4">
                  <p className="font-semibold">{entry.subject.name}</p>
                  <p className="text-gray-500">
                    {new Date(entry.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(entry.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="text-gray-500">Teacher: {entry.teacher.name}</p>
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
