import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { Box, Paper, Typography } from '@mui/material';

type Props = {
  pdfUrl?: string;
};

export default function PdfPreviewPanel({ pdfUrl }: Props) {
  return (
    <Box
      sx={{
        p: 2,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PictureAsPdfIcon sx={{ color: '#dc2626' }} />

        <Box>
          <Typography sx={{ fontWeight: 900 }}>PDF Preview</Typography>
          <Typography sx={{ fontSize: 12, color: '#64748b' }}>
            Gunakan panel ini sebagai referensi saat mengisi form extraction.
          </Typography>
        </Box>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          borderRadius: 3,
          bgcolor: '#ffffff',
        }}
      >
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            style={{
              width: '100%',
              height: '100%',
              border: 0,
            }}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontWeight: 700,
            }}
          >
            PDF belum tersedia
          </Box>
        )}
      </Paper>
    </Box>
  );
}
