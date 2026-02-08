import api from "./api";

// Dashboard API functions
export const dashboardAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // Get recent orders
  getRecentOrders: async () => {
    try {
      const response = await api.get("/dashboard/recent-orders");
      return response.data;
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      throw error;
    }
  },
};

export default dashboardAPI;
