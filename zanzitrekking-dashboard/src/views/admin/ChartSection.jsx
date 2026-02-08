import Chart from "react-apexcharts";

const ChartSection = ({ chartConfig }) => (
  <div className="rounded-2xl bg-white p-6 shadow-nature-medium ring-1 ring-primary-100 transition-all duration-300 hover:shadow-nature-large">
    <div className="mb-6 flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h2 className="text-xl font-bold text-primary-800">Sales Analytics</h2>
        <p className="mt-1 text-sm text-text">Monthly performance overview</p>
      </div>
      <div className="flex items-center space-x-2">
        <button className="shadow-coral-soft rounded-lg bg-gradient-to-r from-secondary to-sunshine-400 px-3 py-1.5 text-sm font-semibold text-white transition-all hover:scale-105">
          Monthly
        </button>
        <button className="rounded-lg border-2 border-primary-200 bg-white px-3 py-1.5 text-sm font-medium text-primary-700 transition-all hover:bg-primary-50">
          Yearly
        </button>
        <button className="rounded-lg border-2 border-primary-200 bg-white px-3 py-1.5 text-sm font-medium text-primary-700 transition-all hover:bg-primary-50">
          All Time
        </button>
      </div>
    </div>
    <div className="relative">
      <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-secondary/10 blur-xl filter"></div>
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-primary/10 blur-xl filter"></div>
      <Chart
        options={chartConfig.options}
        series={chartConfig.series}
        type="bar"
        height={370}
      />
    </div>
  </div>
);

export default ChartSection;
