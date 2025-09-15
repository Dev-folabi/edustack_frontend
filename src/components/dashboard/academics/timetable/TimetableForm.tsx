import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ITimetable, ITimetableEntry } from '@/types/timetable';

interface TimetableFormProps {
  timetable?: ITimetable;
  entry?: ITimetableEntry;
  isEntryForm?: boolean;
  onSubmit: (data: any) => void;
}

const TimetableForm: React.FC<TimetableFormProps> = ({ timetable, entry, isEntryForm, onSubmit }) => {
  const { register, control, handleSubmit } = useForm({
    defaultValues: isEntryForm ? entry : timetable || {},
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'entries',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {isEntryForm ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="day" className="block text-sm font-medium text-gray-700">
              Day
            </label>
            <input
              type="text"
              {...register('day')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
              Start Time
            </label>
            <input
              type="time"
              {...register('startTime')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
              End Time
            </label>
            <input
              type="time"
              {...register('endTime')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          <div>
            <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              {...register('subjectId')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          <div>
            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700">
              Teacher
            </label>
            <input
              type="text"
              {...register('teacherId')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Timetable Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">Entries</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-md mb-4">
              {/* ... fields for entries ... */}
              <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-900 mt-2">
                Remove Entry
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => append({ day: [], startTime: '', endTime: '', subjectId: '', teacherId: '' })}
            className="text-indigo-600 hover:text-indigo-900 mb-4"
          >
            Add Entry
          </button>
        </>
      )}

      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md mt-4">
        Save
      </button>
    </form>
  );
};

export default TimetableForm;
