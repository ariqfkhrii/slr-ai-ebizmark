import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { ExtractionArticle } from '../types';

type Props = {
  open: boolean;
  mode: 'detail' | 'edit';
  article: ExtractionArticle | null;
  onClose: () => void;
  onSave: (
    articleId: number,
    next: Partial<ExtractionArticle>,
  ) => Promise<boolean>;
  saving?: boolean;
};

const sections = [
  ['Abstract', 'abstract'],
  ['Introduction', 'introduction'],
  ['Result', 'result'],
  ['Conclusion', 'conclusion'],
  ['Recommendation', 'recommendation'],
  ['Novelty Gap', 'noveltyGap'],
  ['Limitation', 'limitation'],
  ['Future Research', 'futureResearch'],
] as const;

export default function ExtractionDetailDialog({
  open,
  mode,
  article,
  onClose,
  onSave,
  saving = false,
}: Props) {
  const [draft, setDraft] = useState<Partial<ExtractionArticle>>({});

  useEffect(() => {
    if (!article) return;

    setDraft({
      abstract: article.abstract,
      introduction: article.introduction,
      result: article.result,
      conclusion: article.conclusion,
      recommendation: article.recommendation,
      noveltyGap: article.noveltyGap,
      limitation: article.limitation,
      futureResearch: article.futureResearch,
    });
  }, [article]);

  if (!article) return null;

  const isEdit = mode === 'edit';

  const handleSave = async () => {
    const ok = await onSave(article.id, draft);

    if (ok) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Stack spacing={1}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {article.title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {isEdit ? 'Edit hasil ekstraksi AI' : 'Review hasil ekstraksi AI'}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'grey.50',
          }}
        >
          <Stack spacing={0.5}>
            <Typography sx={{ fontWeight: 600 }}>{article.title}</Typography>

            <Typography variant="body2" color="text.secondary">
              {article.authors}
            </Typography>

            {article.publishYear && (
              <Typography variant="body2" color="text.secondary">
                Published {article.publishYear}
              </Typography>
            )}
          </Stack>
        </Paper>

        <Stack spacing={3}>
          {sections.map(([label, key]) => (
            <Box key={key}>
              <Typography
                sx={{ fontWeight: 600 }}
                variant="subtitle1"
                gutterBottom
              >
                {label}
              </Typography>

              <TextField
                fullWidth
                multiline
                minRows={5}
                value={
                  isEdit
                    ? (draft[key as keyof ExtractionArticle] ?? '')
                    : (article[key as keyof ExtractionArticle] ?? '')
                }
                onChange={(e) => {
                  if (!isEdit) return;

                  setDraft((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }));
                }}
                placeholder={`No ${label.toLowerCase()} available`}
                slotProps={{
                  input: {
                    readOnly: !isEdit,
                  },
                }}
              />

              <Divider sx={{ mt: 3 }} />
            </Box>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
        }}
      >
        <Button variant="outlined" onClick={onClose} disabled={saving}>
          Close
        </Button>

        {isEdit && (
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              'Save Changes'
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
