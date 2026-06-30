import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';
import { ExtractionArticle, ExtractionFormValues } from '../types';
import ExtractionForm from './ExtractionForm';
import PdfPreviewPanel from './PdfPreviewPanel';

type Props = {
  open: boolean;
  article: ExtractionArticle | null;
  values: ExtractionFormValues;
  onClose: () => void;
  onSave: () => void;
  onChange: <K extends keyof ExtractionFormValues>(
    key: K,
    value: ExtractionFormValues[K],
  ) => void;
};

export default function ExtractionWorkspace({
  open,
  article,
  values,
  onClose,
  onSave,
  onChange,
}: Props) {
  if (!article) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            width: '94vw',
            height: '90vh',
            borderRadius: 4,
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 900 }}>
              Ekstraksi Artikel
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: 12,
                color: '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {article.authors} ({article.year}). {article.title}
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon fontSize="small" />}
            onClick={onSave}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800 }}
          >
            Save Extraction
          </Button>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(380px, .85fr)',
            bgcolor: '#f8fafc',
          }}
        >
          <ExtractionForm values={values} onChange={onChange} />

          <PdfPreviewPanel pdfUrl={article.pdfUrl} />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
