import { Box, Button, Chip, Divider, Tooltip, Typography } from '@mui/material';
import { Check, ExternalLink, FileText, X } from 'lucide-react';
import { FilteredArticle } from '../types';

type Props = {
  item: FilteredArticle;
  onInclude: () => void;
  onExclude: () => void;
};

export default function ScreeningArticleCard({
  item,
  onInclude,
  onExclude,
}: Props) {
  const article = item.raw_article;

  const isIncluded = item.included === true;
  const isExcluded = item.included === false;
  const isPending = item.included === null;

  const statusConfig = isIncluded
    ? {
        label: 'Included',
        bg: '#ecfdf5',
        border: '#86efac',
        accent: '#22c55e',
        color: '#15803d',
      }
    : isExcluded
      ? {
          label: 'Excluded',
          bg: '#fef2f2',
          border: '#fca5a5',
          accent: '#ef4444',
          color: '#dc2626',
        }
      : {
          label: 'Pending',
          bg: '#ffffff',
          border: '#e5e7eb',
          accent: '#f59e0b',
          color: '#b45309',
        };

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        border: 1,
        borderColor: statusConfig.border,
        bgcolor: statusConfig.bg,
        borderRadius: 3,
        p: 2,
        minHeight: 250,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08)',
        transition: 'all .18s ease',

        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.10)',
        },

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 5,
          height: '100%',
          bgcolor: statusConfig.accent,
        },
      }}
    >
      <Box sx={{ pl: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                lineHeight: 1.35,
                color: '#0f172a',
              }}
            >
              {article?.title ?? '-'}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                gap: 0.75,
                flexWrap: 'wrap',
                mt: 1,
              }}
            >
              <Chip
                size="small"
                label={statusConfig?.label ?? '-'}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 800,
                  bgcolor: statusConfig.accent,
                  color: '#fff',
                }}
              />

              <Chip
                size="small"
                label={article?.tier ?? '-'}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                }}
              />

              <Chip
                size="small"
                label={`${article?.publish_year ?? '-'}`}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: '#f8fafc',
                  color: '#475569',
                }}
              />

              <Chip
                size="small"
                label={`${article?.citation_count ?? '-'} sitasi`}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: '#f8fafc',
                  color: '#475569',
                }}
              />
            </Box>
          </Box>

          <Tooltip title="Buka DOI">
            <Button
              component="a"
              href={'#'}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              variant="outlined"
              sx={{
                minWidth: 34,
                width: 34,
                height: 34,
                p: 0,
                borderRadius: 2,
                flexShrink: 0,
              }}
            >
              <ExternalLink size={16} />
            </Button>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <FileText size={15} style={{ marginTop: 2, flexShrink: 0 }} />

          <Typography
            sx={{
              fontSize: 12,
              lineHeight: 1.65,
              color: '#334155',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article?.abstract ?? '-'}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: 11,
            color: '#64748b',
            mt: 1.25,
            wordBreak: 'break-word',
          }}
        >
          DOI: {article?.doi ?? '-'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
            mt: 1.75,
          }}
        >
          {!isExcluded && (
            <Button
              size="small"
              variant={isPending ? 'outlined' : 'contained'}
              color="error"
              startIcon={<X size={14} />}
              onClick={onExclude}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 800,
                px: 1.5,
              }}
            >
              Exclude
            </Button>
          )}

          {!isIncluded && (
            <Button
              size="small"
              variant={isPending ? 'contained' : 'outlined'}
              color="success"
              startIcon={<Check size={14} />}
              onClick={onInclude}
              sx={{
                textTransform: 'none',
                fontSize: 12,
                fontWeight: 800,
                px: 1.5,
              }}
            >
              Include
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
