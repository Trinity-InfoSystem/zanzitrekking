const MessageDateSeparator = ({ date }) => {
  const [day, month, year] = date.split("/").map(Number);

  // Months are 0-indexed in JS Date
  const dateObj = new Date(year, month - 1, day);
  return (
    <div className="relative mb-4 flex items-center">
      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
      <span className="mx-4 flex-shrink text-xs font-medium text-gray-500 dark:text-gray-400">
        {dateObj.toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </span>
      <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
    </div>
  );
};

export default MessageDateSeparator;
