"use client";

import { MinusCircleIcon, PlusCircleIcon, UsersIcon } from "lucide-react";

export const TravelersCounter = ({ count, onChange }) => {
  return (
    <div className="w-full">
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-700">
        <UsersIcon className="h-4 w-4 flex-shrink-0" />
        <span className="whitespace-nowrap">Number of Travelers</span>
      </label>
      <div className="flex h-[38px] items-center overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
        <button
          className="flex h-full items-center justify-center px-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onChange(count - 1)}
          disabled={count <= 1}
        >
          <MinusCircleIcon className="h-4 w-4" />
        </button>
        <div className="flex h-full flex-1 items-center justify-center border-x border-gray-200 px-3 font-medium text-sm sm:text-base">
          {count}
        </div>
        <button
          className="flex h-full items-center justify-center px-3 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onChange(count + 1)}
          disabled={count >= 10}
        >
          <PlusCircleIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};