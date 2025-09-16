"use client";

import React, { useMemo, useEffect } from "react";
import { useTimetableStore } from "@/store/timetableStore";
import { WeekDay, Entry as TimetableEntry } from "@/services/timetableService";
import EntryCard from "./EntryCard";
import { usePermissions } from "@/utils/permissions";
import { UserRole } from "@/constants/roles";
import { Loader } from "lucide-react";

/**
 * TimetableGrid — calendar-style timetable with overlapping and multi-day support.
 *
 * Notes:
 * - EntryCard should accept a `style?: React.CSSProperties` prop so we can position it.
 * - openModal() is called on empty cell click. If you want prefilled data in the modal
 *   extend your store's openModal signature to accept a small prefill object and pass it here.
 */

/* Helper: format Date -> "HH:mm" (deterministic) */
const formatHHMM = (d: string | Date) => {
  const date = new Date(d);
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
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

interface SchoolIdProps {
  sectionId: string;
}

const TimetableGrid = ({sectionId}: SchoolIdProps) => {
  const { selectedTimetable, openModal, isLoading, fetchClassTimetable } = useTimetableStore();
  const { hasRole } = usePermissions();
  const isAdmin = hasRole(UserRole.ADMIN) || hasRole(UserRole.SUPER_ADMIN);


  useEffect(() => {
    if (sectionId) {
     fetchClassTimetable(sectionId);
    }
  }, [sectionId, fetchClassTimetable]);

  const entries: TimetableEntry[] = selectedTimetable?.entries || [];

  // ---- COMPUTE time window for the whole timetable ----
  const { dayStartStr, dayEndStr, totalMinutes, entriesByDay } = useMemo(() => {
    if (!entries.length) {
      // default school hours (fallback)
      return {
        dayStartStr: "08:00",
        dayEndStr: "16:00",
        totalMinutes: 8 * 60,
        entriesByDay: new Map<WeekDay, TimetableEntry[]>(),
      };
    }

    let minTs = Infinity;
    let maxTs = -Infinity;
    const map = new Map<WeekDay, TimetableEntry[]>();

    entries.forEach((e) => {
      const s = new Date(e.startTime).getTime();
      const en = new Date(e.endTime).getTime();
      if (s < minTs) minTs = s;
      if (en > maxTs) maxTs = en;

      // each entry can belong to multiple days
      e.day.forEach((d) => {
        const day = d as WeekDay;
        if (!map.has(day)) map.set(day, []);
        map.get(day)!.push(e);
      });
    });

    // round down start to nearest 30 minutes, round up end to nearest 30 for nicer layout
    const roundDown = (ts: number) => {
      const date = new Date(ts);
      const mins = date.getMinutes();
      const rounded = mins >= 30 ? 30 : 0;
      date.setMinutes(rounded, 0, 0);
      return date.getTime();
    };
    const roundUp = (ts: number) => {
      const date = new Date(ts);
      const mins = date.getMinutes();
      if (mins === 0) return date.getTime();
      if (mins <= 30) date.setMinutes(30, 0, 0);
      else date.setHours(date.getHours() + 1, 0, 0);
      return date.getTime();
    };

    const startTs = roundDown(minTs);
    const endTs = roundUp(maxTs);
    const totalMinutes = Math.max(30, Math.round((endTs - startTs) / 60000));

    const dayStartStr = new Date(startTs).toISOString().slice(11, 16); // "HH:MM"
    const dayEndStr = new Date(endTs).toISOString().slice(11, 16);

    return { dayStartStr, dayEndStr, totalMinutes, entriesByDay: map };
  }, [entries]);

  const layoutByDay = useMemo(() => {
    const layout = new Map<WeekDay, { item: TimetableEntry; lane: number }[]>();

    dayOrder.forEach((day) => {
      const list = (entriesByDay.get(day) || []).slice().sort((a, b) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });

      const lanesEnd: number[] = []; // end timestamp per lane
      const itemsWithLane: { item: TimetableEntry; lane: number }[] = [];

      list.forEach((it) => {
        const s = new Date(it.startTime).getTime();
        const e = new Date(it.endTime).getTime();
        // find lane
        let found = -1;
        for (let i = 0; i < lanesEnd.length; i++) {
          if (s >= lanesEnd[i]) {
            found = i;
            lanesEnd[i] = e;
            break;
          }
        }
        if (found === -1) {
          found = lanesEnd.length;
          lanesEnd.push(e);
        }
        itemsWithLane.push({ item: it, lane: found });
      });

      layout.set(day, itemsWithLane);
    });

    return layout;
  }, [entriesByDay]);

  // Precompute lane counts so we know each day's column lane count
  const lanesCountByDay = useMemo(() => {
    const map = new Map<WeekDay, number>();
    layoutByDay.forEach((arr, day) => {
      let max = 0;
      arr.forEach((a) => {
        if (a.lane + 1 > max) max = a.lane + 1;
      });
      map.set(day, Math.max(1, max));
    });
    // ensure at least 1 lane for days with no entries (so cell still usable)
    dayOrder.forEach((d) => {
      if (!map.has(d)) map.set(d, 1);
    });
    return map;
  }, [layoutByDay]);

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
        <p className="text-gray-500">Select a class and section to view the timetable.</p>
      </div>
    );
  }

  // Helper to compute top/height percentage relative to dayStart/dayEnd
  const computeTopHeight = (startISO: string, endISO: string) => {
    const s = new Date(startISO).getTime();
    const e = new Date(endISO).getTime();

    // compute base start time (dayStartStr)
    // convert dayStartStr to today's date to compare
    const baseDate = new Date();
    const [baseH, baseM] = dayStartStr.split(":").map(Number);
    baseDate.setHours(baseH, baseM, 0, 0);
    const baseTs = baseDate.getTime();

    // If baseTs ends up > s (because entries come from different actual dates) we still compute relative to s by shifting base
    // We'll compute difference in minutes relative to baseTs
    const topMinutes = Math.max(0, Math.round((s - baseTs) / 60000));
    const heightMinutes = Math.max(1, Math.round((e - s) / 60000));
    const top = (topMinutes / totalMinutes) * 100;
    const height = (heightMinutes / totalMinutes) * 100;
    return { top, height };
  };

  // Render
  return (
    <div className="w-full overflow-auto">
      {/* header: days */}
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[120px_repeat(6,1fr)] items-stretch border border-gray-200">
          {/* Time column header */}
          <div className="p-2 bg-gray-50 border-r border-gray-200">Time</div>
          {dayOrder.slice(0, 6).map((day) => (
            <div key={day} className="p-2 text-sm font-medium bg-white border-r border-gray-200 capitalize">
              {day.toLowerCase()}
            </div>
          ))}
        </div>

        {/* main body: times + day columns (relative positioning) */}
        <div
          className="grid grid-cols-[120px_repeat(6,1fr)] relative"
          style={{ minHeight: "480px", border: "1px solid #e5e7eb" }}
        >
          {/* Time labels column */}
          <div className="border-r border-gray-200 p-2 bg-gray-50">
            {/* we will render a vertical time ruler: from dayStartStr to dayEndStr in 30-min steps */}
            {(() => {
              const parts: JSX.Element[] = [];
              // compute numeric start/end in minutes from midnight
              const [startH, startM] = dayStartStr.split(":").map(Number);
              const [endH, endM] = dayEndStr.split(":").map(Number);
              let cur = startH * 60 + startM;
              const end = endH * 60 + endM;
              while (cur <= end) {
                const hh = Math.floor(cur / 60);
                const mm = cur % 60;
                const label = new Date(0, 0, 0, hh, mm).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
                parts.push(
                  <div key={cur} className="text-xs text-gray-500 h-12 flex items-start">
                    {label}
                  </div>
                );
                cur += 30; // 30-minute ticks
              }
              return parts;
            })()}
          </div>

          {/* Day columns */}
          {dayOrder.slice(0, 6).map((day) => {
            const items = layoutByDay.get(day) || [];
            const lanes = lanesCountByDay.get(day) || 1;

            // For empty background grid lines: create same number of 30-min rows as time column
            const [startH, startM] = dayStartStr.split(":").map(Number);
            const [endH, endM] = dayEndStr.split(":").map(Number);
            let cur = startH * 60 + startM;
            const end = endH * 60 + endM;
            const slots: JSX.Element[] = [];
            while (cur <= end) {
              slots.push(
                <div key={cur} className="h-12 border-b border-gray-100" />
              );
              cur += 30;
            }

            return (
              <div
                key={day}
                className="relative p-2 bg-white"
                // allow clicking empty areas to add
                onClick={(e) => {
                  // If clicked directly on column background (not on an entry), open modal
                  // But we must ensure target is the column itself or inner empty area.
                  const target = e.target as HTMLElement;
                  // avoid opening when clicking a child entry
                  if (target.closest("[data-entry-id]")) return;
                  if (isAdmin) {
                    // TODO: compute nearest time slot from click position to prefill modal
                    // For now, just open modal. To prefill compute y% relative to column and convert to time.
                    openModal();
                  }
                }}
              >
                {/* background grid rows */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="flex flex-col h-full">
                    {slots}
                  </div>
                </div>

                {/* container for positioned entries */}
                <div className="relative w-full h-full">
                  {items.map(({ item, lane }, idx) => {
                    // compute positioning & width using start/end relative to dayStart/dayEnd
                    const { top, height } = computeTopHeight(item.startTime, item.endTime);
                    const numLanes = lanesCountByDay.get(day) || 1;
                    const widthPercent = 100 / numLanes;
                    const leftPercent = (lane * widthPercent);

                    // minimal visual padding
                    const style: React.CSSProperties = {
                      position: "absolute",
                      top: `${top}%`,
                      height: `${height}%`,
                      left: `${leftPercent}%`,
                      width: `calc(${widthPercent}% - 6px)`,
                      marginLeft: "3px",
                      marginRight: "3px",
                      boxSizing: "border-box",
                      zIndex: 2,
                    };

                    return (
                      <div
                        key={item.id}
                        data-entry-id={item.id}
                        style={style}
                        onClick={(e) => {
                          e.stopPropagation();
                          // pass full entry into modal for editing
                          openModal(item as any); // if you want strict typing: change openModal signature
                        }}
                        className="cursor-pointer"
                      >
                        <EntryCard entry={item} style={{ height: "100%" }} />
                      </div>
                    );
                  })}
                </div>

                {/* show + Add placeholder when no entries */}
                {(!items || items.length === 0) && isAdmin && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 pointer-events-none">
                    + Add
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;
