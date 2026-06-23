import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchFiles = createAsyncThunk(
  "files/fetchFiles",
  async (token, { rejectWithValue }) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await axios.get(`${apiUrl}/api/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        return response.data.files;
      } else {
        return rejectWithValue("Failed to load files");
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.msg || "Failed to load files");
    }
  }
);

const fileSlice = createSlice({
  name: "files",
  initialState: {
    files: [],
    loading: false,
    error: null,
    searchTerm: "",
    selectedType: "all",
    viewMode: "grid"
  },
  reducers: {
    addFile: (state, action) => {
      // Avoid duplicate adds
      if (!state.files.find(f => f._id === action.payload._id)) {
        state.files = [action.payload, ...state.files];
      }
    },
    removeFile: (state, action) => {
      state.files = state.files.filter(f => f._id !== action.payload);
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSelectedType: (state, action) => {
      state.selectedType = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addFile, removeFile, setSearchTerm, setSelectedType, setViewMode } = fileSlice.actions;
export default fileSlice.reducer;
