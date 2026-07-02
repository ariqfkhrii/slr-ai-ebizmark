import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

type Props = {
  open: boolean;
  status: 'idle' | 'running' | 'success' | 'error';
  progress: number;
  processed: number;
  total: number;
  errorMessage: string;
  onClose: () => void;
};

export default function ExtractionSyncDialog({
  open,
  status,
  progress,
  processed,
  total,
  errorMessage,
  onClose,
}: Props) {
  const isRunning = status === 'running';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <Dialog
      open={open}
      onClose={isRunning ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
          }}
        >
          AI Extraction Synchronization
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {isSuccess ? (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 1,
              }}
            >
              🎉 Synchronization Completed
            </Typography>

            <Typography color="text.secondary">
              Semua artikel berhasil diproses oleh AI.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                }}
              >
                Processing AI Extraction
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Mohon tunggu selama proses ekstraksi berjalan.
              </Typography>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Progress
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                    }}
                  >
                    {processed} / {total || '-'} Articles
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                  }}
                />

                <Typography variant="body2" color="text.secondary">
                  {progress.toFixed(0)}%
                </Typography>
              </Stack>
            </Paper>

            {isError && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderColor: 'error.main',
                  bgcolor: 'error.lighter',
                }}
              >
                <Typography color="error">
                  {errorMessage ||
                    'Terjadi kesalahan saat menjalankan AI extraction.'}
                </Typography>
              </Paper>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Button variant="contained" onClick={onClose} disabled={isRunning}>
          {isSuccess ? 'Close' : 'Back'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
