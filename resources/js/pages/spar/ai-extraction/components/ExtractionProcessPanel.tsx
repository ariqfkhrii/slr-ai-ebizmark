import { Box, Button, Paper, Stack, Typography } from '@mui/material';

type Props = {
  onRunAi: () => void;
};

export default function ExtractionProcessPanel({ onRunAi }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
            }}
          >
            AI Extraction
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Jalankan proses ekstraksi otomatis menggunakan AI terhadap seluruh
            artikel yang telah berhasil disinkronisasi.
          </Typography>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: 'grey.50',
          }}
        >
          <Stack spacing={1}>
            <Typography
              sx={{
                fontWeight: 600,
              }}
            >
              Informasi
            </Typography>

            <Typography variant="body2" color="text.secondary">
              • File TXT dibuat otomatis ketika proses sinkronisasi metadata
              selesai.
            </Typography>

            <Typography variant="body2" color="text.secondary">
              • AI akan melakukan ekstraksi terhadap seluruh artikel yang
              tersedia.
            </Typography>

            <Typography variant="body2" color="text.secondary">
              • Proses dapat memerlukan beberapa menit tergantung jumlah
              artikel.
            </Typography>
          </Stack>
        </Paper>

        <Box>
          <Button
            variant="contained"
            size="large"
            onClick={onRunAi}
            sx={{
              minWidth: 220,
            }}
          >
            Mulai Ekstraksi Otomatis
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
