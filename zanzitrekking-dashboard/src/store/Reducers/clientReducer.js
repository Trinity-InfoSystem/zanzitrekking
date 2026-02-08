import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const clientAdd = createAsyncThunk(
  "client/clientAdd",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/client-add", formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_clients = createAsyncThunk(
  "client/get_clients",
  async (
    { parPage = 10, currentPage = 1, searchValue = "" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/clients-get?page=${currentPage}&searchValue=${searchValue}&parPage=${parPage}`,
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_client = createAsyncThunk(
  "client/get_client",
  async (clientId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/client-get/${clientId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const update_client = createAsyncThunk(
  "client/update_client",
  async ({ clientId, formData }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(`/client-update/${clientId}`, formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const delete_client = createAsyncThunk(
  "client/delete_client",
  async (clientId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/client-delete/${clientId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const delete_clients = createAsyncThunk(
  "client/delete_clients",
  async (ids, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/client-delete-multiple",
        { ids },
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const toggle_client_status = createAsyncThunk(
  "client/toggle_client_status",
  async (clientId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/client-toggle-status/${clientId}`,
        {},
        {
          withCredentials: true,
        },
      );
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

const clientSlice = createSlice({
  name: "client",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    clients: [],
    client: {},
    totalClients: 0,
  },
  reducers: {
    clearMessage: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(clientAdd.pending, (state) => {
        state.loader = true;
      })
      .addCase(clientAdd.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.clients = [...state.clients, payload.client];
      })
      .addCase(clientAdd.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(get_clients.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_clients.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.clients = payload.clients;
        state.totalClients = payload.totalClients;
      })
      .addCase(get_clients.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(get_client.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_client.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.client = payload.client;
      })
      .addCase(get_client.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(update_client.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_client.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.clients = state.clients.map((client) =>
          client._id === payload.client._id ? payload.client : client,
        );
      })
      .addCase(update_client.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(delete_client.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_client.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.clients = state.clients.filter(
          (client) => client._id !== payload.clientId,
        );
      })
      .addCase(delete_client.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(delete_clients.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_clients.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.clients = state.clients.filter(
          (client) => !payload.ids.includes(client._id),
        );
      })
      .addCase(delete_clients.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(toggle_client_status.pending, (state) => {
        state.loader = true;
      })
      .addCase(toggle_client_status.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.clients = state.clients.map((client) =>
          client._id === payload.client._id ? payload.client : client,
        );
      })
      .addCase(toggle_client_status.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });
  },
});

export const { clearMessage } = clientSlice.actions;
export default clientSlice.reducer;

