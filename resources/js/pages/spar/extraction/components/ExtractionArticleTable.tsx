import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { ExtractionArticle } from '../types';

type Props = {
  articles: ExtractionArticle[];
  onOpenExtraction: (articleId: number) => void;
  onSynchronizePdf: () => void;
  onSynchronizeArticle: () => void;
  guideOpen?: boolean;
};

const headers = [
  'No',
  'Authors',
  'Year',
  'Title',
  'Journal',
  'Penggunaan AI',
  'Citation',
  'Journal Rank',
  'Text',
  'Novelty/Gap',
  'Status',
];

const escapeCsvValue = (value: string | number | boolean | null | undefined) => {
  const normalized = String(value ?? '').replace(/\r?\n/g, ' ');

  return /[",\n]/.test(normalized) ? `"${normalized.replace(/"/g, '""')}"` : normalized;
};

export default function ExtractionArticleTable({
  articles,
  onOpenExtraction,
  onSynchronizePdf,
  onSynchronizeArticle,
  guideOpen = false,
}: Props) {
  const [search, setSearch] = useState('');

  const filteredArticles = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return articles;

    return articles.filter((item) =>
      [item.title, item.authors, item.journal]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [articles, search]);

  const formatTextValue = (value: number) =>
    value > 0 ? `[${value}] kata` : '-';

  const buildRows = () =>
    filteredArticles.map((article, index) => [
      index + 1,
      article.authors,
      article.year,
      article.title,
      article.journal,
      article.aiUsage ? 'Ya' : 'Tidak',
      article.citation,
      article.quartile,
      formatTextValue(article.text),
      article.noveltyGap || '-',
      article.status,
    ]);

  const downloadBlob = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    const rows = buildRows();
    const tableText = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(tableText);
        return;
      } catch {
        // fallback below
      }
    }

    const textarea = document.createElement('textarea');
    textarea.value = tableText;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  };

  const handleExportExcel = () => {
    const rows = buildRows();
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Extraction');
    XLSX.writeFile(workbook, 'extraction-articles.xlsx');
  };

  const handleExportCsv = () => {
    const rows = buildRows();
    const csvContent = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\n');

    downloadBlob(csvContent, 'extraction-articles.csv', 'text/csv;charset=utf-8;');
  };

  const handleExportPdf = () => {
    const rows = buildRows();
    const htmlRows = rows
      .map(
        (row) =>
          `<tr>${row
            .map((value) => `<td>${String(value ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>`)
            .join('')}</tr>`,
      )
      .join('');

    const printWindow = window.open('', '_blank', 'width=1200,height=800');

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
      <html>
        <head>
          <title>Extraction Articles</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h2 { margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h2>Extraction - Path & Item</h2>
          <table>
            <thead>
              <tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr>
            </thead>
            <tbody>${htmlRows}</tbody>
          </table>
        </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  const exportActions = [
    { label: 'Copy', onClick: handleCopy },
    { label: 'Excel', onClick: handleExportExcel },
    { label: 'PDF', onClick: handleExportPdf },
    { label: 'CSV', onClick: handleExportCsv },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 30px rgba(15,23,42,.06)',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
            Extraction - Path & Item
          </Typography>

          <Typography sx={{ mt: 0.25, fontSize: 12, color: '#64748b' }}>
            Ekstrak informasi artikel yang sudah lolos
            proses retrieval.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          {exportActions.map((item) => (
            <Button
              key={item.label}
              size="small"
              variant="outlined"
              onClick={item.onClick}
              sx={{
                minWidth: 56,
                borderRadius: 2,
                fontSize: 11,
                textTransform: 'none',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <TextField
          size="small"
          placeholder="Cari artikel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 260,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f8fafc',
            },
            '& .MuiInputBase-input': {
              fontSize: 12,
            },
          }}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          px: 2,
          pb: 2,

          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: 999,
          },
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            minWidth: 980,
            '& .MuiTableCell-root': {
              fontSize: 12,
              borderBottom: '1px solid #eef2f7',
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              bgcolor: '#f8fafc',
              fontWeight: 900,
              color: '#475569',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>No</TableCell>
              <TableCell>Authors</TableCell>
              <TableCell>Year</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Journal</TableCell>
              <TableCell>Penggunaan AI</TableCell>
              <TableCell>Citation</TableCell>
              <TableCell>Journal Rank</TableCell>
              <TableCell>Text</TableCell>
              <TableCell>Novelty/Gap</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Act</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredArticles.map((article, index) => (
              <TableRow key={article.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell sx={{ maxWidth: 180 }}>{article.authors}</TableCell>
                <TableCell>{article.year}</TableCell>
                <TableCell sx={{ minWidth: 240, maxWidth: 280 }}>{article.title}</TableCell>
                <TableCell sx={{ maxWidth: 160 }}>{article.journal}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={article.aiUsage ? 'Ya' : 'Tidak'}
                    color={article.aiUsage ? 'primary' : 'error'}
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>{article.citation}</TableCell>

                <TableCell>
                  <Chip size="small" label={article.quartile} color="success" />
                </TableCell>

                <TableCell>{formatTextValue(article.text)}</TableCell>

                <TableCell sx={{ maxWidth: 180, width: 180 }}>
                  <Box
                    component="span"
                    title={article.noveltyGap || undefined}
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: 160,
                      cursor: article.noveltyGap ? 'help' : 'default',
                    }}
                  >
                    {article.noveltyGap || '-'}
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={article.status}
                    color={
                      article.status === 'extracted' ? 'success' : 'warning'
                    }
                  />
                </TableCell>

                <TableCell align="center">
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => onOpenExtraction(article.id)}
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
