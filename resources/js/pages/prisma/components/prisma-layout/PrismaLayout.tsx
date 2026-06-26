'use client';

import { Box } from '@mui/material';
import { ReactNode } from 'react';

import GuidePanel from './GuidePanel';
import GuideToggle from './GuideToggle';

type Props = {
  children: ReactNode;
};

export function PrismaLayout({ children }: Props) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
      <GuideToggle />
      <GuidePanel />
    </Box>
  );
}
