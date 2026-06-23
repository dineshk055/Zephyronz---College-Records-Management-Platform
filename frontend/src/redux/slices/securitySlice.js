import { createSlice } from "@reduxjs/toolkit";

const securitySlice = createSlice({
  name: "security",
  initialState: {
    warnings: [],
    activeWarning: null
  },
  reducers: {
    addWarning: (state, action) => {
      state.warnings.push(action.payload);
      state.activeWarning = action.payload;
    },
    clearActiveWarning: (state) => {
      state.activeWarning = null;
    }
  }
});

export const { addWarning, clearActiveWarning } = securitySlice.actions;
export default securitySlice.reducer;
