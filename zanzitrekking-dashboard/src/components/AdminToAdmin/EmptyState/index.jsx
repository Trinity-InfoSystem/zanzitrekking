const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-200">
        {title}
      </h3>
      <p className="mb-6 text-sm text-gray-400">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <action.icon className="mr-2 h-4 w-4" />
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
