// store/reducers/adminToAdminReducer.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Get admin chat stats
export const get_chat_stats = createAsyncThunk(
  "adminToAdmin/get_chat_stats",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin-chat-stats", {
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

// Get active admins
export const get_active_admins = createAsyncThunk(
  "adminToAdmin/get_active_admins",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin-active-admins", {
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

// Get active admins with new admin
export const get_active_admins_with_new_admin = createAsyncThunk(
  "adminToAdmin/get_active_admins_with_new_admin",
  async (adminId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/admin-active-admins-with-new-admin/${adminId}`,
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

// Get all admins
export const get_all_admins = createAsyncThunk(
  "adminToAdmin/get_all_admins",
  async (_, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get("/admin-all-admins", {
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

// Get admin messages
export const get_admin_messages = createAsyncThunk(
  "adminToAdmin/get_admin_messages",
  async (
    { adminId, currentAdminId },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/admin-messages/${adminId}/${currentAdminId}`,
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

// Send admin message
export const send_admin_message = createAsyncThunk(
  "adminToAdmin/send_admin_message",
  async (messageData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin-message-send", messageData, {
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

// Send admin file
export const send_admin_file = createAsyncThunk(
  "adminToAdmin/send_admin_file",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/admin-message-send-file", formData, {
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

// Delete admin message
export const delete_admin_message = createAsyncThunk(
  "adminToAdmin/delete_admin_message",
  async (messageId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/admin-message/${messageId}`, {
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

// Mark admin messages as read
export const mark_messages_read = createAsyncThunk(
  "adminToAdmin/mark_messages_read",
  async ({ senderId, receiverId }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/admin-messages-mark-read/${senderId}/${receiverId}`,
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

// Mark single admin message as read
export const mark_message_read = createAsyncThunk(
  "adminToAdmin/mark_message_read",
  async (messageId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/admin-message-mark-read/${messageId}`,
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

// Get unread admin message count
export const get_unread_count = createAsyncThunk(
  "adminToAdmin/get_unread_count",
  async ({ userId, userModel }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(
        `/admin-unread-count/${userId}/${userModel}`,
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

export const adminToAdminReducer = createSlice({
  name: "adminToAdmin",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    messages: [],
    conversationId: null,
    stats: {
      totalAdmins: 0,
      activeChats: 0,
      totalMessages: 0,
      unreadMessages: 0,
    },
    activeAdmins: [],
    allAdmins: [],
    currentAdmin: null,
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
    set_current_admin: (state, action) => {
      state.currentAdmin = action.payload;
      state.conversationId = null;
    },
    set_sent_message: (state, action) => {
      state.sentMessage = action.payload;
    },
    update_message_read_status: (state, action) => {
      const { messageId, read, readAt } = action.payload;
      state.messages = state.messages.map((message) =>
        message._id === messageId ? { ...message, read, readAt } : message,
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
          : message,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Chat Stats Cases
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

      // Active Admins Cases
      .addCase(get_active_admins.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_active_admins.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.activeAdmins = payload.admins;
      })
      .addCase(get_active_admins.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Active Admins with New Admin Cases
      .addCase(get_active_admins_with_new_admin.pending, (state) => {
        state.loader = true;
      })
      .addCase(
        get_active_admins_with_new_admin.fulfilled,
        (state, { payload }) => {
          state.loader = false;
          state.activeAdmins = payload.admins;
        },
      )
      .addCase(
        get_active_admins_with_new_admin.rejected,
        (state, { payload }) => {
          state.loader = false;
          state.errorMessage = payload.errorMessage;
        },
      )

      // Get All Admins Cases
      .addCase(get_all_admins.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_all_admins.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.allAdmins = payload.admins;
      })
      .addCase(get_all_admins.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Get Admin Messages Cases
      .addCase(get_admin_messages.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_admin_messages.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.messages = payload.messages;
        state.conversationId =
          payload.conversationId ||
          payload.messages?.[0]?.conversationId ||
          state.conversationId;
      })
      .addCase(get_admin_messages.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Send Admin Message Cases
      .addCase(send_admin_message.fulfilled, (state, { payload }) => {
        if (
          !state.conversationId ||
          payload.message.conversationId === state.conversationId
        ) {
          state.messages.push(payload.message);
        }
      })
      .addCase(send_admin_file.fulfilled, (state, { payload }) => {
        if (
          !state.conversationId ||
          payload.message.conversationId === state.conversationId
        ) {
          state.messages.push(payload.message);
        }
        state.sentMessage = payload.message;
      })
      .addCase(send_admin_file.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      })

      // Mark Admin Messages Read Cases
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

      // Mark Single Admin Message Read Cases
      .addCase(mark_message_read.pending, (state) => {
        state.loader = true;
      })
      .addCase(mark_message_read.fulfilled, (state, { payload }) => {
        state.loader = false;
        // Update specific message to mark it as read
        state.messages = state.messages.map((message) =>
          message._id === payload.data._id
            ? { ...message, read: true, readAt: payload.data.readAt }
            : message,
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

    // Delete Admin Message Cases
    builder.addCase(delete_admin_message.fulfilled, (state, { payload }) => {
      state.messages = state.messages.filter(
        (message) => message._id !== payload.messageId,
      );
    });
    builder.addCase(delete_admin_message.rejected, (state, { payload }) => {
      state.errorMessage = payload.errorMessage;
    });
  },
});

export const {
  clearMessage,
  add_new_message,
  clear_messages,
  set_current_admin,
  set_sent_message,
  update_message_read_status,
  update_messages_read_status,
} = adminToAdminReducer.actions;

export default adminToAdminReducer.reducer;
