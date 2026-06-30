'use client';

import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
};

export default function GuideSection({ title, children }: Props) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          mb: 1,
        }}
      >
        {title}
      </Typography>

      {children}
    </Box>
  );
}
