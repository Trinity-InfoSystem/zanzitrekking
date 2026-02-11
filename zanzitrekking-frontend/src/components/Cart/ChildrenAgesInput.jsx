"use client";

import { useState, useEffect } from "react";
import { BabyIcon } from "lucide-react";

export const ChildrenAgesInput = ({ 
  childrenCount, 
  childrenAges, 
  onChange,
  tripId 
}) => {
  const [ages, setAges] = useState(childrenAges || []);

  useEffect(() => {
    // Initialize ages array when childrenCount changes
    if (childrenCount > 0) {
      const newAges = [...(childrenAges || [])];
      // Add empty ages for new children
      while (newAges.length < childrenCount) {
        newAges.push(null);
      }
      // Remove extra ages if children count decreased
      if (newAges.length > childrenCount) {
        newAges.splice(childrenCount);
      }
      // Only update if there are changes
      if (JSON.stringify(newAges) !== JSON.stringify(ages)) {
        setAges(newAges);
        onChange(newAges);
      }
    } else {
      if (ages.length > 0) {
        setAges([]);
        onChange([]);
      }
    }
  }, [childrenCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAgeChange = (index, age) => {
    const newAges = [...ages];
    newAges[index] = age === "" ? null : parseInt(age);
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
              value={ages[index] || ""}
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
        💡 Children ages 5-12 receive a 15% discount. Ages 12-15 receive a 10% discount. Ages 16+ are charged at adult rates.
      </p>
    </div>
  );
};
