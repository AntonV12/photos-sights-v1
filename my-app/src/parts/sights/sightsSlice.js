import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const host = "https://sights.antonv-training-domain.ru";

export const addSight = createAsyncThunk("sights/addSlice", async (sight, { rejectWithValue }) => {
  try {
    const response = await fetch(`${host}:5000/api/sights`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sight),
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

export const fetchSights = createAsyncThunk("sights/fetchSights", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch(`${host}:5000/api/sights`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch users");
    }
    const data = await response.json();

    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const reactionClick = createAsyncThunk(
  "sights/reactionClick",
  async ({ sightId, userId, imageId, reaction }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${host}:5000/api/sights/${sightId}/images/${imageId}/reactions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, reaction }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update reaction");
      }

      return;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateComments = createAsyncThunk(
  "sights/updateComments",
  async ({ id, sightId, userId, imageId, date, userName, comment, answer }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${host}:5000/api/sights/${sightId}/images/${imageId}/comments`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, userId, date, userName, comment, answer }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update comments");
      }

      const data = await response.json();
      return data.sight;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateComment = createAsyncThunk(
  "sights/updateComment",
  async ({ id, sightId, imageId, answer }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${host}:5000/api/sights/${sightId}/images/${imageId}/comments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, answer }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update comment");
      }

      const data = await response.json();
      return data.sight;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateSight = createAsyncThunk("sights/updateSight", async (sight, { rejectWithValue }) => {
  try {
    const response = await fetch(`${host}:5000/api/sights/${sight._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sight),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update sight");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const deleteSight = createAsyncThunk("sights/deleteSight", async (sightId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${host}:5000/api/sights/${sightId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete sight");
    }

    return { sightId, message: "Успешно удалено!" };
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  sights: [],
  status: "idle",
  error: null,
  message: null,
};

const sightsSlice = createSlice({
  name: "sights",
  initialState,
  reducers: {
    clearSightsMessage: (state) => {
      state.message = null;
    },
    clearSightsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addSight.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addSight.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sights.push(action.payload);
        state.message = action.payload;
      })
      .addCase(addSight.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchSights.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSights.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sights = action.payload;
        if (location.pathname === "/") {
          window.scrollTo(0, sessionStorage.getItem("currentScrollPosition") || 0);
        }
      })
      .addCase(fetchSights.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateComments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateComments.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedSight = action.payload;
        const index = state.sights.findIndex((sight) => sight?._id === updatedSight?._id);
        if (index !== -1) {
          state.sights[index] = updatedSight;
        }
        state.message = action.payload;
      })
      .addCase(updateComments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(reactionClick.pending, (state) => {
        state.status = "loading";
      })
      .addCase(reactionClick.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedSight = action.payload;
        const index = state.sights.findIndex((sight) => sight?._id === updatedSight?._id);
        if (index !== -1) {
          state.sights[index] = updatedSight;
        }
        state.message = action.payload;
      })
      .addCase(reactionClick.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      .addCase(updateComment.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedSight = action.payload;
        const index = state.sights.findIndex((sight) => sight?._id === updatedSight?._id);
        if (index !== -1) {
          state.sights[index] = updatedSight;
        }
        state.message = action.payload;
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateSight.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateSight.fulfilled, (state, action) => {
        state.status = "succeeded";
        const updatedSight = action.payload;
        const index = state.sights.findIndex((sight) => sight?._id === updatedSight?._id);
        if (index !== -1) {
          state.sights[index] = updatedSight;
        }
        state.message = action.payload;
      })
      .addCase(updateSight.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteSight.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteSight.fulfilled, (state, action) => {
        state.status = "succeeded";
        const deletedSight = action.payload;
        const index = state.sights.findIndex((sight) => sight?._id === deletedSight?._id);
        if (index !== -1) {
          state.sights.splice(index, 1);
        }
        state.message = action.payload;
      })
      .addCase(deleteSight.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { clearSightsMessage, clearSightsError } = sightsSlice.actions;

export default sightsSlice.reducer;

export const selectAllSights = (state) => state.sights.sights;
export const selectSightById = (state, sightId) => {
  if (Array.isArray(state.sights.sights)) {
    return state.sights.sights.find((sight) => sight._id === sightId);
  } else {
    return null;
  }
};
