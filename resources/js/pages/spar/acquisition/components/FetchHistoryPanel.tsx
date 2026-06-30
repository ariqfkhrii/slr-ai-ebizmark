import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { FetchHistory } from '../types';

type Props = {
  histories: FetchHistory[];
};

export default function FetchHistoryPanel({ histories }: Props) {
  if (histories.length === 0) {
    return (
      <Box sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}>
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          Belum ada riwayat fetch metadata.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 2 }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f9fafb' }}>
            <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>WAKTU</TableCell>
            <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>AKSI</TableCell>
            <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>
              PARAMETER
            </TableCell>
            <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>HASIL</TableCell>
            <TableCell sx={{ fontSize: 11, fontWeight: 800 }}>STATUS</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {histories.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell sx={{ fontSize: 12 }}>
                {new Date(item.createdAt).toLocaleString('id-ID')}
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={
                    item.action === 'update'
                      ? 'Update Metadata'
                      : 'Fetch Metadata'
                  }
                  color={item.action === 'update' ? 'warning' : 'primary'}
                  sx={{ fontSize: 11 }}
                />
              </TableCell>

              <TableCell sx={{ fontSize: 12 }}>
                {item.yearFrom}–{item.yearTo} · {item.tiers.join(', ')}
              </TableCell>

              <TableCell sx={{ fontSize: 12, fontWeight: 700 }}>
                {item.resultCount} artikel
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={item.status === 'success' ? 'Sukses' : 'Gagal'}
                  color={item.status === 'success' ? 'success' : 'error'}
                  sx={{ fontSize: 11 }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
