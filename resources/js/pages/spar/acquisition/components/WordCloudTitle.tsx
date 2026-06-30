import { WordCloud } from '@isoterik/react-word-cloud';
import { Box, Typography } from '@mui/material';
import { RawArticle } from '../types';

type Props = {
  articles: RawArticle[];
};

const stopwords = new Set([
  'a',
  'an',
  'the',
  'of',
  'for',
  'in',
  'on',
  'and',
  'or',
  'to',
  'with',
  'using',
  'based',
  'method',
  'methods',
  'study',
  'review',
  'research',
  'article',
]);

export default function WordCloudTitle({ articles }: Props) {
  const frequencies = articles
    .flatMap((article) =>
      article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/),
    )
    .filter((word) => word.length > 2 && !stopwords.has(word))
    .reduce<Record<string, number>>((acc, word) => {
      acc[word] = (acc[word] ?? 0) + 1;
      return acc;
    }, {});

  const words = Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([text, value]) => ({
      text,
      value,
    }));

  if (articles.length === 0) {
    return (
      <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          Belum ada artikel. Fetch metadata terlebih dahulu.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        overflow: 'hidden',
        p: 2,
      }}
    >
      <WordCloud
        words={words}
        width={800}
        height={320}
        fontSize={(word) => Math.max(18, word.value * 12)}
      />
    </Box>
  );
}
