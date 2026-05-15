import { Box, Typography } from '@mui/material';
import { Keyword, RawArticle } from '../types';
import ArticleYearChart from './ArticleYearChart';
import RawArticleTable from './RawArticleTable';

type Props = {
  keywords: Keyword[];
};

function getUniqueArticlesByDoi(keywords: Keyword[]): RawArticle[] {
  const map = new Map<string, RawArticle>();

  keywords.forEach((keyword) => {
    keyword.articles?.forEach((article) => {
      if (!map.has(article.doi)) {
        map.set(article.doi, article);
      }
    });
  });

  return Array.from(map.values());
}

export default function GlobalPanel({ keywords }: Props) {
  const articles = getUniqueArticlesByDoi(keywords);
  const fetchedKeywordCount = keywords.filter(
    (keyword) => (keyword.retrievedCount ?? 0) > 0,
  ).length;

  return (
    <Box
      sx={{
        width: 560,
        borderLeft: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 800,
            color: '#14b8a6',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Global View
        </Typography>

        <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Overview</Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <ArticleYearChart
          articles={articles}
          title={`Artikel per Tahun · ${fetchedKeywordCount} Keyword · ${articles.length} Total`}
        />

        <Box sx={{ minHeight: 0, flex: 1 }}>
          <RawArticleTable
            articles={articles}
            maxHeight="calc(100vh - 480px)"
          />
        </Box>
      </Box>
    </Box>
  );
}
