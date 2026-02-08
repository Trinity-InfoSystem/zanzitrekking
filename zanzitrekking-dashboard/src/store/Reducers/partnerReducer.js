import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";

export const partnerAdd = createAsyncThunk(
  "partner/partnerAdd",
  async (formData, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post("/partner-add", formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const get_partners = createAsyncThunk(
  "partner/get_partners",
  async (
    { parPage = 10, currentPage = 1, searchValue = "" },
    { fulfillWithValue, rejectWithValue },
  ) => {
    try {
      const { data } = await api.get(
        `/partners-get?page=${currentPage}&searchValue=${searchValue}&parPage=${parPage}`,
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

export const get_partner = createAsyncThunk(
  "partner/get_partner",
  async (partnerId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.get(`/partner-get/${partnerId}`, {
        withCredentials: true,
      });

      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const update_partner = createAsyncThunk(
  "partner/update_partner",
  async ({ partnerId, formData }, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(`/partner-update/${partnerId}`, formData, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const delete_partner = createAsyncThunk(
  "partner/delete_partner",
  async (partnerId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/partner-delete/${partnerId}`, {
        withCredentials: true,
      });
      return fulfillWithValue(data);
    } catch (error) {
      const errorMessage = error?.response?.data?.error || error.message;
      return rejectWithValue({ errorMessage });
    }
  },
);

export const delete_partners = createAsyncThunk(
  "partner/delete_partners",
  async (ids, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/partner-delete-multiple",
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

export const toggle_partner_status = createAsyncThunk(
  "partner/toggle_partner_status",
  async (partnerId, { fulfillWithValue, rejectWithValue }) => {
    try {
      const { data } = await api.put(
        `/partner-toggle-status/${partnerId}`,
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

const partnerSlice = createSlice({
  name: "partner",
  initialState: {
    successMessage: "",
    errorMessage: "",
    loader: false,
    partners: [],
    partner: {},
    totalPartners: 0,
  },
  reducers: {
    clearMessage: (state) => {
      state.errorMessage = "";
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(partnerAdd.pending, (state) => {
        state.loader = true;
      })
      .addCase(partnerAdd.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.partners = [...state.partners, payload.partner];
      })
      .addCase(partnerAdd.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(get_partners.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_partners.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.partners = payload.partners;
        state.totalPartners = payload.totalPartners;
      })
      .addCase(get_partners.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(get_partner.pending, (state) => {
        state.loader = true;
      })
      .addCase(get_partner.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.partner = payload.partner;
      })
      .addCase(get_partner.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(update_partner.pending, (state) => {
        state.loader = true;
      })
      .addCase(update_partner.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.partners = state.partners.map((partner) =>
          partner._id === payload.partner._id ? payload.partner : partner,
        );
      })
      .addCase(update_partner.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(delete_partner.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_partner.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.partners = state.partners.filter(
          (partner) => partner._id !== payload.partnerId,
        );
      })
      .addCase(delete_partner.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(delete_partners.pending, (state) => {
        state.loader = true;
      })
      .addCase(delete_partners.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.partners = state.partners.filter(
          (partner) => !payload.ids.includes(partner._id),
        );
      })
      .addCase(delete_partners.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      })
      .addCase(toggle_partner_status.pending, (state) => {
        state.loader = true;
      })
      .addCase(toggle_partner_status.fulfilled, (state, { payload }) => {
        state.loader = false;
        state.successMessage = payload.message;
        state.partners = state.partners.map((partner) =>
          partner._id === payload.partner._id ? payload.partner : partner,
        );
      })
      .addCase(toggle_partner_status.rejected, (state, { payload }) => {
        state.loader = false;
        state.errorMessage = payload.errorMessage;
      });
  },
});

export const { clearMessage } = partnerSlice.actions;
export default partnerSlice.reducer;
