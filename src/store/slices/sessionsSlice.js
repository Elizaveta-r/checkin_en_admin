import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: localStorage.getItem("sessions_data")
    ? JSON.parse(localStorage.getItem("sessions_data"))
    : null,
};

const sessionsSlice = createSlice({
  name: "sessions",
  initialState,
  reducers: {
    setSessions(state, action) {
      state.data = action.payload;
    },
  },
});

export const { setSessions } = sessionsSlice.actions;
export default sessionsSlice.reducer;
