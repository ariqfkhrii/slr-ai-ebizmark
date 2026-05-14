import { Head } from '@inertiajs/react';
import { Box, Paper, Typography } from '@mui/material';
import PrismaStepper from './components/PrismaStepper';
import Identification from './identification';

export default function Prisma() {
  return (
    <>
      <Head title="PRISMA" />

      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={2}
          sx={{ px: 2, py: 1.5, borderRadius: 0, flexShrink: 0 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            PRISMA
          </Typography>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            borderRadius: 0,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            minHeight: 58,
          }}
        >
          {/* TOPIK AREA */}
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              px: 2,
              py: 1.5,
              borderRight: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Topik
            </Typography>
          </Box>

          {/* STEPPER AREA */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              px: 3,
              py: 1.5,
            }}
          >
            <PrismaStepper activeStep={0} />
          </Box>
        </Paper>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <Identification />
        </Box>
      </Box>
    </>
  );
}
