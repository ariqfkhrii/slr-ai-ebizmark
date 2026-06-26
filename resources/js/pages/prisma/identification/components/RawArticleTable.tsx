import TableBottom from '@/components/table/TableBottom';
import {
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getFilteredArticles } from '../hooks/useIdentification';
import { RawArticle } from '../types';

type Props = {
  keywordId: number;
  researchPlanId: number;
  refreshTrigger?: number;
};

export default function RawArticleTable({
  keywordId,
  researchPlanId,
  refreshTrigger,
}: Props) {
  const [articles, setArticles] = useState<RawArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadArticles = async () => {
    setLoading(true);

    try {
      const response = await getFilteredArticles({
        keywordId,
        researchPlanId,
        page,
        size,
      });

      setArticles(response.data ?? []);
      setTotalItems(response.total ?? 0);
      setTotalPages(response.last_page ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [keywordId, page, size, refreshTrigger]);

  useEffect(() => {
    setPage(1);
  }, [keywordId]);

  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: 'auto',
          maxHeight: 'none',

          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },

          '&::-webkit-scrollbar-track': {
            background: '#f8fafc',
          },

          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            borderRadius: 999,
            border: '2px solid #f8fafc',
          },

          '&::-webkit-scrollbar-thumb:hover': {
            background: '#94a3b8',
          },
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f9fafb' }}>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>NO</TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>
                ARTIKEL
              </TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>
                TAHUN
              </TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>TIER</TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>DOI</TableCell>
              <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>LINK</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Belum ada metadata. Klik Fetch Metadata terlebih dahulu.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article, index) => (
                <TableRow key={index} hover>
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {index + 1}
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                      {article.title}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ fontSize: 12 }}>
                    {article.publish_year}
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={article.tier.toUpperCase()}
                      color={article.tier === 'q1' ? 'success' : 'primary'}
                      sx={{ fontSize: 11, height: 22 }}
                    />
                  </TableCell>

                  <TableCell sx={{ fontSize: 12 }}>{article.doi}</TableCell>
                  <TableCell>
                    <IconButton
                      component="a"
                      href={'#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                    >
                      <ExternalLink size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TableBottom
        page={page}
        size={size}
        totalItems={totalItems}
        totalPages={totalPages}
        onPageChange={setPage}
        onSizeChange={(newSize) => {
          setSize(newSize);
          setPage(1);
        }}
      />
    </>
  );
}
