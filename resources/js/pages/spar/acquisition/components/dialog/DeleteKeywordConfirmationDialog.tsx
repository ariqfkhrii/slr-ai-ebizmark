import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { TriangleAlert } from 'lucide-react';

type Props = {
  onDeleteKeyword: (id: number) => void;
  keywordId: number;
  open: boolean;
  onClose: () => void;
};

export default function DeleteKeywordConfirmationDialog({
  onDeleteKeyword,
  keywordId,
  open,
  onClose,
}: Props) {
  const handleDelete = () => {
    onDeleteKeyword(keywordId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box sx={{ padding: '4px', borderRadius: '36px' }}>
        <DialogTitle sx={{ paddingBottom: '8px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Box
              sx={{
                width: '42px',
                height: '42px',
                minWidth: '42px',
                borderRadius: '12px',
                backgroundColor: '#fdecea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TriangleAlert size={22} color="#d32f2f" />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '18px', fontWeight: 700 }}>
                Hapus Keyword
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ paddingTop: '12px !important' }}>
          <Typography
            sx={{
              fontSize: '14px',
              color: 'text.secondary',
              lineHeight: 1.7,
            }}
          >
            Keyword dan semua metadata terkait akan dihapus permanen.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            paddingX: '24px',
            paddingBottom: '16px',
            paddingTop: '8px',
            gap: '8px',
          }}
        >
          <Button onClick={onClose} variant="outlined" color="inherit">
            Batal
          </Button>

          <Button onClick={handleDelete} variant="contained" color="error">
            Hapus
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
