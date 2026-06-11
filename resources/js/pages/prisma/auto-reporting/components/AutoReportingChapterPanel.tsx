import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';

type Props = {
  chapter: string;
  items: any[];
  processingIds: Set<number>;
  onProcessChapter: (chapter: string) => void;
  renderItem: (item: any) => React.ReactNode;
};

export default function AutoReportingChapterPanel({
  chapter,
  items,
  processingIds,
  onProcessChapter,
  renderItem,
}: Props) {
  const [processingChapter, setProcessingChapter] = useState(false);
  const generatedCount = items.filter((item) => item.status === 'generated').length;
  const progress = items.length > 0 ? (generatedCount / items.length) * 100 : 0;

  const handleProcessChapter = async () => {
    setProcessingChapter(true);
    try {
      await onProcessChapter(chapter);
    } finally {
      setProcessingChapter(false);
    }
  };

  const anyItemProcessing = items.some((item) => processingIds.has(Number(item.id)));
  const isDisabled = processingChapter || anyItemProcessing;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          spacing={1.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {chapter}
              </Typography>
              <Chip
                size="small"
                label={`${generatedCount}/${items.length}`}
                color={generatedCount === items.length ? 'success' : 'default'}
              />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Generate AI per item atau seluruh chapter sekaligus.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            color="warning"
            onClick={handleProcessChapter}
            disabled={isDisabled}
            startIcon={isDisabled ? <CircularProgress size={16} /> : undefined}
          >
            {processingChapter ? 'Processing...' : `Generate All (${items.length} items)`}
          </Button>
        </Stack>

        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            color="success"
            sx={{ borderRadius: 1, height: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}% generated
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5}>{items.map((item) => renderItem(item))}</Stack>
      </CardContent>
    </Card>
  );
}
