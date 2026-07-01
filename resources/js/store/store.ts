import { combineReducers, configureStore } from '@reduxjs/toolkit';
import articleFilterReducer from './slices/articleFilterSlice';
import snackbarReducer from './slices/snackbarSlice';

const rootReducer = combineReducers({
  articleFilter: articleFilterReducer,
  snackbar: snackbarReducer,
  // ... reducers lain
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
