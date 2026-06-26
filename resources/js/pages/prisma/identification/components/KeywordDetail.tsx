import { Box, Button, Typography } from '@mui/material';
import { ArrowDownFromLine, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { FetchHistory, Keyword } from '../types';
import DeleteKeywordConfirmationDialog from './dialog/DeleteKeywordConfirmationDialog';
import FetchParameterDialog, {
  FetchParams,
} from './dialog/FetchParameterDialog';
import GlobalRawArticleTable from './GlobalRawArticleTable';
import KeywordTabs, { TabValue } from './KeywordTabs';
import RawArticleTable from './RawArticleTable';

export type MetadataPreviewResult = {
  message: string;
  can_execute: boolean;
  data: {
    total_count: number;
    is_recommended: boolean;
    [key: string]: any;
  };
};

type Props = {
  keyword: Keyword | null;
  onFetchMetadata: (keywordId: number, params: FetchParams) => void;
  onPreviewMetadata: (
    keywordId: number,
    params: FetchParams,
  ) => Promise<MetadataPreviewResult>;
  onDeleteKeyword: (id: number) => void;
  histories: FetchHistory[];
  sourceDatabase: string;
  researchPlanId: number;
  refreshTrigger: number;
};

export default function KeywordDetail({
  keyword,
  onFetchMetadata,
  onPreviewMetadata,
  onDeleteKeyword,
  histories,
  sourceDatabase,
  researchPlanId,
  refreshTrigger,
}: Props) {
  const hasMetadata = (keyword?.retrievedCount ?? 0) > 0;
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
          minWidth: 0,
          height: '100%',
          overflow: 'hidden',
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
          researchPlanId={researchPlanId}
          keyword={keyword}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          sourceDatabase={sourceDatabase}
          onPreviewMetadata={onPreviewMetadata}
          onSubmit={(params) => {
            onFetchMetadata(keyword.id, params);
            setAnchorEl(null);
          }}
        />
      </Box>

      <KeywordTabs value={tab} onChange={setTab} />

      {/* CONTENT */}
      {tab === 'analysis' && (
        <RawArticleTable
          keywordId={keyword.id}
          researchPlanId={researchPlanId}
          refreshTrigger={refreshTrigger}
        />
      )}

      {tab === 'globalOverview' && (
        <GlobalRawArticleTable researchPlanId={researchPlanId} />
      )}

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
