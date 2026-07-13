'use client';

import { showError } from '@/store/slices/snackbarSlice';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { Box, Typography } from '@mui/material';
import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

interface UploadZoneProps {
  file: File | null;
  disabled?: boolean;
  onSelect: (file: File) => void;
}

export default function UploadZone({ onSelect, disabled }: UploadZoneProps) {
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFile = (file?: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      dispatch(showError('Hanya file PDF yang diperbolehkan.'));
      return;
    }

    onSelect(file);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    setDragging(false);

    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  return (
    <>
      <Box
        onClick={disabled ? undefined : handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        sx={{
          height: 320,
          border: '2px dashed',
          borderColor: dragging ? 'primary.main' : 'divider',
          borderRadius: 2,
          cursor: 'pointer',

          display: 'flex',
          flexDirection: 'column',

          alignItems: 'center',
          justifyContent: 'center',

          transition: 'all .2s ease',

          bgcolor: dragging ? 'action.hover' : 'background.paper',

          '&:hover': {
            borderColor: 'primary.main',
          },
        }}
      >
        <CloudUploadOutlinedIcon
          sx={{
            fontSize: 60,
            mb: 2,
            color: 'text.secondary',
          }}
        />

        <Typography
          variant="h6"
          sx={{
            mb: 1,
          }}
        >
          Pilih File PDF atau Drag and Drop
        </Typography>

        <Typography color="text.secondary" variant="body2">
          Hanya file PDF yang dapat di unggah
        </Typography>
      </Box>

      <input
        hidden
        ref={inputRef}
        disabled={disabled}
        type="file"
        accept=".pdf"
        onChange={handleChange}
      />
    </>
  );
}
