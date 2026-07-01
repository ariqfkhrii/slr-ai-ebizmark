import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { hideSnackbar } from '@/store/slices/snackbarSlice';

import {
  Alert,
  Box,
  CircularProgress,
  LinearProgress,
  Snackbar,
  Typography,
} from '@mui/material';

export default function SnackbarProvider() {
  const dispatch = useAppDispatch();

  const { open, message, severity, progress } = useAppSelector(
    (state) => state.snackbar,
  );

  return (
    <>
      {/* NORMAL SNACKBAR */}
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => dispatch(hideSnackbar())}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Alert
          onClose={() => dispatch(hideSnackbar())}
          severity={severity}
          variant="filled"
          sx={{
            width: '100%',
          }}
        >
          {message}
        </Alert>
      </Snackbar>

      {/* PROGRESS SNACKBAR */}
      <Snackbar
        open={progress.open}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <Box
          sx={{
            width: 360,
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 6,
            border: '1px solid',
            borderColor: 'divider',
            p: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <CircularProgress size={26} thickness={4} />

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: 1.2,
                }}
              >
                {progress.message}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: 'text.secondary',
                  mt: 0.5,
                }}
              >
                {progress.percentage}%
              </Typography>
            </Box>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress.percentage}
            sx={{
              mt: 1.5,
              height: 6,
              borderRadius: 999,
            }}
          />
        </Box>
      </Snackbar>
    </>
  );
}
