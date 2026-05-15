import { Box, Button, Typography } from '@mui/material';
import { ArrowDownFromLine, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FetchHistory, Keyword } from '../types';
import DeleteKeywordConfirmationDialog from './dialog/DeleteKeywordConfirmationDialog';
import FetchParameterDialog, {
  FetchParams,
} from './dialog/FetchParameterDialog';
import FetchHistoryPanel from './FetchHistoryPanel';
import KeywordTabs, { TabValue } from './KeywordTabs';
import RawArticleTable from './RawArticleTable';
import WordCloudTitle from './WordCloudTitle';

type Props = {
  keyword: Keyword | null;
  onFetchMetadata: (keywordId: number, params: FetchParams) => void;
  onDeleteKeyword: (id: number) => void;
  histories: FetchHistory[];
};

export default function KeywordDetail({
  keyword,
  onFetchMetadata,
  onDeleteKeyword,
  histories,
}: Props) {
  const hasMetadata = (keyword?.retrievedCount ?? 0) > 0;
  const articles = keyword?.articles ?? [];
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tab, setTab] = useState<TabValue>('analysis');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!keyword) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">Pilih keyword dulu</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* TITLE */}
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {keyword.name}
      </Typography>

      {/* ACTION */}
      <Box>
        <Button
          variant="contained"
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          startIcon={
            hasMetadata ? (
              <RotateCcw size={14} />
            ) : (
              <ArrowDownFromLine size={14} />
            )
          }
          sx={{
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 700,
            px: 1.5,
            py: 0.6,

            ...(hasMetadata
              ? {
                  bgcolor: '#f59e0b',
                  color: '#fff',

                  '&:hover': {
                    bgcolor: '#d97706',
                  },
                }
              : {}),
          }}
        >
          {hasMetadata ? 'Update Metadata' : 'Fetch Metadata'}
        </Button>

        <Button
          variant="contained"
          size="small"
          onClick={() => setDeleteDialogOpen(true)}
          startIcon={<Trash2 size={14} />}
          sx={{
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 700,
            px: 1.5,
            py: 0.6,
            bgcolor: '#ef4444',
            color: '#fff',
            ml: 1,
          }}
        >
          Hapus
        </Button>

        <FetchParameterDialog
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          onSubmit={(params) => {
            onFetchMetadata(keyword.id, params);
            setAnchorEl(null);
          }}
        />
      </Box>

      <KeywordTabs value={tab} onChange={setTab} />

      {/* CONTENT */}
      {tab === 'analysis' && <RawArticleTable articles={articles} />}

      {tab === 'wordCloud' && <WordCloudTitle articles={articles} />}

      {tab === 'history' && <FetchHistoryPanel histories={histories} />}

      {/* DELETE DIALOG */}
      <DeleteKeywordConfirmationDialog
        keywordId={keyword.id}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleteKeyword={onDeleteKeyword}
      />
    </Box>
  );
}
