import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { $authHost } from "../../utils/api/http";
import { logPostError } from "../../utils/api/helpers/logErrorHelper";

export const toggleIntegration = createAsyncThunk(
  "integrations/toggleIntegration",
  async ({ id, newStatus }, { rejectWithValue }) => {
    try {
      const res = await $authHost.put(
        `/integration/enabled?integration_id=${id}&enabled=${newStatus}`
      );
      if (res.status === 200) return { id, newStatus };
      throw new Error("Ошибка сохранения");
    } catch (error) {
      logPostError?.(error);
      return rejectWithValue("Ошибка при обновлении интеграции");
    }
  }
);

const initialState = {
  integrations: sessionStorage.getItem("integrations")
    ? JSON.parse(sessionStorage.getItem("integrations"))
    : null,
  editedIntegration: null,
  isIntegrationLoading: false,
  error: null,

  dismissedBotBanners: sessionStorage.getItem("dismissedBotBanners")
    ? JSON.parse(sessionStorage.getItem("dismissedBotBanners"))
    : [],
};

const integrationsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    setIntegrationsList(state, action) {
      state.integrations = action.payload;
      sessionStorage.setItem(
        "integrations",
        JSON.stringify(state.integrations)
      );
    },
    setEditedIntegration(state, action) {
      state.editedIntegration = action.payload;
    },
    setIntegrationStatus(state, action) {
      const { id, is_active } = action.payload;
      const target = state.integrations.find((i) => i.id === id);
      if (target) target.is_active = is_active;
    },
    setIsIntegrationLoading(state, action) {
      state.isIntegrationLoading = action.payload;
    },
    dismissBotBanner(state, action) {
      const id = action.payload;
      if (!state.dismissedBotBanners.includes(id)) {
        state.dismissedBotBanners.push(id);
        sessionStorage.setItem(
          "dismissedBotBanners",
          JSON.stringify(state.dismissedBotBanners)
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(toggleIntegration.pending, (state) => {
        state.isIntegrationLoading = true;
        state.error = null;
      })
      .addCase(toggleIntegration.fulfilled, (state, action) => {
        state.isIntegrationLoading = false;
        const { id, newStatus } = action.payload;
        const target = state.integrations.find((i) => i.id === id);
        if (target) target.is_active = newStatus;
      })
      .addCase(toggleIntegration.rejected, (state, action) => {
        state.isIntegrationLoading = false;
        state.error = action.payload || "Ошибка при сохранении";
      });
  },
});

export const {
  setIntegrationsList,
  setIntegrationStatus,
  setEditedIntegration,
  setIsIntegrationLoading,
  dismissBotBanner,
} = integrationsSlice.actions;
export default integrationsSlice.reducer;
