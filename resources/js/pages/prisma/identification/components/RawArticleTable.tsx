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
import { RawArticle } from '../types';

type Props = {
  articles: RawArticle[];
};

export default function RawArticleTable({ articles }: Props) {
  {
    return (
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
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
                <TableRow key={article.article_id} hover>
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {index + 1}
                  </TableCell>

                  <TableCell>
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                      {article.title}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                      ISSN: {article.issn}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ fontSize: 12 }}>
                    {article.publish_year}
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={article.tier}
                      color={article.tier === 'Q1' ? 'success' : 'primary'}
                      sx={{ fontSize: 11, height: 22 }}
                    />
                  </TableCell>

                  <TableCell sx={{ fontSize: 12 }}>{article.doi}</TableCell>
                  <TableCell>
                    <IconButton
                      component="a"
                      href={article.link}
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
    );
  }
}
