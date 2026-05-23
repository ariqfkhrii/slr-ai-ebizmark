import { Box } from '@mui/material';
import GlobalPanel from './components/GlobalPanel';
import KeywordDetail from './components/KeywordDetail';
import KeywordList from './components/KeywordList';
import { useIdentification } from './hooks/useIdentification';
import { RawArticle } from './types';

type Props = ReturnType<typeof useIdentification> & {
  globalArticles: RawArticle[];
};

export default function Identification({
  keywords,
  selectedKeyword,
  addKeyword,
  deleteKeyword,
  selectKeyword,
  updateKeyword,
  fetchMetadata,
  histories,
  globalArticles,
}: Props) {
  return (
    <Box
      sx={{
        height: 'calc(100vh - 128px)', // sesuaikan kalau ada navbar/header
        minHeight: 0,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      <KeywordList
        keywords={keywords}
        onAdd={addKeyword}
        onDelete={deleteKeyword}
        onSelect={selectKeyword}
        onUpdate={updateKeyword}
      />

      <KeywordDetail
        keyword={selectedKeyword}
        onFetchMetadata={fetchMetadata}
        onDeleteKeyword={deleteKeyword}
        histories={histories}
      />

      <GlobalPanel keywords={keywords} articles={globalArticles} />
    </Box>
  );
}
