'use client';

import { IconButton, Tooltip, Typography } from '@mui/material';
import { Lightbulb } from 'lucide-react';
import { useGuideContext } from './GuideContext';

export default function GuideToggle() {
  const { open, toggle } = useGuideContext();

  return (
    <Tooltip title={open ? 'Hide Guide' : 'Show Guide'}>
      <IconButton
        onClick={toggle}
        size="medium"
        sx={{
          position: 'absolute',
          top: 12,
          right: open ? 5 : 5,
          transition: 'right .25s ease',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 2,
          py: 1,
          zIndex: 1000,
          bgcolor: open ? 'primary.main' : 'background.paper',
          color: open ? 'primary.contrastText' : 'text.primary',
          border: '1px solid',
          borderColor: open ? 'primary.main' : 'divider',
          boxShadow: 2,
          borderRadius: 3,
          '&:hover': {
            bgcolor: open ? 'primary.dark' : 'action.hover',
          },
        }}
      >
        <Lightbulb size={18} />
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Panduan
        </Typography>
      </IconButton>
    </Tooltip>
  );
}
