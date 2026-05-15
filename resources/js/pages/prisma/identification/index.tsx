import { Box } from '@mui/material';
import GlobalPanel from './components/GlobalPanel';
import KeywordDetail from './components/KeywordDetail';
import KeywordList from './components/KeywordList';
import { useIdentification } from './hooks/useIdentification';

export default function Identification() {
  const {
    keywords,
    selectedKeyword,
    addKeyword,
    deleteKeyword,
    selectKeyword,
    updateKeyword,
    fetchMetadata,
    histories,
  } = useIdentification();

  return (
    <Box
      sx={{
        height: '100%',
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

      <GlobalPanel keywords={keywords} />
    </Box>
  );
}
