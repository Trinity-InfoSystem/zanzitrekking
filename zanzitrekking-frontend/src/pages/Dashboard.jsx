"use client";

import { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  ChevronRight,
  Compass,
  Heart,
  Home,
  Loader2,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Shield,
  ShoppingBag,
  X,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { customer_logout } from "../store/reducers/authReducer";
import SEO from "../components/SEO";

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function stringToColor(string = "") {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  }

  function getInitials(name = "") {
    const nameParts = name.split(" ");
    const firstInitial = nameParts[0]?.[0] || "";
    const secondInitial = nameParts[1]?.[0] || "";
    return `${firstInitial}${secondInitial}`;
  }

  const navigationItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      path: "/dashboard",
      description: "Overview & Analytics",
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: "Bookings",
      path: "/dashboard/orders",
      description: "Trip Bookings",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      label: "Booking Requests",
      path: "/dashboard/booking-requests",
      description: "Availability Requests",
    },
    {
      icon: <Heart className="h-5 w-5" />,
      label: "Wishlist",
      path: "/dashboard/my-wishlist",
      description: "Saved Adventures",
    },
    {
      icon: <Briefcase className="h-5 w-5" />,
      label: "Career History",
      path: "/dashboard/career-history",
      description: "Job Applications",
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Chat",
      path: "/dashboard/chat",
      description: "Support & Help",
    },
    {
      icon: <Lock className="h-5 w-5" />,
      label: "Change Password",
      path: "/dashboard/change-password",
      description: "Account Security",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const setInitialSidebarState = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };

    setInitialSidebarState();
  }, []);

  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await dispatch(customer_logout());
    // Use window.location to force a full page reload and show home page
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO />
      <Header />
      <div className="px-4 py-6 sm:px-6 lg:px-12 lg:py-12">
        <div className="relative flex flex-col lg:flex-row lg:gap-6">
          {/* Mobile Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="fixed bottom-24 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-soft-lg transition-all hover:scale-110 hover:bg-primary-700 hover:shadow-soft-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 lg:hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-[50] bg-primary-900/50 backdrop-blur-sm lg:hidden"
              onClick={(e) => {
                e.stopPropagation();
                setSidebarOpen(false);
              }}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed inset-y-0 left-0 z-[55] w-80 max-w-[85vw] transform overflow-y-auto border-r border-neutral-200 bg-white shadow-soft-xl transition-all duration-300 ease-in-out lg:relative lg:inset-auto lg:z-auto lg:w-80 lg:max-w-none lg:translate-x-0 lg:rounded-xl ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="flex h-full flex-col p-6">
              {/* User Profile */}
              <div className="mb-8 text-center">
                <div className="relative mx-auto mb-4">
                  <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-neutral-100 shadow-soft">
                    <div
                      className="flex h-full w-full items-center justify-center text-2xl font-bold uppercase text-white"
                      style={{ backgroundColor: stringToColor(userInfo?.name) }}
                    >
                      {getInitials(userInfo?.name)}
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="absolute -bottom-1 right-0 rounded-full bg-white p-1 shadow-soft">
                    <div className="h-4 w-4 rounded-full bg-success-500"></div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-primary-800">
                  Welcome Back!
                </h2>
                <p className="mt-1 text-base font-medium text-text">
                  {userInfo?.name || "User"}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                    <Compass className="h-3.5 w-3.5" />
                    Explorer
                  </span>
                  {userInfo?.verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-success-200 bg-success-50 px-3 py-1.5 text-xs font-semibold text-success-700">
                      <Shield className="h-3.5 w-3.5" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-1">
                <div className="mb-4 px-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-lighter">
                    Navigation
                  </h3>
                </div>

                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() =>
                      window.innerWidth < 1024 && setSidebarOpen(false)
                    }
                    className={`group flex items-center rounded-lg px-3 py-3 transition-all ${isActive(item.path)
                      ? "bg-primary-600 text-white shadow-soft"
                      : "text-text hover:bg-background-muted"
                      }`}
                  >
                    <div
                      className={`mr-3 transition-colors ${isActive(item.path)
                        ? "text-white"
                        : "text-primary-600 group-hover:text-primary-700"
                        }`}
                    >
                      {item.icon}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-semibold">
                        {item.label}
                      </span>
                      <p
                        className={`text-xs ${isActive(item.path)
                          ? "text-white/80"
                          : "text-text-light"
                          }`}
                      >
                        {item.description}
                      </p>
                    </div>

                    {isActive(item.path) && (
                      <ChevronRight className="h-4 w-4 text-white" />
                    )}
                  </Link>
                ))}
              </nav>

              {/* Logout Button */}
              <div className="mt-6 border-t border-neutral-200 pt-6">
                <button
                  onClick={handleLogout}
                  className="group flex w-full items-center rounded-lg px-3 py-3 text-text transition-all hover:bg-error-50 hover:text-error-700"
                >
                  <div className="mr-3 rounded-lg bg-error-100 p-2 transition-colors group-hover:bg-error-200">
                    <LogOut className="h-4 w-4 text-error-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-semibold">Sign Out</span>
                    <p className="text-xs text-text-light group-hover:text-error-600">
                      End your session
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 transition-all duration-300">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-soft">
              <Suspense
                fallback={
                  <div className="flex min-h-[500px] items-center justify-center p-8">
                    <div className="text-center">
                      <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary-600" />
                      <p className="text-sm font-medium text-text">
                        Loading your dashboard...
                      </p>
                    </div>
                  </div>
                }
              >
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
