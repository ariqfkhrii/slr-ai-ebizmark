import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

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
  const generatedCount = items.filter(
    (item) => item.status === 'generated',
  ).length;
  const progress = items.length > 0 ? (generatedCount / items.length) * 100 : 0;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          spacing={1.5}
          sx={{
            flexDirection: {
              xs: 'column',
              md: 'row',
            },
            justifyContent: 'space-between',
            alignItems: {
              xs: 'flex-start',
              md: 'center',
            },
          }}
        >
          <Box>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}
            >
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
              Seluruh item diselesaikan secara manual dan dapat diedit satu per
              satu.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ mt: 1.5 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            color="success"
            sx={{ borderRadius: 1, height: 4 }}
          />
          <Typography variant="caption" color="text.secondary">
            {Math.round(progress)}% selesai
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5}>{items.map((item) => renderItem(item))}</Stack>
      </CardContent>
    </Card>
  );
}
