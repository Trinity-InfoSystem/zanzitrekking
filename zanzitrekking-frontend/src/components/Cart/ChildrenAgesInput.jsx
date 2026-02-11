"use client";

import { useState, useEffect, useRef } from "react";
import { BabyIcon } from "lucide-react";

export const ChildrenAgesInput = ({ 
  childrenCount, 
  childrenAges, 
  onChange,
  tripId 
}) => {
  const [ages, setAges] = useState(() => childrenAges || []);
  const prevChildrenCountRef = useRef(childrenCount);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    // Only sync when childrenCount actually changes
    if (prevChildrenCountRef.current !== childrenCount) {
      isUpdatingRef.current = true;
      prevChildrenCountRef.current = childrenCount;
      
      if (childrenCount > 0) {
        const currentAges = childrenAges || [];
        const newAges = [...currentAges];
        // Add empty ages for new children
        while (newAges.length < childrenCount) {
          newAges.push(null);
        }
        // Remove extra ages if children count decreased
        if (newAges.length > childrenCount) {
          newAges.splice(childrenCount);
        }
        setAges(newAges);
        // Only call onChange if ages actually changed
        if (JSON.stringify(newAges) !== JSON.stringify(currentAges)) {
          onChange(newAges);
        }
      } else {
        if (ages.length > 0) {
          setAges([]);
          onChange([]);
        }
      }
      
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 50);
    }
  }, [childrenCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAgeChange = (index, age) => {
    if (isUpdatingRef.current) return; // Prevent updates during initialization
    
    const newAges = [...ages];
    const parsedAge = age === "" ? null : parseInt(age);
    newAges[index] = parsedAge;
    setAges(newAges);
    onChange(newAges);
  };

  if (childrenCount === 0) {
    return null;
  }

  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
      <label className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
        <BabyIcon className="h-4 w-4 text-emerald-600" />
        <span>Children Ages (for discount calculation)</span>
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: childrenCount }).map((_, index) => (
          <div key={index}>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Child {index + 1} Age
            </label>
            <input
              type="number"
              min="0"
              max="18"
              value={ages[index] !== null && ages[index] !== undefined ? ages[index] : ""}
              onChange={(e) => handleAgeChange(index, e.target.value)}
              placeholder="Age"
              className="w-full rounded-lg border-2 border-gray-200 bg-white px-3 py-2 text-sm font-medium transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            {ages[index] !== null && ages[index] !== undefined && (
              <p className="mt-1 text-xs text-emerald-600">
                {ages[index] >= 5 && ages[index] < 12 
                  ? `15% discount applied` 
                  : ages[index] >= 12 && ages[index] <= 15
                    ? `10% discount applied`
                    : ages[index] >= 16 
                      ? "Adult price" 
                      : ages[index] < 5
                        ? "No discount (under 5)"
                        : ""}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        💡 Children ages 5-11 receive a 15% discount. Ages 12-15 receive a 10% discount. Ages 16+ are charged at adult rates.
      </p>
    </div>
  );
};
