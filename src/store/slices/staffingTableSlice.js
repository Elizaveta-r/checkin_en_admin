// store/onboardingSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tableData: [],
  loadingTable: false,
};

const tableSlice = createSlice({
  name: "table",
  initialState: initialState,
  reducers: {
    setTable: (state, action) => {
      state.tableData = action.payload;
    },
    setLoadingTable: (state, action) => {
      state.loadingTable = action.payload;
    },
  },
});

export const { setTable, setLoadingTable } = tableSlice.actions;
export default tableSlice.reducer;
