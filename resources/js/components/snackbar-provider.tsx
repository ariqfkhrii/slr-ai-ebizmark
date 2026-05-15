import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { hideSnackbar } from '@/lib/store/snackbarSlice';
import { Alert, Snackbar } from '@mui/material';

export default function SnackbarProvider() {
  const dispatch = useAppDispatch();
  const { open, message, severity } = useAppSelector((state) => state.snackbar);

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={() => dispatch(hideSnackbar())}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={() => dispatch(hideSnackbar())}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
