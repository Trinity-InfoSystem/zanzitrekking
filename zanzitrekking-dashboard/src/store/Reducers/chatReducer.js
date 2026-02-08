// store/reducers/adminChatReducer.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Get dashboard stats
export const get_chat_stats = createAsyncThunk(
  "adminChat/get_chat_stats",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/dashboard-stats", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);

// Get recent messages
export const get_recent_messages = createAsyncThunk(
  "adminChat/get_recent_messages",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/dashboard-recent-messages", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);

// Get active customers
export const get_active_customers = createAsyncThunk(
  "adminChat/get_active_customers",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/dashboard-active-customers", {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);
// Get active customers with new customer
export const get_active_customers_with_new_customer = createAsyncThunk(
  "adminChat/get_active_customers_with_new_customer",
  async (customerId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/dashboard-active-customers-with-new-customer/${customerId}`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);

// Admin chat functions
export const get_messages = createAsyncThunk(
  "adminChat/get_messages",
  async ({ customerId, adminId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/messages/${customerId}/${adminId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);

export const send_message = createAsyncThunk(
  "adminChat/send_message",
  async (messageData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/message-send", messageData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);

export const send_file = createAsyncThunk(
  "adminChat/send_file",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/message-send-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);

export const delete_message = createAsyncThunk(
  "adminChat/delete_message",
  async (messageId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/message/${messageId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);

// Mark messages as read
export const mark_messages_read = createAsyncThunk(
  "adminChat/mark_messages_read",
  async ({ senderId, receiverId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/messages-mark-read/${senderId}/${receiverId}`,
        {},
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);

// Mark single message as read
export const mark_message_read = createAsyncThunk(
  "adminChat/mark_message_read",
  async (messageId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/message-mark-read/${messageId}`,
        {},
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);

// Get unread message count
export const get_unread_count = createAsyncThunk(
  "adminChat/get_unread_count",
  async ({ userId, userModel }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/unread-count/${userId}/${userModel}`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      return rejectWithValue({
        errorMessage: error.response?.data?.message || error.message,
      });
    }
  },
);

export const adminChatReducer = createSlice({
  name: "adminChat",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    messages: [],
    conversationId: null,
    stats: {
      totalCustomers: 0,
      activeChats: 0,
      totalMessages: 0,
      unreadMessages: 0,
    },
    recentMessages: [],
    activeCustomers: [],
    currentCustomer: null,
    sentMessage: null,
  },
  reducers: {
    clearMessage: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
    add_new_message: (state, action) => {
      const message = action.payload;
      if (
        !state.conversationId ||
        message.conversationId === state.conversationId
      ) {
        const exists = state.messages.some(
          (existing) =>
            existing._id && message._id && existing._id === message._id,
        );
        if (!exists) {
          state.messages.push(message);
        }
      }
    },
    clear_messages: (state) => {
      state.messages = [];
      state.conversationId = null;
    },
    set_current_customer: (state, action) => {
      state.currentCustomer = action.payload;
      state.conversationId = action.payload
        ? `customer-${action.payload._id}`
        : null;
    },
    set_sent_message: (state, action) => {
      state.sentMessage = action.payload;
    },
    update_message_read_status: (state, action) => {
      const { messageId, read, readAt } = action.payload;
      state.messages = state.messages.map((message) =>
        message._id === messageId
          ? { ...message, read, readAt }
          : message
      );
    },
    update_messages_read_status: (state, action) => {
      const { senderId, receiverId, read, readAt } = action.payload;
      state.messages = state.messages.map((message) =>
        (message.sender?._id || message.sender)?.toString() ===
          senderId?.toString() &&
        (message.receiver?._id || message.receiver)?.toString() ===
          receiverId?.toString()
          ? { ...message, read, readAt }
          : message
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats Cases
      .addCase(get_chat_stats.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_chat_stats.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.stats = payload.stats;
      })
      .addCase(get_chat_stats.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Recent Messages Cases
      .addCase(get_recent_messages.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_recent_messages.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.recentMessages = payload.messages;
      })
      .addCase(get_recent_messages.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Active Customers Cases
      .addCase(get_active_customers.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_active_customers.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.activeCustomers = payload.customers;
      })
      .addCase(get_active_customers.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Active Customers Cases
      .addCase(get_active_customers_with_new_customer.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        get_active_customers_with_new_customer.fulfilled,
        (state, { payload }) => {
          state.loader = false;
          state.activeCustomers = payload.customers;
        },
      )
      .addCase(
        get_active_customers_with_new_customer.rejected,
        (state, { payload }) => {
          state.loader = false;
          state.errorMessage = payload.errorMessage;
        },
      )

      // Get Messages Cases
      .addCase(get_messages.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_messages.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.messages = payload.messages;
        state.conversationId =
          payload.conversationId ||
          payload.messages?.[0]?.conversationId ||
          state.conversationId;
      })
      .addCase(get_messages.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Send Message Cases
      .addCase(send_message.fulfilled, (state, { payload }) => {
        if (
          !state.conversationId ||
          payload.message.conversationId === state.conversationId
        ) {
          state.messages.push(payload.message);
        }
      })
      .addCase(send_file.fulfilled, (state, { payload }) => {
        if (
          !state.conversationId ||
          payload.message.conversationId === state.conversationId
        ) {
          state.messages.push(payload.message);
        }
        state.sentMessage = payload.message;
      })
      .addCase(send_file.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      })

      // Mark Messages Read Cases
      .addCase(mark_messages_read.pending, (state) => {
        state.loader = true;
      })
      .addCase(mark_messages_read.fulfilled, (state, { payload }) => {
        state.loader = false;
        // Update messages to mark them as read
        state.messages = state.messages.map((message) => ({
          ...message,
          read: true,
          readAt: new Date().toISOString(),
        }));
        state.successMessage = payload.message;
      })
      .addCase(mark_messages_read.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Mark Single Message Read Cases
      .addCase(mark_message_read.pending, (state) => {
        state.loader = true;
      })
      .addCase(mark_message_read.fulfilled, (state, { payload }) => {
        state.loader = false;
        // Update specific message to mark it as read
        state.messages = state.messages.map((message) =>
          message._id === payload.data._id
            ? { ...message, read: true, readAt: payload.data.readAt }
            : message
        );
        state.successMessage = payload.message;
      })
      .addCase(mark_message_read.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Get Unread Count Cases
      .addCase(get_unread_count.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_unread_count.fulfilled, (state, { payload }) => {
        state.loader = false;
        // Update unread count in stats
        state.stats.unreadMessages = payload.unreadCount;
      })
      .addCase(get_unread_count.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });

    // Delete Message Cases
    builder.addCase(delete_message.fulfilled, (state, { payload }) => {
      state.messages = state.messages.filter(
        (message) => message._id !== payload.messageId,
      );
    });
    builder.addCase(delete_message.rejected, (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
    });
  },
});

export const {
  clearMessage,
  add_new_message,
  clear_messages,
  set_current_customer,
  set_sent_message,
  update_message_read_status,
  update_messages_read_status,
} = adminChatReducer.actions;

export default adminChatReducer.reducer;
