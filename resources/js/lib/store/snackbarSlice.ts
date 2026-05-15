import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
};

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: 'info',
};

const snackbarSlice = createSlice({
  name: 'snackbar',
  initialState,
  reducers: {
    showSnackbar: (
      state,
      action: PayloadAction<{ message: string; severity: SnackbarSeverity }>,
    ) => {
      state.open = true;
      state.message = action.payload.message;
      state.severity = action.payload.severity;
    },
    hideSnackbar: (state) => {
      state.open = false;
    },
  },
});

export const { showSnackbar, hideSnackbar } = snackbarSlice.actions;

export const showSuccess = (message: string) =>
  showSnackbar({ message, severity: 'success' });

export const showError = (message: string) =>
  showSnackbar({ message, severity: 'error' });

export const showInfo = (message: string) =>
  showSnackbar({ message, severity: 'info' });

export const showWarning = (message: string) =>
  showSnackbar({ message, severity: 'warning' });

export default snackbarSlice.reducer;
