import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  onSave: (articleId: number, next: Partial<ExtractionArticle>) => Promise<boolean>;
  saving?: boolean;
};

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
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{article.title}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2">
          {article.authors} {article.publishYear ? `(${article.publishYear})` : ''}
        </Typography>
        <br />
        {(
          [
            ['Abstract', 'abstract'],
            ['Introduction', 'introduction'],
            ['Result', 'result'],
            ['Conclusion', 'conclusion'],
            ['Recommendation', 'recommendation'],
            ['Novelty Gap', 'noveltyGap'],
            ['Limitation', 'limitation'],
            ['Future Research', 'futureResearch'],
          ] as const
        ).map(([label, key]) => (
          <Box key={key}>
            <Typography variant="subtitle2" gutterBottom>
              {label}
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={4}
              value={isEdit ? (draft[key] ?? '') : article[key]}
              onChange={(e) => {
                if (!isEdit) return;
                setDraft((prev) => ({
                  ...prev,
                  [key]: e.target.value,
                }));
              }}
              placeholder={`Enter ${label.toLowerCase()}...`}
              InputProps={{ readOnly: !isEdit }}
            />
            <br />
            <br />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
        {isEdit && (
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : 'Save'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
