'use client';

import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

interface PdfPreviewProps {
  file: File | null;
}

export default function PdfPreview({ file }: PdfPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file) {
    return (
      <Paper
        variant="outlined"
        sx={{
          height: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <DescriptionOutlinedIcon
            sx={{
              fontSize: 64,
              color: 'text.secondary',
            }}
          />

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
            }}
          >
            PDF belum dipilih.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        height: 700,
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Box
        component="iframe"
        src={previewUrl ?? undefined}
        title="PDF Preview"
        sx={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
      />
    </Paper>
  );
}
