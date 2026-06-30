'use client';

import { Box, Typography } from '@mui/material';

type Props = {
  number: number;
  title: string;
  description: string;
};

export default function GuideStep({ number, title, description }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        mb: 2,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          mr: 2,
          flexShrink: 0,
        }}
      >
        {number}
      </Box>

      <Box>
        <Typography sx={{ fontWeight: 700 }}>{title}</Typography>

        <Typography sx={{ fontSize: 13 }} color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Box>
  );
}
