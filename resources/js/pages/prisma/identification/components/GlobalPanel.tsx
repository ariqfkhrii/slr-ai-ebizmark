import { Box, Divider, Stack, Typography } from '@mui/material';

export default function GlobalPanel() {
  return (
    <Box
      sx={{
        width: 300,
        borderLeft: 1,
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Global Overview
      </Typography>

      <Divider />

      <Stack spacing={1}>
        <Typography variant="body2">Total Keywords: 0</Typography>
        <Typography variant="body2">Total Articles: 0</Typography>
        <Typography variant="body2">Processed: 0</Typography>
      </Stack>

      <Divider />

      <Box
        sx={{
          flex: 1,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Chart / visualisasi nanti di sini
        </Typography>
      </Box>
    </Box>
  );
}
