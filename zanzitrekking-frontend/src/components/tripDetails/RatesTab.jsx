"use client";

import { useEffect, useState, useMemo } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  Crown,
  DollarSign,
  Info,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

const currencies = [
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    flag: "https://flagcdn.com/w40/us.png",
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    flag: "https://flagcdn.com/w40/eu.png",
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    flag: "https://flagcdn.com/w40/gb.png",
  },
  {
    code: "TZS",
    symbol: "TSh",
    name: "Tanzanian Shilling",
    flag: "https://flagcdn.com/w40/tz.png",
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    flag: "https://flagcdn.com/w40/jp.png",
  },
  {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    flag: "https://flagcdn.com/w40/cn.png",
  },
  {
    code: "CHF",
    symbol: "Fr",
    name: "Swiss Franc",
    flag: "https://flagcdn.com/w40/ch.png",
  },
  {
    code: "CAD",
    symbol: "C$",
    name: "Canadian Dollar",
    flag: "https://flagcdn.com/w40/ca.png",
  },
  {
    code: "AUD",
    symbol: "A$",
    name: "Australian Dollar",
    flag: "https://flagcdn.com/w40/au.png",
  },
];

const MobilePricingCard = ({
  group,
  prices,
  categories,
  isLoading,
  convertPrice,
}) => {
  return (
    <div className="pricing-card overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm">
      <div className="border-b border-neutral-100 bg-gradient-to-r from-slate-50/30 to-transparent p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 shadow-sm">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">
              {group.label}
            </div>
            <div className="text-xs text-slate-500">
              {group.number} {group.number === 1 ? "traveler" : "travelers"}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-4">
        {categories.map((category) => {
          const categoryPrices = prices[category.key];
          if (!categoryPrices) {return null;}

          const hasAnyPrices = Object.values(categoryPrices).some(
            (price) => price && price > 0,
          );
          if (!hasAnyPrices) {return null;}

          const price = categoryPrices[group.key];
          const convertedPrice = convertPrice(price);
          const CategoryIcon = category.icon;

          return (
            <div
              key={category.key}
              className={`category-card flex items-center justify-between rounded-lg ${category.colorClasses.bg} border ${category.colorClasses.border} p-3.5 transition-all ${category.colorClasses.hover}`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br ${category.colorClasses.gradient} shadow-sm`}
                >
                  <CategoryIcon className="h-4 w-4 text-white" />
                </div>
                <span
                  className={`text-sm font-semibold ${category.colorClasses.text}`}
                >
                  {category.label}
                </span>
              </div>
              {isLoading ? (
                <div className="h-6 w-24 animate-pulse rounded bg-neutral-200"></div>
              ) : price && price > 0 ? (
                <div
                  className={`text-lg font-bold ${category.colorClasses.price}`}
                >
                  {convertedPrice}
                </div>
              ) : (
                <span className="text-sm text-neutral-400">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RatesTab = ({ trip }) => {
  const { pricingType, regularPrices, seasons, discount } = trip;

  const memoizedRegularGroups = useMemo(
    () => (pricingType === "yearRound" && regularPrices ? getAllGroupSizes(regularPrices) : []),
    [pricingType, regularPrices]
  );

  const memoizedSeasonalGroups = useMemo(
    () => (pricingType === "seasonal" && seasons ? seasons.map(s => getAllGroupSizes(s.rates || {})) : []),
    [pricingType, seasons]
  );

  const categories = [
    {
      key: "standard",
      label: "Budget",
      description: "Comfortable & Reliable",
      colorClasses: {
        bg: "bg-slate-50",
        text: "text-slate-700",
        price: "text-slate-900",
        gradient: "from-slate-500 to-slate-600",
        border: "border-slate-200",
        hover: "hover:bg-slate-100",
      },
      icon: Shield,
    },
    {
      key: "midRange",
      label: "Mid-Range",
      description: "Enhanced Experience",
      colorClasses: {
        bg: "bg-emerald-50/40",
        text: "text-emerald-800",
        price: "text-emerald-900",
        gradient: "from-emerald-600 to-emerald-700",
        border: "border-emerald-200",
        hover: "hover:bg-emerald-50",
      },
      icon: Star,
    },
    {
      key: "luxury",
      label: "Luxury",
      description: "Ultimate Safari",
      colorClasses: {
        bg: "bg-indigo-50/40",
        text: "text-indigo-800",
        price: "text-indigo-900",
        gradient: "from-indigo-600 to-indigo-700",
        border: "border-indigo-200",
        hover: "hover:bg-indigo-50",
      },
      icon: Crown,
    },
  ];

  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [exchangeRates, setExchangeRates] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchExchangeRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("https://open.er-api.com/v6/latest/USD");
      const data = await response.json();

      if (data.rates) {
        setExchangeRates(data.rates);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      setError("Failed to fetch exchange rates. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".currency-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  const formatNumber = (number, currencyCode) => {
    const formatter = new Intl.NumberFormat(undefined, {
      minimumFractionDigits:
        currencyCode === "JPY" || currencyCode === "TZS" ? 0 : 2,
      maximumFractionDigits:
        currencyCode === "JPY" || currencyCode === "TZS" ? 0 : 2,
    });
    return formatter.format(number);
  };

  const convertPrice = (price) => {
    if (!price || !exchangeRates) {return null;}
    const rate = exchangeRates[selectedCurrency];
    const converted = price * rate;
    const currency = currencies.find((c) => c.code === selectedCurrency);
    return `${currency.symbol}${formatNumber(converted, selectedCurrency)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const selectedCurrencyObj = currencies.find(
    (c) => c.code === selectedCurrency,
  );

  const baseGroupSizes = [
    { key: "onePerson", label: "Solo", number: 1 },
    { key: "twoPerson", label: "Couple", number: 2 },
    { key: "threePerson", label: "3 People", number: 3 },
    { key: "fourPerson", label: "4 People", number: 4 },
    { key: "fiveOrMorePerson", label: "5+ People", number: 5 },
  ];

  const getDynamicGroupSizes = (categoryPrices) => {
    if (!categoryPrices) {return [];}

    const availableGroups = baseGroupSizes.filter(
      (group) => categoryPrices[group.key] && categoryPrices[group.key] > 0,
    );

    if (availableGroups.length === 0) {return [];}

    return availableGroups.map((group, index) => {
      const isLastGroup = index === availableGroups.length - 1;
      const isLastBaseGroup = group.key === "fiveOrMorePerson";

      if (isLastGroup && !isLastBaseGroup) {
        return {
          ...group,
          label: `${group.number}+`,
        };
      }

      return group;
    });
  };

  const getAllGroupSizes = (prices) => {
    const allGroups = new Set();
    categories.forEach((category) => {
      const categoryPrices = prices[category.key];
      if (categoryPrices) {
        const groupSizes = getDynamicGroupSizes(categoryPrices);
        groupSizes.forEach((group) => allGroups.add(group.key));
      }
    });

    return baseGroupSizes
      .filter((group) => allGroups.has(group.key))
      .map((group, index, array) => {
        const isLastGroup = index === array.length - 1;
        const isLastBaseGroup = group.key === "fiveOrMorePerson";

        if (isLastGroup && !isLastBaseGroup) {
          return {
            ...group,
            label: `${group.number}+`,
          };
        }

        return group;
      });
  };

  const trustIndicators = [
    {
      icon: Shield,
      label: "Best Price Guarantee",
      colorClasses: {
        bg: "bg-slate-50",
        text: "text-slate-700",
        gradient: "from-slate-500 to-slate-600",
      },
    },
    {
      icon: BadgeCheck,
      label: "Transparent Pricing",
      colorClasses: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        gradient: "from-emerald-600 to-emerald-700",
      },
    },
    {
      icon: Clock,
      label: "24/7 Support",
      colorClasses: {
        bg: "bg-indigo-50",
        text: "text-indigo-700",
        gradient: "from-indigo-600 to-indigo-700",
      },
    },
  ];



  return (
    <div className="safari-pricing space-y-6 p-6 lg:p-8">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .safari-pricing {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .pricing-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .pricing-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }
        
        .category-card {
          transition: all 0.2s ease;
        }
        
        .category-card:hover {
          transform: translateX(1px);
        }
        
        .pricing-table {
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .pricing-table thead {
          background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
        }
        
        .pricing-table tbody tr {
          transition: all 0.2s ease;
        }
        
        .pricing-table tbody tr:hover {
          background: rgba(248, 250, 252, 0.6);
        }
        
        .currency-dropdown-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .currency-dropdown-btn:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          border-color: rgba(0, 0, 0, 0.2);
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Header Section */}
      <div className="overflow-hidden rounded-xl border border-neutral-200/60 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-slate-50/40 via-white to-neutral-50/20 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-4 flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 shadow-sm">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-slate-700">
                    <Sparkles className="h-3 w-3" />
                    Pricing & Rates
                  </div>
                  <h2 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900 lg:text-3xl">
                    Investment & Pricing
                  </h2>
                  <p className="max-w-2xl text-sm leading-relaxed text-neutral-600 lg:text-base">
                    {pricingType === "yearRound"
                      ? "Transparent, year-round pricing for your Tanzania adventure. All rates are per person and include comprehensive services."
                      : "Seasonal pricing optimized for the best safari experiences. Rates vary by season to ensure optimal wildlife viewing."}
                  </p>
                </div>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <div className="currency-dropdown relative z-20 w-full lg:w-auto">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  disabled={isLoading || Boolean(error)}
                  className="currency-dropdown-btn group flex w-full min-w-[240px] items-center justify-between rounded-lg border border-neutral-300 bg-white px-4 py-3.5 text-sm font-medium text-neutral-900 shadow-sm transition-all hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedCurrencyObj?.flag}
                      alt={selectedCurrencyObj?.name}
                      className="h-5 w-7 rounded object-cover shadow-sm"
                    />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {selectedCurrencyObj?.symbol}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {selectedCurrencyObj?.code}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        {selectedCurrencyObj?.name}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="animate-slide-in absolute right-0 z-40 mt-2 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
                    <div className="border-b border-neutral-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
                      <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        <Target className="h-3 w-3" />
                        Select Currency
                      </h4>
                    </div>

                    <div className="max-h-80 overflow-auto">
                      {currencies.map((currency) => (
                        <button
                          key={currency.code}
                          onClick={() => {
                            setSelectedCurrency(currency.code);
                            setIsDropdownOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-all hover:bg-slate-50 ${
                            selectedCurrency === currency.code
                              ? "bg-slate-50"
                              : ""
                          }`}
                        >
                          <img
                            src={currency.flag}
                            alt={currency.name}
                            className="h-4 w-6 rounded object-cover shadow-sm"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-neutral-700">
                                {currency.symbol}
                              </span>
                              <span className="text-xs text-neutral-500">
                                {currency.code}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-500">
                              {currency.name}
                            </div>
                          </div>
                          {selectedCurrency === currency.code && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {lastUpdated && (
                <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
                  <RefreshCw
                    className={`h-3 w-3 ${
                      isLoading
                        ? "animate-spin"
                        : "cursor-pointer transition-all hover:rotate-180 hover:text-slate-900"
                    }`}
                    onClick={() => !isLoading && fetchExchangeRates()}
                  />
                  <span className="font-medium">
                    Live rates • {lastUpdated}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-neutral-100/60 bg-gradient-to-b from-white to-neutral-50/20 p-6 lg:p-8">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {trustIndicators.map((prop, idx) => (
              <div
                key={idx}
                className="group flex items-center gap-3 rounded-lg border border-neutral-200/50 bg-white p-3.5 transition-all duration-200 hover:border-neutral-300 hover:shadow-sm"
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${prop.colorClasses.gradient} shadow-sm transition-transform duration-200 group-hover:scale-105`}
                >
                  <prop.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-sm font-medium text-neutral-800">
                  {prop.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-slate-600" />
          </div>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Year Round Pricing */}
      {pricingType === "yearRound" && regularPrices && (
        <>
          {/* Desktop Table View */}
          <div className="hidden overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="pricing-table w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-600" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                          Group Size
                        </span>
                      </div>
                    </th>
                    {categories.map((category) => {
                      const categoryPrices = regularPrices[category.key];
                      if (!categoryPrices) {return null;}

                      const hasAnyPrices = Object.values(categoryPrices).some(
                        (price) => price && price > 0,
                      );
                      if (!hasAnyPrices) {return null;}

                      const CategoryIcon = category.icon;

                      return (
                        <th key={category.key} className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br ${category.colorClasses.gradient} shadow-sm`}
                            >
                              <CategoryIcon className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                              {category.label}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {memoizedRegularGroups.map((group) => {
                    return (
                      <tr key={group.key}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100">
                              <Users className="h-4 w-4 text-slate-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-neutral-900">
                                {group.label}
                              </div>
                              <div className="text-xs text-slate-500">
                                {group.number}{" "}
                                {group.number === 1 ? "traveler" : "travelers"}
                              </div>
                            </div>
                          </div>
                        </td>
                        {categories.map((category) => {
                          const categoryPrices = regularPrices[category.key];
                          if (!categoryPrices) {return null;}

                          const hasAnyPrices = Object.values(
                            categoryPrices,
                          ).some((price) => price && price > 0);
                          if (!hasAnyPrices) {return null;}

                          const price = categoryPrices[group.key];
                          const convertedPrice = convertPrice(price);

                          return (
                            <td
                              key={category.key}
                              className="px-6 py-4 text-right"
                            >
                              {isLoading ? (
                                <div className="flex justify-end">
                                  <div className="h-6 w-24 animate-pulse rounded bg-neutral-200"></div>
                                </div>
                              ) : price && price > 0 ? (
                                <div
                                  className={`text-lg font-bold ${category.colorClasses.price}`}
                                >
                                  {convertedPrice}
                                </div>
                              ) : (
                                <span className="text-sm text-neutral-400">
                                  —
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="border-t border-neutral-100 bg-gradient-to-r from-slate-50/30 to-transparent px-6 py-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">
                  All prices shown per person
                </span>
                <div className="flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5">
                  <TrendingUp className="h-3 w-3 text-slate-600" />
                  <span className="font-semibold text-slate-700">
                    Year-round rates
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="space-y-4 md:hidden">
            <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3.5 text-center shadow-sm">
              <p className="text-xs font-semibold text-slate-700">
                All prices shown per person • Year-round rates
              </p>
            </div>
            {memoizedRegularGroups.map((group) => (
              <MobilePricingCard
                key={group.key}
                group={group}
                prices={regularPrices}
                categories={categories}
                isLoading={isLoading}
                convertPrice={convertPrice}
              />
            ))}
          </div>
        </>
      )}

      {/* Seasonal Pricing */}
      {pricingType === "seasonal" && seasons?.length > 0 && (
        <div className="space-y-8">
          {seasons.map((season, seasonIndex) => {
            const hasValidPrices = categories.some((category) => {
              const categoryPrices = season.rates?.[category.key];
              return (
                categoryPrices &&
                Object.values(categoryPrices).some(
                  (price) => price && price > 0,
                )
              );
            });

            if (!hasValidPrices) {return null;}

            return (
              <div key={season._id || seasonIndex} className="space-y-4">
                {/* Season Header */}
                <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-slate-50/30 to-transparent p-6 lg:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 shadow-sm">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="mb-1 text-xl font-bold text-neutral-900 lg:text-2xl">
                            {season.name}
                          </h3>
                          <p className="text-sm font-medium text-slate-600">
                            {formatDate(season.startDate)} -{" "}
                            {formatDate(season.endDate)}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`self-start rounded-lg px-3.5 py-2 sm:self-auto ${
                          seasonIndex === 0
                            ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-sm"
                            : "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-sm"
                        }`}
                      >
                        <span className="text-xs font-semibold uppercase tracking-wide">
                          {seasonIndex === 0 ? "Peak Season" : "High Season"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm md:block">
                  <div className="overflow-x-auto">
                    <table className="pricing-table w-full">
                      <thead>
                        <tr className="border-b border-neutral-100">
                          <th className="px-6 py-4 text-left">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-slate-600" />
                              <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                                Group Size
                              </span>
                            </div>
                          </th>
                          {categories.map((category) => {
                            const categoryPrices = season.rates?.[category.key];
                            if (!categoryPrices) {return null;}

                            const hasAnyPrices = Object.values(
                              categoryPrices,
                            ).some((price) => price && price > 0);
                            if (!hasAnyPrices) {return null;}

                            const CategoryIcon = category.icon;

                            return (
                              <th
                                key={category.key}
                                className="px-6 py-4 text-right"
                              >
                                <div className="flex items-center justify-end gap-2">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br ${category.colorClasses.gradient} shadow-sm`}
                                  >
                                    <CategoryIcon className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                                    {category.label}
                                  </span>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {(memoizedSeasonalGroups[seasonIndex] || []).map((group) => {
                          return (
                            <tr key={group.key}>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100">
                                    <Users className="h-4 w-4 text-slate-600" />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-neutral-900">
                                      {group.label}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {group.number}{" "}
                                      {group.number === 1
                                        ? "traveler"
                                        : "travelers"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              {categories.map((category) => {
                                const categoryPrices =
                                  season.rates?.[category.key];
                                if (!categoryPrices) {return null;}

                                const hasAnyPrices = Object.values(
                                  categoryPrices,
                                ).some((price) => price && price > 0);
                                if (!hasAnyPrices) {return null;}

                                const price = categoryPrices[group.key];
                                const convertedPrice = convertPrice(price);

                                return (
                                  <td
                                    key={category.key}
                                    className="px-6 py-4 text-right"
                                  >
                                    {isLoading ? (
                                      <div className="flex justify-end">
                                        <div className="h-6 w-24 animate-pulse rounded bg-neutral-200"></div>
                                      </div>
                                    ) : price && price > 0 ? (
                                      <div
                                        className={`text-lg font-bold ${category.colorClasses.price}`}
                                      >
                                        {convertedPrice}
                                      </div>
                                    ) : (
                                      <span className="text-sm text-neutral-400">
                                        —
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  <div className="border-t border-neutral-100 bg-gradient-to-r from-slate-50/30 to-transparent px-6 py-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">
                        All prices shown per person
                      </span>
                      <div className="flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5">
                        <Calendar className="h-3 w-3 text-slate-600" />
                        <span className="font-semibold text-slate-700">
                          {season.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="space-y-4 md:hidden">
                  <div className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3.5 text-center shadow-sm">
                    <p className="text-xs font-semibold text-slate-700">
                      All prices shown per person • {season.name}
                    </p>
                  </div>
                  {(memoizedSeasonalGroups[seasonIndex] || []).map((group) => (
                    <MobilePricingCard
                      key={group.key}
                      group={group}
                      prices={season.rates}
                      categories={categories}
                      isLoading={isLoading}
                      convertPrice={convertPrice}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Pricing Data */}
      {((pricingType === "yearRound" && !regularPrices) ||
        (pricingType === "seasonal" && (!seasons || seasons.length === 0))) && (
        <div className="flex items-center justify-center rounded-xl border border-neutral-200/80 bg-white p-12 text-center shadow-sm">
          <div className="max-w-md">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
              <Info className="h-7 w-7 text-slate-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-neutral-900">
              Pricing Unavailable
            </h3>
            <p className="text-sm text-neutral-600">
              Contact us for current rates and availability.
            </p>
          </div>
        </div>
      )}

      {/* Discount Banner */}
      {discount > 0 && (
        <div className="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/50 via-white to-emerald-50/30 shadow-sm">
          <div className="flex flex-col items-center gap-5 p-6 sm:flex-row lg:p-8">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
              <TrendingDown className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="mb-2 text-xl font-bold text-neutral-900 lg:text-2xl">
                Special Offer - {discount}% Savings
              </h4>
              <p className="text-sm font-medium text-neutral-600 lg:text-base">
                Limited time discount available on all bookings.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-white px-6 py-4 text-center shadow-sm">
              <div className="text-3xl font-bold text-emerald-600">
                {discount}%
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                OFF
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatesTab;
