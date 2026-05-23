import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Keyword } from '../types';

type Props = {
  keywords: Keyword[];
  onAdd: (name: string) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number, name: string) => void;
};

export default function KeywordList({
  keywords,
  onAdd,
  onSelect,
  onDelete,
  onUpdate,
}: Props) {
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const startEdit = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setEditingValue(keyword.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const submitEdit = () => {
    if (!editingId) return;

    const trimmed = editingValue.trim();
    if (!trimmed) return;

    onUpdate(editingId, trimmed);
    setEditingId(null);
    setEditingValue('');
  };

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    onAdd(trimmed);
    setInput('');
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>
          Keywords
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, p: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="Tambah keyword"
          sx={{
            '& .MuiInputBase-input': {
              fontSize: 12,
              py: 0.9,
            },
          }}
        />

        <IconButton color="primary" size="small" onClick={handleAdd}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      <List sx={{ overflowY: 'auto', flex: 1, p: 0 }}>
        {keywords.map((k) => {
          const isEditing = editingId === k.id;
          const retrievedCount = k.retrievedCount ?? 0;
          const hasMetadata = retrievedCount > 0;

          return (
            <ListItem
              key={k.id}
              disablePadding
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
                '&:hover .keyword-actions': {
                  opacity: 1,
                  pointerEvents: 'auto',
                },
              }}
              secondaryAction={
                isEditing ? (
                  <Box sx={{ display: 'flex', gap: 0.5, pr: 1 }}>
                    <IconButton
                      size="small"
                      color="success"
                      onClick={submitEdit}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>

                    <IconButton size="small" onClick={cancelEdit}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                      pr: 1,
                    }}
                  >
                    <Box
                      className="keyword-actions"
                      sx={{
                        display: 'flex',
                        gap: 0.25,
                        opacity: 0,
                        pointerEvents: 'none',
                        transition: 'opacity .15s ease',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(k);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Box
                      sx={{
                        minWidth: 26,
                        height: 20,
                        px: 0.75,
                        borderRadius: 999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        bgcolor: hasMetadata
                          ? 'rgba(20,184,166,.12)'
                          : '#f3f4f6',
                        color: hasMetadata ? '#0d9488' : '#9ca3af',
                        border: '1px solid',
                        borderColor: hasMetadata
                          ? 'rgba(20,184,166,.25)'
                          : 'divider',
                      }}
                    >
                      {hasMetadata ? retrievedCount : '–'}
                    </Box>
                  </Box>
                )
              }
            >
              {isEditing ? (
                <Box sx={{ width: '100%', pr: 10, px: 1, py: 0.75 }}>
                  <TextField
                    size="small"
                    fullWidth
                    autoFocus
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    sx={{
                      '& .MuiInputBase-input': {
                        fontSize: 12,
                        py: 0.8,
                      },
                    }}
                  />
                </Box>
              ) : (
                <ListItemButton
                  onClick={() => onSelect(k.id)}
                  sx={{
                    minHeight: 42,
                    px: 1.5,
                    py: 0.75,
                    pr: 11,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: hasMetadata ? '#14b8a6' : '#d1d5db',
                            flexShrink: 0,
                          }}
                        />

                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {k.name}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}
