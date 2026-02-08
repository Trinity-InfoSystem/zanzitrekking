import api from "./api";

export const urgentBookingRequestApi = {
  // Create a new urgent booking request
  createRequest: async (data) => {
    const response = await api.post("/urgent-booking-requests", data);
    return response.data;
  },

  // Check if booking is allowed for a user-trip-date combination
  checkEligibility: async (
    tripId,
    requestedDate,
    selectedCategory,
    customerId,
  ) => {
    const response = await api.get(
      "/urgent-booking-requests/check-eligibility",
      {
        params: {
          tripId,
          requestedDate,
          selectedCategory,
          customerId,
        },
      },
    );
    return response.data;
  },

  // Get user's requests
  getMyRequests: async (customerId) => {
    const response = await api.get("/urgent-booking-requests/my-requests", {
      params: { customerId },
    });
    return response.data;
  },

  // Get request status
  getRequestStatus: async (requestId) => {
    const response = await api.get(`/urgent-booking-requests/${requestId}`);
    return response.data;
  },
};
