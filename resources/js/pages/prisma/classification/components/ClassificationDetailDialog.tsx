import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { ClassificationArticle, ClassificationCategory } from '../types';

type Props = {
  open: boolean;
  article: ClassificationArticle | null;
  activeCategories: ClassificationCategory[];
  onClose: () => void;
  onUpdateResearchMethod: (articleId: number, value: string) => void;
  onUpdateClassification: (
    articleId: number,
    categoryId: number,
    value: string,
  ) => void;
};

export default function ClassificationDetailDialog({
  open,
  article,
  activeCategories,
  onClose,
  onUpdateResearchMethod,
  onUpdateClassification,
}: Props) {
  if (!article) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(15,23,42,.28)',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
        <Box
          sx={{
            p: 2.5,
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 950,
                lineHeight: 1.25,
                color: '#0f172a',
              }}
            >
              {article.title}
            </Typography>

            <Box sx={{ mt: 1.25, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip size="small" label={article.authors} />
              <Chip size="small" label={article.country} />
              <Chip size="small" label={article.publishYear ?? '-'} />
            </Box>
          </Box>

          <IconButton
            onClick={onClose}
            sx={{
              bgcolor: '#fee2e2',
              color: '#dc2626',
              '&:hover': {
                bgcolor: '#fecaca',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            p: 2.5,
            maxHeight: '72vh',
            overflowY: 'auto',

            '&::-webkit-scrollbar': {
              width: 8,
            },
            '&::-webkit-scrollbar-track': {
              background: '#f8fafc',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#cbd5e1',
              borderRadius: 999,
              border: '2px solid #f8fafc',
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 4,
              bgcolor: '#ffffff',
              border: '1px solid #e5e7eb',
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 900, mb: 1 }}>
              Abstract / Result
            </Typography>

            <Typography
              sx={{ fontSize: 13, lineHeight: 1.7, color: '#475569' }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi
              magna augue, pellentesque ac mollis quis, cursus non augue.
              Vivamus pharetra metus at est iaculis fringilla. In pellentesque
              sapien, non ultricies nunc.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 4,
              bgcolor: '#ffffff',
              border: '1px solid #e5e7eb',
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 900, mb: 1.5 }}>
              Research Method
            </Typography>

            <TextField
              fullWidth
              size="small"
              value={article.researchMethod}
              onChange={(e) =>
                onUpdateResearchMethod(article.id, e.target.value)
              }
              placeholder="Enter research method..."
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 2,
            }}
          >
            {activeCategories.map((category) => (
              <Box
                key={category.id}
                sx={{
                  p: 2,
                  borderRadius: 4,
                  bgcolor: '#ffffff',
                  border: '1px solid #e5e7eb',
                }}
              >
                <Typography sx={{ fontSize: 15, fontWeight: 900, mb: 1 }}>
                  {category.name}
                </Typography>

                <TextField
                  fullWidth
                  multiline
                  minRows={4}
                  value={article.classifications[category.id] ?? ''}
                  onChange={(e) =>
                    onUpdateClassification(
                      article.id,
                      category.id,
                      e.target.value,
                    )
                  }
                  placeholder={`Fill ${category.name.toLowerCase()}...`}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      alignItems: 'flex-start',
                    },
                    '& .MuiInputBase-input': {
                      fontSize: 13,
                      lineHeight: 1.6,
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            bgcolor: '#ffffff',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 800 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveIcon fontSize="small" />}
            onClick={onClose}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 900 }}
          >
            Save Classification
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
