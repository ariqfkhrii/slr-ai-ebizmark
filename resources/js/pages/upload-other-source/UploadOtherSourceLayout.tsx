'use client';

import { Box } from '@mui/material';
import { ReactNode } from 'react';

import GuidePanel from '@/pages/spar/components/spar-layout/GuidePanel';
import GuideToggle from '@/pages/spar/components/spar-layout/GuideToggle';

type Props = {
  children: ReactNode;
};

export default function UploadOtherSourceLayout({ children }: Props) {
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
          minHeight: 0,
          overflow: 'auto',
        }}
      >
        {children}
      </Box>

      <GuideToggle />
      <GuidePanel />
    </Box>
  );
}
