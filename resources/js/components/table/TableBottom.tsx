import {
  Box,
  FormControl,
  MenuItem,
  Pagination,
  Select,
  Typography,
} from '@mui/material';

type Props = {
  page: number;
  size: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
};

export default function TableBottom({
  page,
  size,
  totalPages,
  totalItems,
  onPageChange,
  onSizeChange,
}: Props) {
  return (
    <Box
      sx={{
        mt: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Show
        </Typography>

        <FormControl size="small">
          <Select
            value={size}
            onChange={(e) => onSizeChange(Number(e.target.value))}
            sx={{
              minWidth: 70,
              fontSize: 12,
            }}
          >
            {[10, 25, 50, 100].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography
          sx={{
            fontSize: 12,
            color: 'text.secondary',
          }}
        >
          rows
        </Typography>

        {typeof totalItems === 'number' && (
          <Typography
            sx={{
              ml: 1,
              fontSize: 12,
              color: 'text.secondary',
            }}
          >
            ({totalItems} total)
          </Typography>
        )}
      </Box>

      <Pagination
        page={page}
        count={Math.max(totalPages, 1)}
        size="small"
        color="primary"
        onChange={(_, value) => onPageChange(value)}
      />
    </Box>
  );
}
