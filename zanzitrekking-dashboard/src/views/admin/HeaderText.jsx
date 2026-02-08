import React from "react";

export default function HeaderText({ title }) {
  return (
    <div className="mb-6 flex items-center justify-between rounded-lg bg-white p-4 shadow-md lg:hidden dark:bg-gray-800">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">
        {title}
      </h1>
    </div>
  );
}
