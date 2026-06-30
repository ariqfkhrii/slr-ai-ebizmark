'use client';

import { Box, Typography } from '@mui/material';
import { Info } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function GuideInfo({ children }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        p: 2,
        bgcolor: '#EFF6FF',
        borderRadius: 2,
        border: '1px solid #BFDBFE',
      }}
    >
      <Info size={18} color="#2563EB" />

      <Typography sx={{ fontSize: 13 }}>{children}</Typography>
    </Box>
  );
}
