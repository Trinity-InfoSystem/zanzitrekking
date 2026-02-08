const MessageDateSeparator = ({ date }) => {
  const formatDate = (dateString) => {
    const today = new Date();
    const messageDate = new Date(dateString);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="rounded-full bg-gray-700 px-3 py-1 text-xs text-gray-300">
        {formatDate(date)}
      </div>
    </div>
  );
};

export default MessageDateSeparator;
