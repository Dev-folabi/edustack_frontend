import React from 'react';
import { ITimetable } from '@/types/timetable';
import { Class } from '@/store/classStore';

interface TimetableListViewProps {
  timetables: ITimetable[];
  classes: Class[];
  onView: (timetable: ITimetable) => void;
  onEdit: (timetable: ITimetable) => void;
  onDelete: (timetable: ITimetable) => void;
}

const TimetableListView: React.FC<TimetableListViewProps> = ({ timetables, classes, onView, onEdit, onDelete }) => {
  const getClassName = (classId: string) => {
    const a_class = classes.find((c) => c.id === classId);
    return a_class ? a_class.name : 'N/A';
  };

  return (
    <div className="bg-white shadow-md rounded-md">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Class
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Section
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Session
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Term
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {timetables.map((timetable) => (
            <tr key={timetable.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{timetable.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getClassName(timetable.classId)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timetable.section.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timetable.session.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{timetable.term.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onView(timetable)} className="text-indigo-600 hover:text-indigo-900">
                  View
                </button>
                <button onClick={() => onEdit(timetable)} className="text-yellow-600 hover:text-yellow-900 ml-4">
                  Edit
                </button>
                <button onClick={() => onDelete(timetable)} className="text-red-600 hover:text-red-900 ml-4">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TimetableListView;
