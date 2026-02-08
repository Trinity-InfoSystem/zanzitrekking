const TypingIndicator = ({ name }) => {
  return (
    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
      <div className="flex space-x-1">
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500"
          style={{ animationDelay: "300ms" }}
        />
      </div>
      <span className="text-xs">{name} is typing...</span>
    </div>
  );
};

export default TypingIndicator;