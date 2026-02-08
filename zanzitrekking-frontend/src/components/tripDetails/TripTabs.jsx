import { DollarSign, Info, ListChecks, Route, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TripTabs = ({ activeTab, setActiveTab, renderTabContent, actions }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [hoveredTab, setHoveredTab] = useState(null);
  const hoverTimeoutRef = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollThreshold = 10;
      const topBarThreshold = 50;

      setIsScrolled(currentScrollY > 120);

      if (Math.abs(currentScrollY - lastScrollY.current) > scrollThreshold) {
        setIsScrollingUp(
          currentScrollY < lastScrollY.current ||
            currentScrollY < topBarThreshold,
        );
        lastScrollY.current = currentScrollY;
      } else if (currentScrollY < topBarThreshold) {
        setIsScrollingUp(true);
      }
    };

    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    lastScrollY.current = window.scrollY;

    window.addEventListener("scroll", scrollHandler);
    return () => {
      window.removeEventListener("scroll", scrollHandler);
      if (hoverTimeoutRef.current) {clearTimeout(hoverTimeoutRef.current);}
    };
  }, []);

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) {return;}

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    setHoveredTab(null);
    setActiveTab(tabId);
  };

  const handleTabHover = (tabId) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (tabId !== activeTab) {
      setHoveredTab(tabId);
    }
  };

  const handleTabLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredTab(null);
      hoverTimeoutRef.current = null;
    }, 50);
  };

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      shortLabel: "Overview",
      icon: Info,
    },
    {
      id: "dayByDay",
      label: "Itinerary",
      shortLabel: "Itinerary",
      icon: Route,
    },
    {
      id: "rates",
      label: "Pricing",
      shortLabel: "Pricing",
      icon: DollarSign,
    },
    {
      id: "inclusions",
      label: "Inclusions",
      shortLabel: "Inclusions",
      icon: ListChecks,
    },
    {
      id: "reviews",
      label: "Reviews",
      shortLabel: "Reviews",
      icon: Star,
    },
  ];

  return (
    <div className="safari-tabs mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 3xl:w-11/12 3xl:max-w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .safari-tabs {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .tab-button {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .tab-button:not(.active):hover {
          transform: translateY(-1px);
        }
        
        .tab-indicator {
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) scaleX(0);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) scaleX(1);
          }
        }
      `}</style>

      <div
        className={`sticky z-30 transition-all duration-300 ${
          isScrollingUp ? "top-16 lg:top-[92px]" : "top-16"
        } ${
          isScrolled
            ? "-mx-4 px-4 py-1.5 sm:-mx-6 sm:px-6 sm:py-2 lg:-mx-8 lg:px-8 lg:py-3"
            : "py-3 sm:py-4 lg:py-6"
        }`}
      >
        <div
          className={`relative overflow-hidden transition-all duration-300 ${
            isScrolled
              ? "rounded-lg border border-neutral-200 bg-white/95 shadow-md backdrop-blur-xl"
              : "rounded-xl border border-neutral-200/80 bg-white shadow-sm"
          }`}
        >
          <div
            className={`flex flex-col gap-2 p-2 sm:gap-3 sm:p-3 lg:flex-row lg:items-center lg:justify-between ${isScrolled ? "lg:p-3" : "lg:p-4"}`}
          >
            <div className="flex-1">
              {/* Mobile Tabs */}
              <div className="grid grid-cols-3 gap-2 sm:hidden">
                {tabs.slice(0, 3).map((tab) => {
                  const isActive = activeTab === tab.id;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`tab-button flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-sm"
                          : "bg-slate-50 text-neutral-600 hover:bg-slate-100"
                      }`}
                    >
                      <TabIcon className="h-3.5 w-3.5" />
                      <span>{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Second row for mobile */}
              <div className="mt-2 grid grid-cols-2 gap-2 sm:hidden">
                {tabs.slice(3).map((tab) => {
                  const isActive = activeTab === tab.id;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`tab-button flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-sm"
                          : "bg-slate-50 text-neutral-600 hover:bg-slate-100"
                      }`}
                    >
                      <TabIcon className="h-3.5 w-3.5" />
                      <span>{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop Tabs */}
              <div className="hidden items-center gap-2 sm:flex">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      onMouseEnter={() => handleTabHover(tab.id)}
                      onMouseLeave={handleTabLeave}
                      className={`tab-button ${isActive ? "active" : ""} group relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white shadow-sm"
                          : "text-neutral-600 hover:bg-slate-50 hover:text-neutral-900"
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {isActive && (
                        <div className="tab-indicator absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-gradient-to-r from-slate-700 to-slate-800"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="hidden items-center gap-3 border-l border-neutral-200 pl-4 lg:flex">
              {actions}
            </div>
          </div>

          {/* Mobile Actions */}
          <div className="border-t border-neutral-100 bg-gradient-to-r from-slate-50/30 to-transparent p-3 lg:hidden">
            {actions}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative mt-6 sm:mt-8 lg:mt-10">
        <div className="overflow-hidden rounded-xl border border-neutral-200/80 bg-white shadow-sm">
          <div className="relative min-h-[500px]">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default TripTabs;
