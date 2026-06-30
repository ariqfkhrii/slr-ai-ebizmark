import { router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import {
  BookOpen,
  Download,
  ExternalLink,
  InfoIcon,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import ArticlePanel from './components/ArticlePanel';
import MetricCard from './components/MetricCard';

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

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const articles = useMemo<ArticleItem[]>(
    () =>
      filteredArticles.map((item) => ({
        id: item.filtered_article_id,
        title: item.raw_article?.title ?? 'Untitled',
        authors: item.raw_article?.authors ?? 'Unknown',
        doi: item.raw_article?.doi ?? '-',
        source: item.raw_article?.tier ?? 'Unknown',
        year: item.raw_article?.publish_year ?? null,
        retrieved: Boolean(item.retrieved),
        note: `Status: ${item.article_status}`,
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

  const handleAutoFetchAll = () => {
    router.post(
      `/research-plans/${researchPlan.research_plan_id}/auto-fetch-all`,
      {},
      { preserveScroll: true },
    );
  };

  const handleShortcut = (value: { preLink: string; postLink: string }) => {
    setPreLink(value.preLink);
    setPostLink(value.postLink);
  };

  const handleUpload = () => {
    if (!pdfFile) return;

    const formData = new FormData();

    formData.append('pdf', pdfFile);

    formData.append('research_plan_id', String(researchPlan.research_plan_id));

    router.post('/filtered-articles/check-doi', formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => setPdfFile(null),
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('File harus PDF');
      return;
    }

    setPdfFile(file);
  };

  return (
    <Box sx={{ p: 2.25 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1.1fr 0.75fr',
          gap: 2.25,
          minHeight: 'calc(100vh - 170px)',
        }}
      >
        {/* LEFT */}
        <Box
          sx={{
            gridColumn: 'span 2',
            display: 'flex',
            flexDirection: 'column',
            gap: 2.25,
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
              title="Record Retrieved"
              value={retrievedArticles.length}
              tone="green"
              icon={<Download size={18} />}
            />

            <MetricCard
              title="Record not Retrieved"
              value={notRetrievedArticles.length}
              tone="red"
              icon={<ShieldCheck size={18} />}
            />

            <MetricCard
              title="Total Record"
              value={articles.length}
              tone="indigo"
              icon={<BookOpen size={18} />}
            />
          </Box>

          {/* PANELS */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flex: 1,
              minHeight: 0,
            }}
          >
            <ArticlePanel
              title="NOT RETRIEVED"
              count={notRetrievedArticles.length}
              articles={notRetrievedArticles}
              accent="#ef4444"
              emptyText="Semua retrieved"
              preLink={preLink}
              postLink={postLink}
              onToggleRetrieved={updateRetrievalStatus}
              onAutoFetch={(id) => id}
            />

            <ArticlePanel
              title="RETRIEVED"
              count={retrievedArticles.length}
              articles={retrievedArticles}
              accent="#22c55e"
              emptyText="Belum ada"
              preLink={preLink}
              postLink={postLink}
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
          {/* AUTO-FETCH PDF */}
          <Typography
            sx={{
              fontWeight: 900,
              textAlign: 'center',
            }}
          >
            UNDUH PDF OTOMATIS
          </Typography>

          {/* Disclaimer notice */}
          <Alert
            severity="info"
            icon={<InfoIcon size={16} />}
            sx={{
              fontSize: 11.5,
              lineHeight: 1.5,
              '& .MuiAlert-message': { p: 0 },
            }}
          >
            Fitur unduh otomatis hanya dapat memperoleh artikel yang bersifat
            publik (Open Access). Untuk artikel non-publik, silakan gunakan
            tombol upload manual.
          </Alert>

          <Button
            variant="contained"
            fullWidth
            startIcon={<Sparkles size={14} />}
            disabled={notRetrievedArticles.length === 0}
            onClick={handleAutoFetchAll}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: 'white',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(168, 85, 247, 0.4)',
                transform: 'translateY(-1px)',
              },
              '&.Mui-disabled': {
                background: '#e0e0e0',
                color: '#a6a6a6',
                boxShadow: 'none',
              }
            }}
          >
            Unduh PDF Otomatis
          </Button>

          <Divider />

          {/* PDF */}
          <Typography
            sx={{
              fontWeight: 900,
              textAlign: 'center',
            }}
          >
            UPLOAD PDF
          </Typography>

          <Paper
            variant="outlined"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            sx={{
              p: 3,
              borderRadius: 3,
              textAlign: 'center',
              borderStyle: 'dashed',
              borderColor: isDragging ? 'primary.main' : 'divider',
              bgcolor: isDragging ? 'action.hover' : 'transparent',
              cursor: 'pointer',
            }}
          >
            <Typography sx={{ mt: 1, fontWeight: 700 }}>
              Drag & drop PDF di sini
            </Typography>

            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
              atau klik untuk pilih file
            </Typography>

            <Button component="label" size="small" sx={{ mt: 1 }}>
              Pilih PDF
              <input
                hidden
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              />
            </Button>
          </Paper>

          <Typography
            sx={{
              fontSize: 12,
              color: 'text.secondary',
            }}
          >
            {pdfFile ? pdfFile.name : 'Belum ada file'}
          </Typography>

          <Button
            variant="contained"
            disabled={!pdfFile}
            onClick={handleUpload}
            startIcon={<Search size={14} />}
          >
            Upload & Scan DOI
          </Button>

          <Divider />

          {/* LINK */}
          <Typography
            sx={{
              fontWeight: 900,
              textAlign: 'center',
            }}
          >
            CONFIGURE LINK
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
