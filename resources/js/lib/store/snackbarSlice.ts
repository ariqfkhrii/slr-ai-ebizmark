import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SnackbarSeverity = 'success' | 'error' | 'info' | 'warning';

type ProgressStatus = 'running' | 'completed' | 'failed' | 'cancelled';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: SnackbarSeverity;
  progress: {
    open: boolean;
    batchId: string | null;
    message: string;
    percentage: number;
    status: ProgressStatus;
    processedJobs: number;
    totalJobs: number;
  };
};

const initialState: SnackbarState = {
  open: false,
  message: '',
  severity: 'info',
  progress: {
    open: false,
    batchId: null,
    message: '',
    percentage: 0,
    status: 'running',
    processedJobs: 0,
    totalJobs: 0,
  },
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

    showProgressSnackbar: (
      state,
      action: PayloadAction<{
        batchId: string;
        message?: string;
      }>,
    ) => {
      state.progress.open = true;
      state.progress.batchId = action.payload.batchId;
      state.progress.message = action.payload.message ?? 'Fetching metadata...';
      state.progress.percentage = 0;
      state.progress.status = 'running';
      state.progress.processedJobs = 0;
      state.progress.totalJobs = 0;
    },

    updateProgressSnackbar: (
      state,
      action: PayloadAction<{
        message?: string;
        percentage: number;
        status: ProgressStatus;
        processedJobs: number;
        totalJobs: number;
      }>,
    ) => {
      state.progress.message = action.payload.message ?? state.progress.message;
      state.progress.percentage = action.payload.percentage;
      state.progress.status = action.payload.status;
      state.progress.processedJobs = action.payload.processedJobs;
      state.progress.totalJobs = action.payload.totalJobs;
    },

    hideProgressSnackbar: (state) => {
      state.progress.open = false;
      state.progress.batchId = null;
      state.progress.message = '';
      state.progress.percentage = 0;
      state.progress.status = 'running';
      state.progress.processedJobs = 0;
      state.progress.totalJobs = 0;
    },
  },
});

export const {
  showSnackbar,
  hideSnackbar,
  showProgressSnackbar,
  updateProgressSnackbar,
  hideProgressSnackbar,
} = snackbarSlice.actions;

export const showSuccess = (message: string) =>
  showSnackbar({ message, severity: 'success' });

export const showError = (message: string) =>
  showSnackbar({ message, severity: 'error' });

export const showInfo = (message: string) =>
  showSnackbar({ message, severity: 'info' });

export const showWarning = (message: string) =>
  showSnackbar({ message, severity: 'warning' });

export default snackbarSlice.reducer;
