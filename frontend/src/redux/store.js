import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import fileReducer from "./slices/fileSlice";
import securityReducer from "./slices/securitySlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    files: fileReducer,
    security: securityReducer
  }
});

export default store;
