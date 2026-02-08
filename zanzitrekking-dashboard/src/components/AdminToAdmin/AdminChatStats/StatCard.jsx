const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-nature-soft ring-1 ring-primary-100 transition-all hover:shadow-nature-medium">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`rounded-xl p-3 ${color} text-white shadow-sm`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="truncate text-sm font-medium text-text-light">
                {title}
              </dt>
              <dd className="text-lg font-bold text-primary-800">{value}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
