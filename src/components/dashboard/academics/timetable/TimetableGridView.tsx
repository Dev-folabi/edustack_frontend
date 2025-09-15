import React from 'react';
import { ITimetable } from '@/types/timetable';
import { Subject } from '@/services/subjectService';
import { Staff } from '@/types/staff';

interface TimetableGridViewProps {
  timetable: ITimetable;
  subjects: Subject[];
  staff: Staff[];
  onEditEntry: (entry: any) => void;
  onDeleteEntry: (entry: any) => void;
}

const TimetableGridView: React.FC<TImetableGridViewProps> = ({ timetable, subjects, staff, onEditEntry, onDeleteEntry }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="bg-white shadow-md rounded-md p-4">
      <h2 className="text-xl font-semibold mb-4">{timetable.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day) => (
          <div key={day} className="bg-gray-50 p-2 rounded-md">
            <h3 className="font-semibold text-center mb-2">{day}</h3>
            {timetable.entries
              .filter((entry) => entry.day.includes(day.toUpperCase()))
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map((entry) => {
                const subject = subjects.find((s) => s.id === entry.subjectId);
                const teacher = staff.find((t) => t.id === entry.teacherId);
                return (
                  <div key={entry.id} className="bg-white p-2 rounded-md shadow mb-2">
                    <p className="font-semibold">{subject?.name || entry.subjectId}</p>
                    <p className="text-sm text-gray-600">{teacher?.name || entry.teacherId}</p>
                    <p className="text-xs text-gray-500">
                      {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                    </p>
                    <div className="mt-2 text-right">
                      <button onClick={() => onEditEntry(entry)} className="text-xs text-indigo-600 hover:text-indigo-900">
                        Edit
                      </button>
                      <button onClick={() => onDeleteEntry(entry)} className="text-xs text-red-600 hover:text-red-900 ml-2">
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimetableGridView;
