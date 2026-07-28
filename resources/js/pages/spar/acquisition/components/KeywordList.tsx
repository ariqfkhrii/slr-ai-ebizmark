import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Keyword } from '../types';

type QueryItem = {
  id: number;
  operator: 'AND' | 'OR' | 'NOT' | null;
  value: string;
};

type Props = {
  keyword: Keyword | null;
  onSave: (query: string) => void;
};

export default function KeywordList({ keyword, onSave }: Props) {
  const [input, setInput] = useState('');
  const [operator, setOperator] = useState<'AND' | 'OR' | 'NOT'>('AND');
  const [queryItems, setQueryItems] = useState<QueryItem[]>([]);

  useEffect(() => {
    if (!keyword || !keyword.name) {
      setQueryItems([]);
      return;
    }

    const tokens = keyword.name
      .split(/\s+(AND|OR|NOT)\s+/i)
      .map((t) => t.trim())
      .filter(Boolean);

    const items: QueryItem[] = [];
    let currentOp: 'AND' | 'OR' | 'NOT' | null = null;

    tokens.forEach((token, index) => {
      const upper = token.toUpperCase();
      if (['AND', 'OR', 'NOT'].includes(upper)) {
        currentOp = upper as 'AND' | 'OR' | 'NOT';
      } else {
        items.push({
          id: Date.now() + index,
          operator: items.length === 0 ? null : currentOp || 'AND',
          value: token,
        });
        currentOp = null;
      }
    });

    setQueryItems(items);
  }, [keyword]);

  const fullQuery = queryItems
    .map((item, index) =>
      index === 0 ? item.value : `${item.operator} ${item.value}`,
    )
    .join(' ');

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setQueryItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        operator: prev.length === 0 ? null : operator,
        value: trimmed,
      },
    ]);
    setInput('');
    setOperator('AND');
  };

  const handleDeleteItem = (id: number) => {
    setQueryItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      if (updated.length > 0) updated[0].operator = null;
      return updated;
    });
  };

  const handleToggleOperator = (id: number) => {
    setQueryItems((prev) =>
      prev.map((item) => {
        if (item.id !== id || item.operator === null) return item;
        const nextOp =
          item.operator === 'AND'
            ? 'OR'
            : item.operator === 'OR'
              ? 'NOT'
              : 'AND';
        return { ...item, operator: nextOp };
      }),
    );
  };

  return (
    <Box
      sx={{
        width: '30%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
        p: 2,
        gap: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
        Kata Kunci / Judul
      </Typography>

      {/* Input Builder */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Select
          size="small"
          value={operator}
          disabled={queryItems.length === 0}
          onChange={(e) => setOperator(e.target.value as 'AND' | 'OR' | 'NOT')}
          sx={{ width: 85, fontSize: 12 }}
        >
          <MenuItem value="AND">AND</MenuItem>
          <MenuItem value="OR">OR</MenuItem>
          <MenuItem value="NOT">NOT</MenuItem>
        </Select>

        <TextField
          size="small"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder={
            queryItems.length === 0
              ? 'Kata kunci pertama...'
              : 'Tambahkan kata kunci...'
          }
          sx={{ '& .MuiInputBase-input': { fontSize: 13, py: 0.8 } }}
        />

        <IconButton color="primary" size="small" onClick={handleAdd}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Area Visual Query - Chip Inline */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          p: 1.5,
          display: 'flex',
          flexWrap: 'wrap',
          alignContent: 'flex-start',
          gap: 1,
          overflowY: 'auto',
          bgcolor: 'grey.50',
          borderRadius: 2,
        }}
      >
        {queryItems.length === 0 ? (
          <Typography
            color="text.secondary"
            sx={{ fontSize: 13, fontStyle: 'italic', m: 'auto' }}
          >
            Kata Kunci Anda akan dirangkai di sini...
          </Typography>
        ) : (
          queryItems.map((item, index) => (
            <Box
              key={item.id}
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8 }}
            >
              {index > 0 && (
                <Chip
                  label={item.operator}
                  size="small"
                  onClick={() => handleToggleOperator(item.id)}
                  color={
                    item.operator === 'NOT'
                      ? 'error'
                      : item.operator === 'OR'
                        ? 'warning'
                        : 'primary'
                  }
                  sx={{
                    fontSize: 10,
                    height: 22,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                />
              )}
              <Chip
                label={item.value}
                size="small"
                onDelete={() => handleDeleteItem(item.id)}
                variant="filled"
                sx={{
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  fontWeight: 600,
                  fontSize: 12,
                }}
              />
            </Box>
          ))
        )}
      </Paper>

      {/* Result & Actions */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography
          sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary' }}
        >
          OUTPUT KATA KUNCI:
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 1,
            minHeight: 120,
            maxHeight: 180,
            overflowY: 'auto',
            bgcolor: 'grey.100',
            borderColor: 'divider',
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontFamily: 'monospace',
              wordBreak: 'break-word',
              color: fullQuery ? 'text.primary' : 'text.disabled',
            }}
          >
            {fullQuery || 'Kosong'}
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
          <Button
            fullWidth
            size="small"
            variant="outlined"
            onClick={() => setQueryItems([])}
            disabled={queryItems.length === 0}
          >
            Reset
          </Button>
          <Button
            fullWidth
            size="small"
            variant="contained"
            onClick={() => onSave(fullQuery)}
            disabled={queryItems.length === 0}
          >
            Simpan
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
