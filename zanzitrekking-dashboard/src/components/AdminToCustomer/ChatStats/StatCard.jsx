const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  bgColor = "bg-gradient-to-br from-primary to-primary-600",
}) => {
  return (
    <div className="group overflow-hidden rounded-xl bg-white p-5 shadow-nature-soft ring-1 ring-primary-100 transition-all duration-300 hover:scale-[1.02] hover:shadow-nature-medium">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-text-light transition-colors group-hover:text-primary-700">
            {title}
          </h3>
          <p className="mt-1 text-3xl font-bold text-primary-800 transition-colors group-hover:text-primary-900">
            {value || 0}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor} text-white shadow-sm transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs">
        <span
          className={`flex items-center ${trend?.color || "text-text-light"}`}
        >
          {trend?.text || "No data available"}
        </span>
      </div>

      {/* Animated progress bar */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-neutral-200">
        <div
          className={`h-full ${bgColor} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: `${Math.min((value / 100) * 100, 100)}%`,
            animation: "pulse 2s infinite",
          }}
        ></div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default StatCard;
