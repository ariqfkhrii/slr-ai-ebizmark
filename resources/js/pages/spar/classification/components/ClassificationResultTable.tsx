import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
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
import { ClassificationArticle, ClassificationCategory } from '../types';

type Props = {
  articles: ClassificationArticle[];
  activeCategories: ClassificationCategory[];
  onOpenDetail: (articleId: number) => void;
};

export default function ClassificationResultTable({
  articles,
  activeCategories,
  onOpenDetail,
}: Props) {
  const [search, setSearch] = useState('');

  const filteredArticles = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return articles;

    return articles.filter((article) =>
      [
        article.title,
        article.authors,
        article.country,
        article.researchMethod,
        ...Object.values(article.classifications),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [articles, search]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        minWidth: 0,
        borderRadius: 4,
        border: '1px solid #e5e7eb',
        bgcolor: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #eef2f7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 900 }}>
            Classification Results
          </Typography>

          <Typography sx={{ mt: 0.25, fontSize: 12, color: '#64748b' }}>
            Tinjau dan kelola hasil klasifikasi tematik dari seluruh artikel
            yang telah lolos proses screening.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            size="small"
            label={`${filteredArticles.length} records`}
            sx={{
              fontSize: 11,
              fontWeight: 800,
              bgcolor: '#f1f5f9',
              color: '#475569',
            }}
          />

          <Chip
            size="small"
            label={`${activeCategories.length} categories`}
            sx={{
              fontSize: 11,
              fontWeight: 800,
              bgcolor: '#ecfdf5',
              color: '#059669',
            }}
          />
        </Box>
      </Box>

      <Box sx={{ p: 2, pb: 1.25 }}>
        <TextField
          size="small"
          placeholder="Search article, author, method, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            width: 360,
            maxWidth: '100%',
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: '#f8fafc',
            },
            '& .MuiInputBase-input': {
              fontSize: 13,
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                </InputAdornment>
              ),
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
        <Table
          stickyHeader
          size="small"
          sx={{
            minWidth: 1050,
            borderCollapse: 'separate',
            borderSpacing: '0 8px',

            '& .MuiTableCell-root': {
              borderBottom: 'none',
              fontSize: 12,
            },

            '& .MuiTableHead-root .MuiTableCell-root': {
              bgcolor: '#f8fafc',
              color: '#475569',
              fontWeight: 900,
              whiteSpace: 'nowrap',
              borderTop: '1px solid #e5e7eb',
              borderBottom: '1px solid #e5e7eb',
            },

            '& .MuiTableHead-root .MuiTableCell-root:first-of-type': {
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              borderLeft: '1px solid #e5e7eb',
            },

            '& .MuiTableHead-root .MuiTableCell-root:last-of-type': {
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              borderRight: '1px solid #e5e7eb',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell width={56}>No</TableCell>
              <TableCell>Authors</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Research Method</TableCell>

              {activeCategories.map((category) => (
                <TableCell key={category.id}>{category.name}</TableCell>
              ))}

              <TableCell align="center" width={70}>
                Act
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredArticles.map((article, index) => (
              <TableRow
                key={article.id}
                hover
                sx={{
                  '& .MuiTableCell-root': {
                    bgcolor: '#ffffff',
                    borderTop: '1px solid #eef2f7',
                    borderBottom: '1px solid #eef2f7',
                  },
                  '& .MuiTableCell-root:first-of-type': {
                    borderTopLeftRadius: 14,
                    borderBottomLeftRadius: 14,
                    borderLeft: '1px solid #eef2f7',
                  },
                  '& .MuiTableCell-root:last-of-type': {
                    borderTopRightRadius: 14,
                    borderBottomRightRadius: 14,
                    borderRight: '1px solid #eef2f7',
                  },
                  '&:hover .MuiTableCell-root': {
                    bgcolor: '#f8fbff',
                  },
                }}
              >
                <TableCell sx={{ color: '#64748b', fontWeight: 800 }}>
                  {index + 1}
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                    {article.authors}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>
                    {article.publishYear ?? '-'}
                  </Typography>
                </TableCell>

                <TableCell>{article.country}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={article.researchMethod || '-'}
                    sx={{
                      maxWidth: 180,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: '#eff6ff',
                      color: '#2563eb',
                      '& .MuiChip-label': {
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      },
                    }}
                  />
                </TableCell>

                {activeCategories.map((category) => {
                  const value = article.classifications[category.id];

                  return (
                    <TableCell key={category.id}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: value ? '#334155' : '#cbd5e1',
                          maxWidth: 180,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {value || 'Not classified'}
                      </Typography>
                    </TableCell>
                  );
                })}

                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onOpenDetail(article.id)}
                    sx={{
                      bgcolor: '#eff6ff',
                      color: '#2563eb',
                      '&:hover': {
                        bgcolor: '#dbeafe',
                      },
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
