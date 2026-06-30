import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';

type Props = {
  item: any;
  processing: boolean;
  onProcess: (item: any) => void;
  onRegenerate: (item: any) => void;
  onOpenDetail: (item: any) => void;
};

export default function AutoReportingItemCard({
  item,
  processing,
  onProcess,
  onRegenerate,
  onOpenDetail,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasGeneratedContent = Boolean((item.generated_content ?? '').trim());

  return (
    <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
      <CardContent sx={{ py: 1.75 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {item.order_no}. {item.title}
              </Typography>
              <Chip
                size="small"
                label={item.status === 'generated' ? 'Generated' : 'Draft'}
                color={item.status === 'generated' ? 'success' : 'default'}
              />
              {item.word_count > 0 && (
                <Chip size="small" label={`${item.word_count} kata`} variant="outlined" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {item.detail}
            </Typography>
          </Box>

          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }} sx={{ flexShrink: 0 }}>
            {/* Generate AI – tampil jika belum ada konten */}
            {!hasGeneratedContent && (
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={() => onProcess(item)}
                disabled={processing}
                startIcon={processing ? <CircularProgress size={14} color="inherit" /> : undefined}
              >
                {processing ? 'Generating...' : 'Generate AI'}
              </Button>
            )}

            {/* View/Edit – selalu tersedia */}
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onOpenDetail(item)}
                disabled={processing}
              >
                View / Edit
              </Button>

              {/* Regenerate – hanya jika sudah ada konten */}
              {hasGeneratedContent && (
                <Tooltip title="Generate ulang dengan AI">
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      onClick={() => onRegenerate(item)}
                      disabled={processing}
                    >
                      {processing ? <CircularProgress size={14} /> : 'Regenerate'}
                    </Button>
                  </span>
                </Tooltip>
              )}
            </Stack>

            {hasGeneratedContent && (
              <Button
                size="small"
                variant="text"
                onClick={() => setExpanded(!expanded)}
                sx={{ fontSize: 11 }}
              >
                {expanded ? 'Sembunyikan ▲' : 'Lihat preview ▼'}
              </Button>
            )}
          </Stack>
        </Stack>

        {processing && (
          <Box sx={{ mt: 1.5 }}>
            <LinearProgress color="warning" />
            <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block' }}>
              Gemini 2.5 Flash sedang menganalisis data...
            </Typography>
          </Box>
        )}

        <Collapse in={expanded && hasGeneratedContent}>
          <Divider sx={{ my: 1.5 }} />
          <Box
            sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 0.75 }}
            >
              Preview hasil AI
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}
            >
              {item.generated_content}
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
}
