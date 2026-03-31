import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  positions: localStorage.getItem("positions")
    ? JSON.parse(localStorage.getItem("positions"))
    : null,
  loading: false,
};

const positionsSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    setPositions(state, action) {
      state.positions = action.payload;
    },
    setPositionsLoading(state, action) {
      state.loading = action.payload;
    },
  },
});

export const { setPositions, setPositionsLoading } = positionsSlice.actions;
export default positionsSlice.reducer;
