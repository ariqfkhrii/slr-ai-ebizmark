import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
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

export default function AiClassificationSyncDialog({
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
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography sx={{ fontWeight: 900 }}>
          Synchronize AI Classification
        </Typography>
        <IconButton onClick={isRunning ? undefined : onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, bgcolor: '#f8fafc' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                bgcolor: '#10b981',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              1
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
              Setup Classification
            </Typography>
          </Box>

          <Box sx={{ width: 64, height: 2, bgcolor: '#10b981' }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                bgcolor: isSuccess ? '#10b981' : '#3b82f6',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              2
            </Box>
            <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
              Auto Classification
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: 3,
            border: '1px solid #e5e7eb',
            bgcolor: '#ffffff',
            p: 2.5,
          }}
        >
          {isSuccess ? (
            <Box
              sx={{
                borderRadius: 3,
                border: '1px solid #bbf7d0',
                bgcolor: '#dcfce7',
                px: 2.5,
                py: 3,
                textAlign: 'center',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 40, color: '#16a34a' }} />
              <Typography sx={{ mt: 1, fontWeight: 900, color: '#15803d' }}>
                Auto Classification Berhasil!
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: '#166534' }}>
                Auto classification berhasil, silahkan klik tombol di bawah
                untuk melihat hasil klasifikasi
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>
                Sedang melakukan sinkronisasi data classification...
              </Typography>
              <Typography sx={{ mt: 0.5, fontSize: 13, color: '#475569' }}>
                {processed} dari {total || '-'} record data berhasil di
                sinkronisasi
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 2, height: 8, borderRadius: 999 }}
              />
              {isError && (
                <Typography sx={{ mt: 1.5, fontSize: 12, color: '#dc2626' }}>
                  {errorMessage || 'Gagal menjalankan AI classification'}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <Box
        sx={{
          p: 2,
          bgcolor: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button
          variant="contained"
          onClick={onClose}
          disabled={isRunning}
          sx={{
            minWidth: 160,
            borderRadius: 3,
            textTransform: 'none',
            fontWeight: 900,
            bgcolor: '#10b981',
            '&:hover': {
              bgcolor: '#059669',
            },
          }}
        >
          Kembali
        </Button>
      </Box>
    </Dialog>
  );
}
