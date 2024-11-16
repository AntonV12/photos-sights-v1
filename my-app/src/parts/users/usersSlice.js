import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const addUser = createAsyncThunk("users/addUser", async (user, { rejectWithValue }) => {
  try {
    const response = await fetch("http://localhost:5000/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save user");
    }

    return await response.json();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("http://localhost:5000/api/users");
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch users");
    }
    return await response.json();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  users: [],
  status: "idle",
  error: null,
  message: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersMessage: (state) => {
      state.message = null;
    },
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users.push(action.payload);
        state.message = action.payload;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearUsersMessage, clearUsersError } = usersSlice.actions;

export default usersSlice.reducer;

export const selectAllUsers = (state) => state.users.users;

export const selectUserById = (state, userId) => state.users.users.find((user) => user._id === userId);
