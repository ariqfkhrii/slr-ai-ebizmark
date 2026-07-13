import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Tooltip,
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
  const [originalValue, setOriginalValue] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const startEdit = (keyword: Keyword) => {
    setEditingId(keyword.id);
    setEditingValue(keyword.name);
    setOriginalValue(keyword.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const cancelConfirmEdit = () => {
    setConfirmOpen(false);
    cancelEdit();
  };

  const submitEdit = () => {
    if (!editingId) return;

    const trimmed = editingValue.trim();
    if (!trimmed) return;

    const current = keywords.find((k) => k.id === editingId);

    if (!current) return;

    if (trimmed === current.name.trim()) {
      cancelEdit();
      return;
    }

    setConfirmOpen(true);
  };

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    onAdd(trimmed);
    setInput('');
  };

  const confirmEdit = () => {
    if (!editingId) return;

    onUpdate(editingId, editingValue.trim());

    setConfirmOpen(false);
    setEditingId(null);
    setEditingValue('');
    setOriginalValue('');
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
          Kata Kunci / Judul
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
          placeholder="Tambah kata kunci / judul"
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
                pr: 5,
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
                      width: 70,
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      className="keyword-actions"
                      sx={{
                        width: 28,
                        display: 'flex',
                        justifyContent: 'center',
                        opacity: 0,
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
                        flexShrink: 0,
                      }}
                    >
                      {hasMetadata ? retrievedCount : '–'}
                    </Box>
                  </Box>
                )
              }
            >
              {isEditing ? (
                <Box
                  sx={{
                    width: '100%',
                    pr: 12,
                    px: 1.5,
                    py: 0.75,
                  }}
                >
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
                        pr: 5,
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
                    sx={{
                      minWidth: 0,
                      overflow: 'hidden',
                    }}
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          width: '100%',
                          minWidth: 0,
                        }}
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

                        <Tooltip title={k.name} arrow placement="top">
                          <Typography
                            sx={{
                              fontSize: 12,
                              fontWeight: 700,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                              maxWidth: '100%',
                            }}
                          >
                            {k.name}
                          </Typography>
                        </Tooltip>
                      </Box>
                    }
                  />
                </ListItemButton>
              )}
            </ListItem>
          );
        })}
      </List>

      <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
      >
          <DialogTitle>
              Ubah Kata Kunci / Judul
          </DialogTitle>

          <DialogContent>
              <Typography>
                  Mengubah kata kunci / judul akan menghapus seluruh metadata yang
                  telah diambil untuk kata kunci / judul ini. Anda perlu melakukan
                  <b> Fetch Metadata</b> kembali setelah perubahan.
              </Typography>
          </DialogContent>

          <DialogActions>
              <Button
                  onClick={cancelConfirmEdit}
                  variant="outlined"
              >
                  Batal
              </Button>

              <Button
                  onClick={confirmEdit}
                  color="warning"
                  variant="contained"
              >
                  Lanjut
              </Button>
          </DialogActions>
      </Dialog>
    </Box>
  );
}
