import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  step: 0,
  loadingSignIn: false,
  loadingCode: false,
  loadingSignUp: false,

  errorSignUp: "",
  errorSignIn: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setStep(state, action) {
      state.step = action.payload;
    },
    setLoadingSignIn(state, action) {
      if (action.payload) {
        state.loadingSignIn = true;
      } else {
        state.loadingSignIn = false;
      }
    },
    setLoadingSignUp(state, action) {
      if (action.payload) {
        state.loadingSignUp = true;
      } else {
        state.loadingSignUp = false;
      }
    },
    setLoadingCode(state, action) {
      if (action.payload) {
        state.loadingCode = true;
      } else {
        state.loadingCode = false;
      }
    },

    setErrorSignIn(state, action) {
      state.errorSignIn = action.payload;
    },
    setErrorSignUp(state, action) {
      state.errorSignUp = action.payload;
    },
  },
});

export const {
  setStep,
  setLoadingSignIn,
  setLoadingSignUp,
  setLoadingCode,
  setErrorSignIn,
  setErrorSignUp,
} = authSlice.actions;
export default authSlice.reducer;
