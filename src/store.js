import { configureStore } from "@reduxjs/toolkit";
import dataReducer from "./features/data/dataSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import thunk from "redux-thunk";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, dataReducer);

export const store = configureStore({
  reducer: {
    data: persistedReducer,
    middleware: [thunk],
  },
});

export const persistor = persistStore(store);
