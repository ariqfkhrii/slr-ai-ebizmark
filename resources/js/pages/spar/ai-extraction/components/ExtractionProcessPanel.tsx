import { Box, Button, Typography } from '@mui/material';

type Props = {
  onRunAi: () => void;
};

export default function ExtractionProcessPanel({ onRunAi }: Props) {
  return (
    <Box>
      <Typography variant="h6">Tahapan Ekstraksi</Typography>
      <Typography variant="body2">
        TXT dibuat otomatis saat sinkronisasi untuk efisiensi ekstraksi.
      </Typography>
      <br />
      <Typography variant="subtitle1">Sinkron AI</Typography>
      <Typography variant="body2">
        Sinkronisasi dengan AI untuk ekstraksi data otomatis.
      </Typography>
      <Button variant="contained" onClick={onRunAi}>
        Sinkron Sekarang
      </Button>
    </Box>
  );
}
