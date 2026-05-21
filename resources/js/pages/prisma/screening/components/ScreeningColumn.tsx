import { Box, Typography } from '@mui/material';
import { FilteredArticle } from '../types';
import ScreeningArticleCard from './ScreeningArticleCard';

type Props = {
  title: string;
  articles: FilteredArticle[];
  onInclude: (id: number) => void;
  onExclude: (id: number) => void;
};

export default function ScreeningColumn({
  title,
  articles,
  onInclude,
  onExclude,
}: Props) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Typography sx={{ fontSize: 22, fontWeight: 800, mb: 2 }}>
        {title}
      </Typography>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
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
        {articles.map((item) => (
          <ScreeningArticleCard
            key={item.filtered_article_id}
            item={item}
            onInclude={() => onInclude(item.filtered_article_id)}
            onExclude={() => onExclude(item.filtered_article_id)}
          />
        ))}
      </Box>
    </Box>
  );
}
