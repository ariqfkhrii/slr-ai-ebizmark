import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { ExtractionArticle } from '../types';

type Props = {
  open: boolean;
  mode: 'detail' | 'edit';
  article: ExtractionArticle | null;
  onClose: () => void;
  onSave: (articleId: number, next: Partial<ExtractionArticle>) => void;
};

export default function ExtractionDetailDialog({
  open,
  mode,
  article,
  onClose,
  onSave,
}: Props) {
  if (!article) return null;

  const isEdit = mode === 'edit';

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
              value={article[key]}
              onChange={(e) =>
                onSave(article.id, { [key]: e.target.value } as Partial<ExtractionArticle>)
              }
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
          <Button variant="contained" onClick={onClose}>
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
