import StatCard from "./StatCard";
import { useState, useEffect } from "react";

const ChatStats = ({ stats, activeCustomers = [] }) => {
  const [dynamicStats, setDynamicStats] = useState({
    totalCustomers: 0,
    totalMessages: 0,
    activeChats: 0,
    unreadMessages: 0,
  });

  // Calculate dynamic stats from actual data
  useEffect(() => {
    if (stats && activeCustomers) {
      const onlineCustomers = activeCustomers.filter(
        (customer) => customer.online,
      ).length;
      const unreadCount = activeCustomers.reduce((total, customer) => {
        return total + (customer.unreadCount || 0);
      }, 0);

      setDynamicStats({
        totalCustomers: stats.totalCustomers || activeCustomers.length || 0,
        totalMessages: stats.totalMessages || 0,
        activeChats: stats.activeChats || onlineCustomers,
        unreadMessages: stats.unreadMessages || unreadCount,
      });
    }
  }, [stats, activeCustomers]);

  // Calculate trends dynamically
  const calculateTrend = (current, previous, label) => {
    if (!previous || previous === 0)
      return { text: "New metric", color: "text-blue-500" };

    const percentage = Math.round(((current - previous) / previous) * 100);
    const isPositive = percentage >= 0;

    return {
      text: `${Math.abs(percentage)}% ${isPositive ? "increase" : "decrease"} from last period`,
      color: isPositive ? "text-success" : "text-accent",
    };
  };

  const statsData = [
    {
      title: "Total Customers",
      value: dynamicStats.totalCustomers,
      icon: (props) => (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      trend: calculateTrend(
        dynamicStats.totalCustomers,
        stats?.previousTotalCustomers,
        "customers",
      ),
      bgColor: "bg-gradient-to-br from-info to-info-600",
    },
    {
      title: "Total Messages",
      value: dynamicStats.totalMessages,
      icon: (props) => (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72A8.963 8.963 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      trend: calculateTrend(
        dynamicStats.totalMessages,
        stats?.previousTotalMessages,
        "messages",
      ),
      bgColor: "bg-gradient-to-br from-primary to-primary-600",
    },
    {
      title: "Active Chats",
      value: dynamicStats.activeChats,
      icon: (props) => (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      trend: calculateTrend(
        dynamicStats.activeChats,
        stats?.previousActiveChats,
        "chats",
      ),
      bgColor: "bg-gradient-to-br from-success to-success-600",
    },
    {
      title: "Unread Messages",
      value: dynamicStats.unreadMessages,
      icon: (props) => (
        <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405M19.595 15.595A2.032 2.032 0 0019 14V7a2 2 0 00-2-2H7a2 2 0 00-2 2v7c0 .386.146.735.405 1.005L9 17v2h6v-2l3.595-1.405z"
          />
        </svg>
      ),
      trend: calculateTrend(
        dynamicStats.unreadMessages,
        stats?.previousUnreadMessages,
        "unread",
      ),
      bgColor: "bg-gradient-to-br from-secondary to-sunshine-400",
    },
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-4">
      {statsData.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default ChatStats;
