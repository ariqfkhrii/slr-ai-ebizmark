import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

type Props = {
  open: boolean;
  item: any;
  draftContent: string;
  onClose: () => void;
  onChangeContent: (value: string) => void;
  onSave: () => void;
};

export default function AutoReportingDetailDialog({
  open,
  item,
  draftContent,
  onClose,
  onChangeContent,
  onSave,
}: Props) {
  const [saving, setSaving] = useState(false);
  const wordCount = draftContent ? draftContent.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Detail item – {item?.title ?? 'Item PRISMA'}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {item?.chapter} · {wordCount} kata
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
          Instruksi PRISMA
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {item?.detail}
        </Typography>

        <TextField
          fullWidth
          multiline
          minRows={12}
          value={draftContent}
          onChange={(event) => onChangeContent(event.target.value)}
          placeholder="Edit narasi di sini..."
          label="Narasi"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Batal</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
