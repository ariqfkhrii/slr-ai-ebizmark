'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Alert, Typography } from '@mui/material';

export default function UploadInfoAlert() {
  return (
    <Alert
      icon={<InfoOutlinedIcon />}
      severity="info"
      sx={{
        alignItems: 'center',
      }}
    >
      <Typography variant="body2">
        Upload file PDF beserta metadata artikel secara manual. File PDF dan
        metadata yang berhasil disimpan akan langsung masuk ke daftar{' '}
        <strong>Artikel Tersedia</strong>.
      </Typography>
    </Alert>
  );
}
