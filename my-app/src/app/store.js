import { configureStore } from "@reduxjs/toolkit";
import usersReducer from "../parts/users/usersSlice";
import authReducer from "../parts/users/authSlice";
import sightsReducer from "../parts/sights/sightsSlice";

export default configureStore({
  reducer: {
    users: usersReducer,
    auth: authReducer,
    sights: sightsReducer,
  },
});
