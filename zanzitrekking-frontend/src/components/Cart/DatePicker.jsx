"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangleIcon,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  addDays,
  addMonths,
  differenceInDays,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  subMonths,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isBefore,
  startOfDay,
  parse,
} from "date-fns";

export const DatePicker = ({
  date,
  onChange,
  categoryName,
  selectedCategory = "standard",
}) => {
  const [warningMessage, setWarningMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const d = date
      ? typeof date === "string"
        ? new Date(date)
        : date
      : addDays(new Date(), 1);
    return startOfMonth(d);
  });
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 280 });

  // Convert date to Date object if it's a string
  // CRITICAL: Use UTC to prevent timezone shifts
  const getDateValue = () => {
    if (!date) {
      const tomorrow = addDays(new Date(), 1);
      return new Date(Date.UTC(
        tomorrow.getUTCFullYear(),
        tomorrow.getUTCMonth(),
        tomorrow.getUTCDate(),
        12, 0, 0, 0
      ));
    }
    if (date instanceof Date) {
      // Extract UTC components to create a stable date at UTC noon
      return new Date(Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        12, 0, 0, 0
      ));
    }
    // Parse YYYY-MM-DD strings using UTC to avoid timezone issues
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const [year, month, day] = date.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
    }
    // For ISO strings, extract UTC components
    if (typeof date === "string" && date.includes("T")) {
      const parsed = new Date(date);
      return new Date(Date.UTC(
        parsed.getUTCFullYear(),
        parsed.getUTCMonth(),
        parsed.getUTCDate(),
        12, 0, 0, 0
      ));
    }
    // Fallback - extract UTC components
    const parsed = new Date(date);
    return new Date(Date.UTC(
      parsed.getUTCFullYear(),
      parsed.getUTCMonth(),
      parsed.getUTCDate(),
      12, 0, 0, 0
    ));
  };

  const dateValue = getDateValue();
  const minDate = addDays(new Date(), 1);
  minDate.setHours(0, 0, 0, 0);

  // Keep viewMonth in sync when dropdown opens (show selected date's month)
  useEffect(() => {
    if (isOpen) {
      const d = getDateValue();
      setViewMonth(startOfMonth(d));
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Position dropdown below trigger when opening (for portal; fixed = viewport coords)
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  }, [isOpen]);

  // Click outside to close (check both trigger container and portal dropdown)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inTrigger = containerRef.current?.contains(e.target);
      const inDropdown = dropdownRef.current?.contains(e.target);
      if (!inTrigger && !inDropdown) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Check for warning message based on booking restrictions
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(dateValue);
    selectedDate.setHours(0, 0, 0, 0);
    const daysUntilTrip = differenceInDays(selectedDate, today);

    const isBudget = selectedCategory === "standard";
    const isMidOrLux =
      selectedCategory === "midRange" || selectedCategory === "luxury";
    const isSafari =
      categoryName && categoryName.toLowerCase().includes("safari");
    const isCultural =
      categoryName && categoryName.toLowerCase().includes("cultural");
    const isTrekking =
      categoryName && categoryName.toLowerCase().includes("trekking");
    const isZanzibar =
      categoryName && categoryName.toLowerCase().includes("zanzibar");

    let msg = "";

    if (isCultural || isTrekking || isZanzibar) {
      if (daysUntilTrip === 1) {
        msg =
          "This trip starts tomorrow. Please contact us first to confirm availability before completing your booking.";
      }
    } else if (isSafari) {
      if (isBudget && daysUntilTrip === 1) {
        msg =
          "This Safari trip starts tomorrow. Please contact us first to confirm availability before completing your booking.";
      }
      if (isMidOrLux && daysUntilTrip >= 1 && daysUntilTrip <= 4) {
        msg =
          "This Midrange/Luxury Safari trip starts within 4 days. Please contact us first to confirm availability before completing your booking.";
      }
    }

    setWarningMessage(msg);
  }, [dateValue, categoryName, selectedCategory]);

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewMonth((m) => subMonths(m, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewMonth((m) => addMonths(m, 1));
  };

  const handleDayClick = (day) => {
    const dayStart = startOfDay(day);
    if (isBefore(dayStart, minDate)) {
      return;
    }
    // Create a Date object at UTC noon to prevent timezone shifts when formatted
    // This ensures the date stays the same regardless of timezone
    const utcDate = new Date(Date.UTC(
      dayStart.getFullYear(),
      dayStart.getMonth(),
      dayStart.getDate(),
      12, 0, 0, 0 // Noon UTC to prevent timezone shifts
    ));
    onChange(utcDate);
    setIsOpen(false);
  };

  const handleTodayClick = () => {
    onChange(format(minDate, "yyyy-MM-dd"));
    setViewMonth(startOfMonth(minDate));
    setIsOpen(false);
  };

  const handleClearClick = () => {
    onChange(format(minDate, "yyyy-MM-dd"));
    setViewMonth(startOfMonth(minDate));
    setIsOpen(false);
  };

  const formatDateForInput = () => {
    try {
      if (!dateValue || isNaN(dateValue.getTime())) {
        const tomorrow = addDays(new Date(), 1);
        const year = tomorrow.getUTCFullYear();
        const month = String(tomorrow.getUTCMonth() + 1).padStart(2, "0");
        const day = String(tomorrow.getUTCDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
      // Format using UTC components to prevent timezone shifts
      const year = dateValue.getUTCFullYear();
      const month = String(dateValue.getUTCMonth() + 1).padStart(2, "0");
      const day = String(dateValue.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      const tomorrow = addDays(new Date(), 1);
      const year = tomorrow.getUTCFullYear();
      const month = String(tomorrow.getUTCMonth() + 1).padStart(2, "0");
      const day = String(tomorrow.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  };

  // Build calendar grid: weeks from start of week of month start to end of week of month end
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const start = startOfWeek(monthStart, { weekStartsOn: 0 });
  const end = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const calendarDropdown = isOpen ? (
    <div
      ref={dropdownRef}
      className="rounded-lg bg-white p-3 shadow-xl max-w-xs"
      style={{
        position: "fixed",
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        minWidth: 280,
        zIndex: 99999,
      }}
    >
      {/* Month navigation - arrows only change view, not selection */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="rounded p-1.5 text-black hover:bg-gray-200"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold text-black">
          {format(viewMonth, "MMMM yyyy")}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="rounded p-1.5 text-black hover:bg-gray-200"
          aria-label="Next month"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center">
        {weekDays.map((d) => (
          <div key={d} className="py-1 text-xs font-medium text-gray-600">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const dayStart = startOfDay(day);
          const isDisabled = isBefore(dayStart, minDate);
          const isSelected = isSameDay(day, dateValue);
          const isCurrentMonth = isSameMonth(day, viewMonth);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => !isDisabled && handleDayClick(day)}
              disabled={isDisabled}
              className={`rounded py-1.5 text-sm transition-colors ${isDisabled
                  ? "cursor-not-allowed text-gray-300"
                  : isSelected
                    ? "bg-black text-white hover:bg-gray-800"
                    : isCurrentMonth
                      ? "text-black hover:bg-gray-200"
                      : "text-gray-400 hover:bg-gray-100"
                }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      {/* Today and Clear buttons */}
      <div className="mt-3 flex gap-2 border-t border-gray-200 pt-3">
        <button
          type="button"
          onClick={handleTodayClick}
          className="flex-1 rounded border border-black bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-gray-100"
        >
          Today
        </button>
        <button
          type="button"
          onClick={handleClearClick}
          className="flex-1 rounded border border-gray-400 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          Clear
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative w-full" ref={containerRef}>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <CalendarIcon className="h-4 w-4 flex-shrink-0" />
        <span className="whitespace-nowrap">Trip Start Date</span>
      </label>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`w-full rounded-lg border px-3 py-2 text-left text-sm text-black shadow-sm transition-all focus:outline-none focus:ring-1 ${warningMessage
            ? "border-gray-400 focus:border-black focus:ring-gray-300"
            : "border-gray-300 focus:border-black focus:ring-gray-300"
          }`}
      >
        {format(dateValue, "MMM d, yyyy")}
      </button>

      {typeof document !== "undefined" &&
        createPortal(calendarDropdown, document.body)}

      {warningMessage && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-2.5">
          <AlertTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600" />
          <p className="text-xs leading-relaxed text-yellow-800">
            {warningMessage}
          </p>
        </div>
      )}
    </div>
  );
};
