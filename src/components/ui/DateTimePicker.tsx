"use client";

import * as React from "react";
import { format } from "date-fns";
import { FaCalendarAlt } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "./input";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function DateTimePicker({ date, setDate }: DateTimePickerProps) {
  const isValidDate = (d: Date | undefined): d is Date => {
    return d instanceof Date && !isNaN(d.getTime());
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) {
      setDate(undefined);
      return;
    }
    const now = new Date();
    const newDateTime = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      now.getHours(),
      now.getMinutes()
    );
    setDate(newDateTime);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const newDateTime = new Date(
      date?.getFullYear() || new Date().getFullYear(),
      date?.getMonth() || new Date().getMonth(),
      date?.getDate() || new Date().getDate(),
      hours,
      minutes
    );
    setDate(newDateTime);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <FaCalendarAlt className="mr-2 h-4 w-4" />
          {isValidDate(date) ? (
            format(date, "PPP p")
          ) : (
            <span>Pick a date and time</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={isValidDate(date) ? date : undefined}
          onSelect={handleDateChange}
          initialFocus
        />
        <div className="p-2 border-t border-border">
          <Input
            type="time"
            defaultValue={isValidDate(date) ? format(date, "HH:mm") : ""}
            onChange={handleTimeChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
