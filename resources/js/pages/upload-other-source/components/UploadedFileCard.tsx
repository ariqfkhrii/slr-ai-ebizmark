'use client';

import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

interface UploadedFileCardProps {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}

export default function UploadedFileCard({
  file,
  onRemove,
  disabled,
}: UploadedFileCardProps) {
  const fileSize = `${(file.size / 1024).toFixed(1)} KB`;

  return (
    <Paper
      variant="outlined"
      sx={{
        minHeight: 320,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <DescriptionOutlinedIcon
          sx={{
            fontSize: 72,
            color: 'error.main',
          }}
        />

        <Box
          sx={{
            textAlign: 'center',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
            }}
          >
            {file.name}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            {fileSize}
          </Typography>
        </Box>

        <Chip
          clickable
          color="error"
          disabled={disabled}
          label="Hapus"
          icon={<CloseIcon />}
          onClick={onRemove}
        />
      </Stack>
    </Paper>
  );
}
