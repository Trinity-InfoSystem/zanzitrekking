import { ArrowUpRight } from "lucide-react";

const StatsCard = ({
  label,
  value,
  change,
  icon,
  bgGradient,
  blurGradient,
  hoverBlur,
  loading = false,
}) => (
  <div
    className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-neutral-50 p-6 shadow-nature-soft ring-1 ring-primary-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-nature-medium hover:ring-secondary-200`}
  >
    <div
      className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${blurGradient} blur-xl filter ${hoverBlur}`}
    ></div>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium uppercase tracking-wider text-text-light">
          {label}
        </p>
        {loading ? (
          <div className="mt-2 h-10 w-24 animate-pulse rounded bg-neutral-200"></div>
        ) : (
          <h2 className="mt-2 text-4xl font-extrabold text-primary-800">
            {value}
          </h2>
        )}
        {loading ? (
          <div className="mt-3 h-4 w-32 animate-pulse rounded bg-neutral-200"></div>
        ) : (
          <div className="mt-3 flex items-center text-sm font-medium text-secondary">
            <ArrowUpRight className="mr-1 h-4 w-4" />
            <span>{change}</span>
          </div>
        )}
      </div>
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${bgGradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl`}
      >
        {loading ? (
          <div className="h-8 w-8 animate-pulse rounded bg-white/20"></div>
        ) : (
          icon
        )}
      </div>
    </div>
  </div>
);

export default StatsCard;
