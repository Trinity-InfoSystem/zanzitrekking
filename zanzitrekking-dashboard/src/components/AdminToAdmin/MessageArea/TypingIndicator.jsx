const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="rounded-lg bg-gray-700 px-4 py-2">
        <div className="flex space-x-1">
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
