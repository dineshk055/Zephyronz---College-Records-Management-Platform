import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("token") || null;
let user = null;
try {
  const u = localStorage.getItem("user");
  user = u ? JSON.parse(u) : null;
} catch (e) {
  user = null;
}

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token,
    user,
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
    isApproved: user?.status === "Approved" || user?.isApproved
  },
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = !!token;
      state.isAdmin = user?.role === "admin";
      state.isApproved = user?.status === "Approved" || user?.isApproved;
    },
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isApproved = false;
    }
  }
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
