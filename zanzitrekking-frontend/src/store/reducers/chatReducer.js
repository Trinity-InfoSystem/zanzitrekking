// store/reducers/customerChatReducer.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

// Get messages for customer
export const get_messages = createAsyncThunk(
  "customerChat/get_messages",
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

// Send message as customer
export const send_message = createAsyncThunk(
  "customerChat/send_message",
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

// Mark messages as read for customer
export const mark_messages_read = createAsyncThunk(
  "customerChat/mark_messages_read",
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

export const send_file = createAsyncThunk(
  "customerChat/send_file",
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

export const customerChatReducer = createSlice({
  name: "customerChat",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    messages: [],
    conversationId: null,
    unreadCount: 0,
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
    set_sent_message: (state, action) => {
      state.sentMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Messages Cases
      .addCase(get_messages.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_messages.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.messages = payload.messages;
        state.successMessage = payload.message;
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
      .addCase(send_message.pending, (state) => {
        state.loader = true;
      })
      .addCase(send_message.fulfilled, (state, { payload }) => {
        state.loader = false;
        if (
          !state.conversationId ||
          payload.message.conversationId === state.conversationId
        ) {
          state.messages.push(payload.message);
        }
        state.successMessage = payload.message;
      })
      .addCase(send_message.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      // Mark Messages Read Cases
      .addCase(mark_messages_read.pending, (state) => {
        state.loader = true;
      })
      .addCase(mark_messages_read.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.messages = state.messages.map((msg) =>
          !msg.read ? { ...msg, read: true, readAt: new Date().toISOString() } : msg,
        );
        state.successMessage = payload.message;
      })
      .addCase(mark_messages_read.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })

      .addCase(send_file.pending, (state) => {
        state.loader = true;
      })
      .addCase(send_file.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.sentMessage = payload.message;
        if (
          !state.conversationId ||
          payload.message.conversationId === state.conversationId
        ) {
          state.messages.push(payload.message);
        }
        state.successMessage = "File sent successfully";
      })
      .addCase(send_file.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      // Delete Message Cases
      .addCase(delete_message.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_message.fulfilled, (state, { payload }) => {
        state.messages = state.messages.filter(
          (message) => message._id !== payload.messageId,
        );
        state.successMessage = "Message deleted successfully";
      })
      .addCase(delete_message.rejected, (state, { payload }) => {
        state.errorMessage = payload.errorMessage;
      });
  },
});

export const {
  clearMessage,
  add_new_message,
  clear_messages,
  set_sent_message,
} = customerChatReducer.actions;

export default customerChatReducer.reducer;
