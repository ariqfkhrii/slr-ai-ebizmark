'use client';

import { Box, Divider, Typography } from '@mui/material';
import { isValidElement, ReactNode } from 'react';
import { useGuideContext } from './GuideContext';

const GUIDE_WIDTH = 360;

export default function GuidePanel() {
  const { open, title, content } = useGuideContext();

  const renderContent = () => {
    if (!content) return null;

    if (
      isValidElement(content) ||
      typeof content === 'string' ||
      typeof content === 'number'
    ) {
      return content;
    }

    if (typeof content === 'function') {
      const Component = content as () => ReactNode;
      return <Component />;
    }

    return null;
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: open ? GUIDE_WIDTH : 0,
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'width .25s ease',
        borderLeft: open ? '1px solid #E5E7EB' : 'none',
        bgcolor: '#fff',
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: GUIDE_WIDTH,
          height: '100%',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            sx={{
              fontSize: 12,
              color: '#14B8A6',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Panduan
          </Typography>

          <Typography
            variant="h6"
            sx={{
              mt: 0.5,
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>{renderContent()}</Box>
      </Box>
    </Box>
  );
}
