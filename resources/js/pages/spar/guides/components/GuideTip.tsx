'use client';

import { Box, Typography } from '@mui/material';
import { Lightbulb } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function GuideTip({ children }: Props) {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        bgcolor: '#FEFCE8',
        borderRadius: 2,
        border: '1px solid #FDE68A',
        display: 'flex',
        gap: 1,
      }}
    >
      <Lightbulb size={18} color="#CA8A04" />

      <Typography sx={{ fontSize: 13 }}>{children}</Typography>
    </Box>
  );
}
