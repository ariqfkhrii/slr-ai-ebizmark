import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import { Download, InfoIcon, Link2, ShieldCheck } from 'lucide-react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import ArticlePanel from './components/ArticlePanel';
import MetricCard from './components/MetricCard';

import { useGuide } from '../../components/spar-layout';
import RetrievalGuide from '../../guides/RetrievalGuide';
import type { ArticleItem, PrismaPageProps } from './types';

const shortcutPresets = [
  {
    label: 'DOI',
    preLink: 'https://doi.org/',
    postLink: '',
  },
  {
    label: 'Crossref',
    preLink: 'https://search.crossref.org/search/works?q=',
    postLink: '&from_ui=yes',
  },
];

function buildArticleLink(preLink: string, doi: string, postLink: string) {
  return `${preLink}${encodeURIComponent(doi)}${postLink}`;
}

export default function Retrieval({
  researchPlan,
  filteredArticles,
}: PrismaPageProps) {
  const [preLink, setPreLink] = useState('https://doi.org/');

  const [postLink, setPostLink] = useState('');
  const guideContent = useMemo(() => <RetrievalGuide />, []);
  const { guideOpen } = useGuide({
    title: 'Retrieval',
    content: guideContent,
  });
  const articles = useMemo<ArticleItem[]>(
    () =>
      filteredArticles
        .filter((item) => Boolean(item.included))
        .map((item) => ({
          id: item.filtered_article_id,
          title: item.raw_article?.title ?? 'Untitled',
          authors: item.raw_article?.authors ?? 'Unknown',
          doi: item.raw_article?.doi ?? '-',
          source: item.raw_article?.tier ?? 'Unknown',
          year: item.raw_article?.publish_year ?? null,
          retrieved: Boolean(item.retrieved),
          note: item.included ? 'Included' : 'Not Included',
          article_status: item.article_status,
        })),
    [filteredArticles],
  );

  const retrievedArticles = articles.filter((a) => a.retrieved);

  const notRetrievedArticles = articles.filter((a) => !a.retrieved);

  const updateRetrievalStatus = (articleId: number, nextRetrieved: boolean) => {
    router.put(
      `/filtered-articles/${articleId}/retrieval`,
      {
        retrieved: nextRetrieved ? 1 : 0,
      },
      {
        preserveScroll: true,
      },
    );
  };

  const handleShortcut = (value: { preLink: string; postLink: string }) => {
    setPreLink(value.preLink);
    setPostLink(value.postLink);
  };

  return (
    <Box sx={{ p: 2.25 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1.1fr 0.75fr',
          gap: 2.25,
          minHeight: 'calc(100vh - 170px)',
          alignItems: 'stretch',
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            gridColumn: 'span 2',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.25,
            minHeight: 0,
            height: '100%',
          }}
        >
          {/* METRICS */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 2,
            }}
          >
            <MetricCard
              title="Artikel Tersedia"
              value={retrievedArticles.length}
              tone="green"
              icon={<Download size={18} />}
            />

            <MetricCard
              title="Artikel Tidak Tersedia"
              value={notRetrievedArticles.length}
              tone="red"
              icon={<ShieldCheck size={18} />}
            />

            <Alert
              severity="info"
              icon={<InfoIcon size={16} />}
              sx={{
                fontSize: 12.5,
                lineHeight: 1.5,
                '& .MuiAlert-message': { p: 0 },
              }}
            >
              Untuk artikel yang belum tersedia, Anda bisa mencoba unduh PDF
              langsung dari kartu artikel masing-masing. Untuk artikel
              non-publik, gunakan opsi upload manual.
            </Alert>
          </Box>

          {/* PANELS */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flex: 1,
              minHeight: 0,
              alignItems: 'stretch',
            }}
          >
            <ArticlePanel
              title="ARTIKEL TERSEDIA"
              count={retrievedArticles.length}
              articles={retrievedArticles}
              accent="#22c55e"
              emptyText="Tidak ada data"
              preLink={preLink}
              postLink={postLink}
              researchPlanId={researchPlan.research_plan_id}
              onToggleRetrieved={updateRetrievalStatus}
            />

            <ArticlePanel
              title="ARTIKEL TIDAK TERSEDIA"
              count={notRetrievedArticles.length}
              articles={notRetrievedArticles}
              accent="#ef4444"
              emptyText="Tidak ada data"
              preLink={preLink}
              postLink={postLink}
              researchPlanId={researchPlan.research_plan_id}
              onToggleRetrieved={updateRetrievalStatus}
            />
          </Box>
        </Box>

        {/* RIGHT SIDEBAR */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* LINK */}
          <Typography
            sx={{
              fontWeight: 900,
              textAlign: 'center',
            }}
          >
            ATUR TAUTAN
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {shortcutPresets.map((preset) => (
              <Button
                key={preset.label}
                size="small"
                variant={preLink === preset.preLink ? 'contained' : 'outlined'}
                onClick={() => handleShortcut(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </Box>

          <TextField
            size="small"
            label="Pre-link"
            value={preLink}
            onChange={(e) => setPreLink(e.target.value)}
          />

          <TextField
            size="small"
            label="Post-link"
            value={postLink}
            onChange={(e) => setPostLink(e.target.value)}
          />

          <Paper
            variant="outlined"
            sx={{
              p: 1,
              fontSize: 12,
            }}
          >
            {buildArticleLink(
              preLink,
              articles[0]?.doi ?? '10.0000/example',
              postLink,
            )}
          </Paper>

          <Button variant="contained" fullWidth endIcon={<Link2 size={14} />}>
            Simpan
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
