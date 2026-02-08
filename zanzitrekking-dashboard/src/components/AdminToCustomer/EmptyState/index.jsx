const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300">
        {title}
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-all focus:outline-none"
        >
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;