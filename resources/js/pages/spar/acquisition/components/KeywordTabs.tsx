import { Box, Button } from '@mui/material';

type TabValue = 'per-keyword' | 'all-keywords' | 'summary';

type Props = {
  value: TabValue;
  onChange: (value: TabValue) => void;
};

const tabs = [
  {
    label: 'Daftar Artikel',
    value: 'per-keyword',
  },
  {
    label: 'Ringkasan Hasil Pengambilan Metadata',
    value: 'summary',
  },
] as const;

export default function KeywordTabs({ value, onChange }: Props) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {tabs.map((tab) => {
        const active = value === tab.value;

        return (
          <Button
            key={tab.value}
            size="small"
            onClick={() => onChange(tab.value)}
            sx={{
              borderRadius: 0,
              px: 2,
              py: 1,
              minHeight: 38,
              textTransform: 'none',
              fontSize: 12,
              fontWeight: 700,
              color: active ? '#14b8a6' : 'text.secondary',
              borderBottom: active
                ? '2px solid #14b8a6'
                : '2px solid transparent',

              '&:hover': {
                bgcolor: 'rgba(20,184,166,.06)',
                color: '#14b8a6',
              },
            }}
          >
            {tab.label}
          </Button>
        );
      })}
    </Box>
  );
}

export type { TabValue };
