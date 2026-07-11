import { Box, Paper, Stack, Typography } from '@mui/material';
import type { MetricCardProps } from '../types';

export default function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        px: 2,
        py: 1.75,
        minHeight: 120,
        bgcolor: '#fff',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
      }}
    >
      <Stack spacing={1}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.secondary',
          }}
        >
          {icon}
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: 42,
            fontWeight: 700,
            lineHeight: 1,
            color: 'text.primary',
          }}
        >
          {value}
        </Typography>
      </Stack>
    </Paper>
  );
}
