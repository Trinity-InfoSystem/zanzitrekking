import { FaSafari, FaUsers } from "react-icons/fa";
import { MdCurrencyExchange, MdOutlinePayment } from "react-icons/md";
import Chart from "react-apexcharts";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { get_recent_messages } from "../../store/Reducers/chatReducer";
import {
  fetchDashboardStats,
  fetchRecentOrders,
} from "../../store/Reducers/dashboardReducer";
import { isAdmin } from "../../utils/roleVerification";
import HeaderText from "./HeaderText";
import StatsCard from "./StatsCard";
import ChartSection from "./ChartSection";
import MessagesSection from "./MessagesSection";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { recentMessages, loader } = useSelector((state) => state.chat);
  const { stats, recentOrders, loading, error } = useSelector(
    (state) => state.dashboard,
  );
  const { userInfo } = useSelector((state) => state.auth);
  const role = userInfo?.role;
  const isAdminUser = isAdmin(role);

  // Check if user has access to dashboard
  const accessRoutes = userInfo?.accessRoutes || [];
  const hasDashboardAccess = accessRoutes.includes("dashboard");

  // If admin has no accessRoutes, they have access to all routes including dashboard
  const hasAllAccess =
    isAdminUser && (!accessRoutes || accessRoutes.length === 0);
  const canAccessDashboard = hasAllAccess || hasDashboardAccess;

  // Fetch data on component mount only if user has dashboard access
  useEffect(() => {
    if (canAccessDashboard) {
      dispatch(get_recent_messages());
      dispatch(fetchDashboardStats());
      dispatch(fetchRecentOrders());
    }
  }, [dispatch, canAccessDashboard]);
  const chartConfig = {
    series: [
      {
        name: "Orders",
        data: stats.chartData.orders || [],
      },
      {
        name: "Customers",
        data: stats.chartData.customers || [],
      },
      {
        name: "Revenue",
        data: stats.chartData.revenue || [],
      },
    ],
    options: {
      colors: ["#E76F51", "#1B4332", "#F4A261"], // Coral, Forest, Sunshine
      plotOptions: {
        bar: {
          borderRadius: 10,
          columnWidth: "60%",
        },
      },
      chart: {
        background: "transparent",
        toolbar: {
          show: false,
        },
        fontFamily: "Inter, sans-serif",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 2,
        colors: ["transparent"],
        curve: "smooth",
      },
      xaxis: {
        categories: stats.chartData.months || [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          style: {
            colors: "#94A3B8",
            fontFamily: "Inter, sans-serif",
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#94A3B8",
            fontFamily: "Inter, sans-serif",
          },
        },
      },
      grid: {
        borderColor: "#E2E8F0",
        strokeDashArray: 6,
        xaxis: {
          lines: {
            show: false,
          },
        },
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        floating: true,
        offsetY: -25,
        markers: {
          width: 8,
          height: 8,
          radius: 100,
        },
        itemMargin: {
          horizontal: 15,
        },
        fontFamily: "Inter, sans-serif",
        labels: {
          colors: "#64748B",
        },
      },
      tooltip: {
        theme: "dark",
        style: {
          fontFamily: "Inter, sans-serif",
        },
      },
    },
  };

  // Format time display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Format recent messages for display - only show customer messages
  const formatMessages = (messages) => {
    if (!messages || messages.length === 0) return [];

    // Filter to only show customer messages (not admin messages)
    const customerMessages = messages.filter(
      (msg) => msg.senderModel === "Customer",
    );

    return customerMessages.slice(0, 4).map((msg) => ({
      _id: msg._id,
      name: msg.sender?.name || "Unknown User",
      time: formatTime(msg.createdAt),
      message: msg.content,
      avatar:
        msg.sender?.image ||
        "https://randomuser.me/api/portraits/placeholder.jpg",
      status: "online", // All customer messages are considered online
      senderModel: msg.senderModel,
      read: msg.read,
      sender: msg.sender, // Include full sender object for navigation
    }));
  };

  const messages = formatMessages(recentMessages);

  // For viewer and editor: only show trips and customers
  // For admin: show all stats
  const statsCards = isAdminUser
    ? [
        {
          label: "Total Revenue",
          value: stats.totalRevenue?.formatted || "$0",
          change: stats.totalRevenue?.change || "0% from last month",
          icon: <MdCurrencyExchange className="text-3xl text-white" />,
          bgGradient: "from-secondary to-sunshine-400", // Coral to Sunshine
          blurGradient: "from-secondary/20 to-sunshine-400/40",
          hoverBlur:
            "group-hover:from-secondary/30 group-hover:to-sunshine-400/60",
          loading: loading.stats,
        },
        {
          label: "Active Trips",
          value: stats.activeTrips?.formatted || "0",
          change: stats.activeTrips?.change || "Live count",
          icon: <FaSafari className="text-3xl text-white" />,
          bgGradient: "from-primary to-primary-600", // Forest Green
          blurGradient: "from-primary/20 to-primary-600/40",
          hoverBlur:
            "group-hover:from-primary/30 group-hover:to-primary-600/60",
          loading: loading.stats,
        },
        {
          label: "Total Customers",
          value: stats.totalCustomers?.formatted || "0",
          change: stats.totalCustomers?.change || "Total registered",
          icon: <FaUsers className="text-3xl text-white" />,
          bgGradient: "from-success to-success-600", // Success Green
          blurGradient: "from-success/20 to-success-600/40",
          hoverBlur:
            "group-hover:from-success/30 group-hover:to-success-600/60",
          loading: loading.stats,
        },
        {
          label: "Completed Payments",
          value: stats.totalPayments?.formatted || "0",
          change: stats.totalPayments?.change || "0 pending",
          icon: <MdOutlinePayment className="text-3xl text-white" />,
          bgGradient: "from-sunshine-400 to-sunshine-500", // Sunshine
          blurGradient: "from-sunshine-400/20 to-sunshine-500/40",
          hoverBlur:
            "group-hover:from-sunshine-400/30 group-hover:to-sunshine-500/60",
          loading: loading.stats,
        },
      ]
    : [
        // Viewer and Editor: Only trips and customers
        {
          label: "Active Trips",
          value: stats.activeTrips?.formatted || "0",
          change: stats.activeTrips?.change || "Live count",
          icon: <FaSafari className="text-3xl text-white" />,
          bgGradient: "from-primary to-primary-600", // Forest Green
          blurGradient: "from-primary/20 to-primary-600/40",
          hoverBlur:
            "group-hover:from-primary/30 group-hover:to-primary-600/60",
          loading: loading.stats,
        },
        {
          label: "Total Customers",
          value: stats.totalCustomers?.formatted || "0",
          change: stats.totalCustomers?.change || "Total registered",
          icon: <FaUsers className="text-3xl text-white" />,
          bgGradient: "from-success to-success-600", // Success Green
          blurGradient: "from-success/20 to-success-600/40",
          hoverBlur:
            "group-hover:from-success/30 group-hover:to-success-600/60",
          loading: loading.stats,
        },
      ];

  // If user doesn't have dashboard access, redirect to first accessible route
  useEffect(() => {
    if (!canAccessDashboard && userInfo && accessRoutes.length > 0) {
      // Sidebar order with access keys and paths (matching sidebar order)
      const sidebarOrder = [
        { key: "dashboard", path: "/admin/dashboard" },
        { key: "categories", path: "/admin/dashboard/categories" },
        { key: "customers", path: "/admin/dashboard/customers" },
        { key: "payments", path: "/admin/dashboard/payments" },
        { key: "safari-requests", path: "/admin/dashboard/safari-requests" },
        { key: "urgent-booking-requests", path: "/admin/dashboard/urgent-booking-requests" },
        { key: "chat-customer", path: "/admin/dashboard/chat-customer" },
        { key: "profile", path: "/admin/dashboard/profile" },
        { key: "inclusions", path: "/admin/dashboard/inclusions" },
        { key: "exclusions", path: "/admin/dashboard/exclusions" },
        { key: "add-trip", path: "/admin/dashboard/add-trip" },
        { key: "trips", path: "/admin/dashboard/trips" },
        { key: "reviews", path: "/admin/dashboard/reviews" },
        { key: "accommodations", path: "/admin/dashboard/accommodations" },
        { key: "meals", path: "/admin/dashboard/meals" },
        { key: "banner", path: "/admin/dashboard/banner" },
        { key: "add-blog", path: "/admin/dashboard/add-blog" },
        { key: "blogPosts", path: "/admin/dashboard/blogPosts" },
        { key: "who-we-are", path: "/admin/dashboard/who-we-are" },
        { key: "PDFs", path: "/admin/dashboard/PDFs" },
        { key: "newsletters", path: "/admin/dashboard/newsletters" },
        { key: "partners", path: "/admin/dashboard/partners" },
        { key: "admin-management", path: "/admin/dashboard/admin-management" },
        { key: "jobs", path: "/admin/dashboard/jobs" },
        { key: "add-job", path: "/admin/dashboard/add-job" },
        { key: "job-applications", path: "/admin/dashboard/job-applications" },
        { key: "achievements", path: "/admin/dashboard/achievements" },
        { key: "impact-stats", path: "/admin/dashboard/impact-stats" },
        { key: "clients", path: "/admin/dashboard/clients" },
      ];

      // Find the first accessible route based on sidebar order
      const firstAccessible = sidebarOrder.find((item) =>
        accessRoutes.includes(item.key),
      );

      if (firstAccessible) {
        navigate(firstAccessible.path, { replace: true });
      }
    }
  }, [canAccessDashboard, userInfo, accessRoutes, navigate]);

  // Show loading while redirecting
  if (!canAccessDashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-primary-50/30">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-neutral-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 p-4 md:p-5">
      <div className="max-w-8xl mx-auto">
        <HeaderText title="Admin Dashboard" />
        {/* Statistics Cards */}
        <div
          className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
            isAdminUser ? "lg:grid-cols-4" : "lg:grid-cols-2"
          }`}
        >
          {statsCards.map((stat, idx) => (
            <StatsCard key={stat.label} {...stat} />
          ))}
        </div>
        {/* Charts and Messages Section */}
        {isAdminUser ? (
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Chart Section - Only for Admin */}
            <div className="lg:col-span-8">
              <ChartSection chartConfig={chartConfig} />
            </div>
            {/* Messages Section */}
            <div className="lg:col-span-4">
              <MessagesSection messages={messages} isLoading={loader} />
            </div>
          </div>
        ) : (
          // Viewer and Editor: Only show messages
          <div className="mt-8">
            <MessagesSection messages={messages} isLoading={loader} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
