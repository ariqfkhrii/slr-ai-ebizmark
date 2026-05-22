import { Box, Paper, Stack, Typography } from '@mui/material';
import type { MetricCardProps } from '../types';

export default function MetricCard({
  title,
  value,
  tone,
  icon,
}: MetricCardProps) {
  const palette = {
    green: {
      background: 'linear-gradient(135deg, #d7fbe8 0%, #c1f7d3 100%)',
      color: '#0f7a36',
      border: 'rgba(61, 180, 101, 0.28)',
    },
    red: {
      background: 'linear-gradient(135deg, #fde2e2 0%, #fbc8c8 100%)',
      color: '#b42318',
      border: 'rgba(214, 76, 76, 0.22)',
    },
    indigo: {
      background: 'linear-gradient(135deg, #e3ddff 0%, #cec8ff 100%)',
      color: '#2449c7',
      border: 'rgba(84, 82, 214, 0.2)',
    },
  }[tone];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        px: 2.5,
        py: 2,
        minHeight: 132,
        background: palette.background,
        border: `1px solid ${palette.border}`,
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: palette.color }}>
          {icon}
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
            {title}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1,
            color: palette.color,
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            fontSize: 18,
            fontWeight: 600,
            color: palette.color,
          }}
        >
          Record
        </Typography>
      </Stack>
    </Paper>
  );
}