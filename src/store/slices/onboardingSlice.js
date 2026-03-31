// store/onboardingSlice.js
import { createSlice } from "@reduxjs/toolkit";

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState: { active: true },
  reducers: {
    startOnboarding: (state) => {
      state.active = true;
    },
    finishOnboarding: (state) => {
      state.active = false;
    },
  },
});

export const { startOnboarding, finishOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;
