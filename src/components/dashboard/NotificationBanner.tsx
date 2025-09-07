"use client";

import React, { useState, useMemo } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';

export const NotificationBanner = () => {
  const { selectedSession } = useSessionStore();
  const [isVisible, setIsVisible] = useState(true);

  const daysUntilEnd = useMemo(() => {
    if (!selectedSession) return null;
    const endDate = new Date(selectedSession.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [selectedSession]);

  if (!isVisible || !daysUntilEnd || daysUntilEnd > 30 || daysUntilEnd < 0) {
    return null;
  }

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
      <div className="flex">
        <div className="py-1">
          <FaInfoCircle className="h-5 w-5 text-yellow-500 mr-3" />
        </div>
        <div>
          <p className="font-bold">Session Reminder</p>
          <p className="text-sm">
            The current session, &apos;{selectedSession?.name}&apos;, is ending in {daysUntilEnd} {daysUntilEnd === 1 ? 'day' : 'days'}. Please prepare for the next academic session.
          </p>
        </div>
        <div className="ml-auto pl-3">
          <button onClick={() => setIsVisible(false)} aria-label="Dismiss">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
