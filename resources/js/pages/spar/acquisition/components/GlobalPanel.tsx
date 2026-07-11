import { Box, Typography } from '@mui/material';

type Props = {
  keywordId: number;
  researchPlanId: number;
};

export default function GlobalPanel({ keywordId, researchPlanId }: Props) {
  return (
    <Box
      sx={{
        width: 720,
        borderLeft: 1,
        height: '100%',
        flexShrink: 0,
        borderColor: 'divider',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 800,
            color: '#14b8a6',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Guide
        </Typography>

        <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
          Page Guide
        </Typography>
      </Box>
    </Box>
  );
}
