import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null,
  user_data: localStorage.getItem("@storage_user_data")
    ? JSON.parse(localStorage.getItem("@storage_user_data"))
    : null,
  boughtTemplates: localStorage.getItem("bought_templates")
    ? JSON.parse(localStorage.getItem("bought_templates"))
    : null,
  boughtTemplateAll: localStorage.getItem("bought_templates_all")
    ? JSON.parse(localStorage.getItem("bought_templates_all"))
    : null,
  boughtTemplatesCount: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.data = action.payload;
      localStorage.setItem("user", JSON.stringify(state.data));
    },
    setUser_data: (state, action) => {
      state.user_data = action.payload;
      localStorage.setItem(
        "@storage_user_data",
        JSON.stringify(state.user_data)
      );
    },
    // setBoughtTemplates: (state, action) => {
    //   const existing = Array.isArray(state.boughtTemplates)
    //     ? state.boughtTemplates
    //     : [];

    //   const payload = Array.isArray(action.payload)
    //     ? action.payload
    //     : [action.payload];

    //   const merged = [...existing];

    //   for (const newItem of payload) {
    //     const newId = newItem.template_id || newItem.id;

    //     const index = merged.findIndex(
    //       (item) => item.template_id === newId || item.id === newId
    //     );

    //     if (index >= 0) {
    //       merged[index] = { ...merged[index], ...newItem };
    //     } else {
    //       merged.push(newItem);
    //     }
    //   }

    //   state.boughtTemplates = merged;
    //   localStorage.setItem("bought_templates", JSON.stringify(merged));
    // },
    setBoughtTemplates: (state, action) => {
      const existing = Array.isArray(state.boughtTemplates)
        ? state.boughtTemplates
        : [];

      const payload = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];

      const merged = [...existing];

      for (const newItem of payload) {
        if (!newItem || typeof newItem !== "object") continue;

        const newId = newItem.template_id || newItem.id;
        if (!newId) continue;

        const index = merged.findIndex(
          (item) => item.template_id === newId || item.id === newId
        );

        if (index >= 0) {
          merged[index] = { ...merged[index], ...newItem };
        } else {
          merged.push(newItem);
        }
      }

      state.boughtTemplates = merged;
      localStorage.setItem("bought_templates", JSON.stringify(merged));
    },
    setBoughtTemplatesAll: (state, action) => {
      state.boughtTemplateAll = action.payload;
      localStorage.setItem(
        "bought_templates_all",
        JSON.stringify(action.payload)
      );
    },
    setBoughtTemplatesCount: (state, action) => {
      state.boughtTemplatesCount = action.payload;
    },
    logout: (state) => {
      state.data = null;
      state.user_data = null;

      localStorage.removeItem("user");
      localStorage.removeItem("@storage_user_data");
      localStorage.removeItem("tour-completed");
      localStorage.removeItem("tour-step");
    },
  },
});

// Селекторы
export const selectUser = (state) => state?.user.data;
export const selectUserData = (state) => state?.user.user_data;

// Чистый селектор isLoggedIn
export const selectIsLoggedIn = (state) => !!state.user.data;

export const {
  setUser,
  setUser_data,
  setBoughtTemplates,
  setBoughtTemplatesAll,
  setBoughtTemplatesCount,
  logout,
} = userSlice.actions;
export default userSlice.reducer;
