import React, { useState, useEffect } from 'react';
import { useClassStore } from '@/store/classStore';
import { useAuthStore } from '@/store/authStore';

interface ClassAndSectionSelectorProps {
  onSelectionChange: (classId: string, sectionId: string) => void;
}

const ClassAndSectionSelector: React.FC<ClassAndSectionSelectorProps> = ({ onSelectionChange }) => {
  const { classes, fetchClasses, isLoading } = useClassStore();
  const { user } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  useEffect(() => {
    if (user?.schoolId) {
      fetchClasses(user.schoolId);
    }
  }, [user, fetchClasses]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      onSelectionChange(selectedClass, selectedSection);
    }
  }, [selectedClass, selectedSection, onSelectionChange]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setSelectedSection('');
  };

  const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSection(e.target.value);
  };

  const selectedClassData = classes.find((c) => c.id === selectedClass);

  return (
    <div className="flex space-x-4 mb-4">
      <div>
        <label htmlFor="class" className="block text-sm font-medium text-gray-700">
          Class
        </label>
        <select
          id="class"
          name="class"
          value={selectedClass}
          onChange={handleClassChange}
          disabled={isLoading}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select a class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {selectedClass && (
        <div>
          <label htmlFor="section" className="block text-sm font-medium text-gray-700">
            Section
          </label>
          <select
            id="section"
            name="section"
            value={selectedSection}
            onChange={handleSectionChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Select a section</option>
            {selectedClassData?.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default ClassAndSectionSelector;
