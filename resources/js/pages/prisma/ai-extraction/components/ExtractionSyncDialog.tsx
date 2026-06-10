import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
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
    <Dialog open={open} onClose={isRunning ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Synchronize AI Extraction</DialogTitle>
      <DialogContent dividers>
        {isSuccess ? (
          <Typography>Auto extraction berhasil.</Typography>
        ) : (
          <Box>
            <Typography>Sinkronisasi data extraction berjalan...</Typography>
            <Typography variant="body2">
              {processed} dari {total || '-'} record data berhasil di sinkronisasi
            </Typography>
            <LinearProgress variant="determinate" value={progress} />
            <br />
            {isError && (
              <Typography variant="body2" color="error">
                {errorMessage || 'Gagal menjalankan AI extraction'}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose} disabled={isRunning}>
          Kembali
        </Button>
      </DialogActions>
    </Dialog>
  );
}
