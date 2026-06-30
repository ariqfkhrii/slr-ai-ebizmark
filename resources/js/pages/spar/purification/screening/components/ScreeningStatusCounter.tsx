import { Box, Chip, Typography } from '@mui/material';

type Props = {
  total: number;
  included: number;
  excluded: number;
};

export default function ScreeningStatusCounter({
  included,
  excluded,
  total,
}: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 800,
          color: 'text.secondary',
        }}
      >
        STATUS
      </Typography>

      <Chip
        size="small"
        label={`Included: ${included}`}
        sx={{
          bgcolor: 'rgba(34,197,94,.12)',
          color: '#15803d',
          fontWeight: 700,
        }}
      />

      <Chip
        size="small"
        label={`Excluded: ${excluded}`}
        sx={{
          bgcolor: 'rgba(239,68,68,.12)',
          color: '#dc2626',
          fontWeight: 700,
        }}
      />

      <Chip
        size="small"
        label={`Total: ${total}`}
        sx={{
          bgcolor: '#e5e7eb',
          color: '#374151',
          fontWeight: 700,
        }}
      />
    </Box>
  );
}
