"use client";

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { RiLogoutCircleLine } from "react-icons/ri";
import { useSelector, useDispatch } from "react-redux";
import { allNav as allNavv } from "../navigation/allNav";
import { logout } from "../store/Reducers/authReducer";
import { isAdmin } from "../utils/roleVerification";

const Sidebar = ({ showSideBar, setShowSidebar }) => {
  const { pathname } = useLocation();
  const [allNav, setAllNav] = useState([]);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo) {
      const accessRoutes = userInfo.accessRoutes || [];
      const role = userInfo?.role;
      const isAdminUser = isAdmin(role);

      // If admin has no accessRoutes, they have access to all routes
      const hasAllAccess =
        isAdminUser && (!accessRoutes || accessRoutes.length === 0);

      // Filter navigation based on access routes for all users (admin, editor, viewer)
      const navs = allNavv.filter((nav) => {
        // If admin has no accessRoutes, show all routes
        if (hasAllAccess) {
          return true;
        }

        const routePath = Array.isArray(nav.path) ? nav.path[0] : nav.path;

        // Check dashboard access - only show if user has "dashboard" access route
        if (routePath === "/admin/dashboard") {
          return accessRoutes.includes("dashboard");
        }

        // All users can access admin-to-admin chat
        if (nav.title === "Chat-Admin") {
          return true;
        }

        // Map navigation titles to access route IDs (same as RoleSelectionModal)
        const titleToAccessMap = {
          Dashboard: "dashboard",
          Category: "categories",
          Customers: "customers",
          Payments: "payments",
          "QR Code Scanner": "qr-scanner",
          "Chat-Customer": "chat-customer",
          Profile: "profile",
          Inclusions: "inclusions",
          Exclusions: "exclusions",
          "Add Trip": "add-trip",
          Trips: "trips",
          Accommodations: "accommodations",
          Meals: "meals",
          Partners: "partners",
          Banner: "banner",
          "Add Blog Post": "add-blog",
          "Blog Posts": "blogPosts",
          "Who We Are": "who-we-are",
          "PDF Manager": "PDFs",
          Newsletter: "newsletters",
          "Admin Management": "admin-management",
          Reviews: "reviews",
          "Safari Requests": "safari-requests",
          "Urgent Booking Requests": "urgent-booking-requests",
          Careers: "jobs",
          "Add Career": "add-job",
          "Career Applications": "job-applications",
          Achievements: "achievements",
          "Impact Stats": "impact-stats",
          Clients: "clients",
        };

        // Check if user has access to this route by title
        const accessKey = titleToAccessMap[nav.title];

        // If no access key mapping exists, show the route (for backward compatibility)
        if (!accessKey) {
          return true;
        }

        // Check if user has access to this route
        return accessRoutes.includes(accessKey);
      });

      setAllNav(navs);
    } else {
      setAllNav([]);
    }
  }, [userInfo]);

  const handleLogout = async () => {
    // Clear localStorage and broadcast logout to other tabs
    dispatch(logout());
    // Navigate to home which will redirect to login
    navigate("/", { replace: true });
  };

  return (
    <div>
      {/* Enhanced Overlay */}
      <div
        onClick={() => setShowSidebar(false)}
        className={`fixed inset-0 z-20 bg-gradient-to-br from-gray-900/60 via-slate-900/50 to-gray-900/60 backdrop-blur-md transition-all duration-500 ${
          !showSideBar ? "invisible opacity-0" : "visible opacity-100"
        }`}
      />

      {/* Modern Sidebar with Safari Forest Gradient */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-56 transform border-r border-primary-900/20 bg-gradient-to-br from-primary via-primary-600 to-primary-700 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out ${
          showSideBar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Enhanced Logo Section */}
        <div className="relative flex h-20 items-center justify-center border-b border-white/10 bg-white/5 backdrop-blur-md">
          <Link
            to="/"
            className="group flex items-center px-6 transition-transform hover:scale-105"
          >
            <div className="relative">
              <img
                className="h-14 w-auto drop-shadow-lg"
                src="/images/logo-zanzi.svg"
                alt="Logo"
              />
            </div>
          </Link>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex h-[calc(100vh-5rem)] flex-col overflow-y-auto py-5">
          <div className="flex-1 px-3 pb-5">
            <ul className="space-y-3">
              {allNav.map((nav, i) => {
                // Check if current path matches exactly or starts with (for nested routes)
                const isActive = Array.isArray(nav.path)
                  ? nav.path.some(
                      (path) =>
                        pathname === path ||
                        (path !== "/admin/dashboard" &&
                          pathname.startsWith(path)),
                    )
                  : pathname === nav.path ||
                    (nav.path !== "/admin/dashboard" &&
                      pathname.startsWith(nav.path));

                return (
                  <li key={i}>
                    <Link
                      to={Array.isArray(nav.path) ? nav.path[0] : nav.path}
                      className={`group relative flex items-center rounded-xl px-2 py-2 text-sm font-semibold transition-all duration-300 ${
                        isActive
                          ? "scale-105 bg-gradient-to-r from-secondary to-sunshine-400 text-white shadow-lg"
                          : "text-white hover:scale-105 hover:bg-white/10 hover:shadow-lg"
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-sunshine-400" />
                      )}

                      {/* Icon with enhanced styling */}
                      <span
                        className={`mr-4 h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-lg transition-all duration-300 ${
                          isActive
                            ? "shadow-coral-medium bg-white text-secondary"
                            : "group-hover:shadow-coral-soft bg-white/90 text-primary-700 group-hover:bg-white group-hover:text-secondary"
                        }`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 32,
                        }}
                      >
                        {nav.icon}
                      </span>

                      {/* Text with better typography */}
                      <span className="flex-1 font-medium">{nav.title}</span>

                      {/* Hover effect overlay */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary/10 to-sunshine-400/10 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Enhanced Logout Section */}
          <div className="border-t border-white/20 px-4 pt-4">
            <button
              onClick={handleLogout}
              className="group relative flex w-full items-center rounded-2xl px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-accent/20 hover:shadow-lg"
            >
              {/* Icon */}
              <span className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:shadow-medium">
                <RiLogoutCircleLine />
              </span>

              {/* Text */}
              <span className="font-medium">Logout</span>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/10 to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </div>
        </nav>
      </aside>
    </div>
  );
};

export default Sidebar;
