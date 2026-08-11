'use client';

import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';
import GuideTip from './components/GuideTip';

export default function AcquisitionGuide() {
  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Tahap Acquisition digunakan untuk membangun kata kunci pencarian dan
        mengambil metadata artikel ilmiah berdasarkan kriteria yang ditentukan.
      </GuideInfo>

      <GuideSection title="Penggunaan Query Builder">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontSize: '11px' }}
        >
          Anda dapat merangkai kata kunci secara visual menggunakan operator
          logika Boolean:
        </Typography>
        <List dense disablePadding sx={{ pl: 2, mb: 1 }}>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Kata Kunci Pertama"
              secondary="Ketik kata kunci awal Anda pada kolom input, lalu tekan Enter atau tombol Tambah (+)."
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '11px',
                    color: 'text.primary',
                    fontWeight: 600,
                  },
                },
                secondary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Operator Logika (AND, OR, NOT)"
              secondary="Untuk kata kunci berikutnya, pilih operator logika terlebih dahulu di sebelah kiri input sebelum menambahkan kata kunci baru."
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '11px',
                    color: 'text.primary',
                    fontWeight: 600,
                  },
                },
                secondary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Ubah Operator Cepat"
              secondary="Klik langsung pada chip badge operator (AND/OR/NOT) di area visual untuk mengubah hubungan antar kata kunci secara interaktif."
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '11px',
                    color: 'text.primary',
                    fontWeight: 600,
                  },
                },
                secondary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Menghapus Kata Kunci"
              secondary="Klik ikon silang (x) pada chip kata kunci yang ingin dihapus dari susunan."
              slotProps={{
                primary: {
                  sx: {
                    fontSize: '11px',
                    color: 'text.primary',
                    fontWeight: 600,
                  },
                },
                secondary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
        </List>
      </GuideSection>

      <GuideSection title="Langkah-Langkah">
        <GuideStep
          number={1}
          title="Rangkai atau Edit Kata Kunci"
          description="Gunakan Keyword Builder di panel kiri. Jika kata kunci sudah ada dari database, sistem akan otomatis menampilkan susunan kuncinya dan Anda dapat langsung mengeditnya."
        />

        <GuideStep
          number={2}
          title="Simpan / Update"
          description="Periksa pratinjau string pada 'OUTPUT KATA KUNCI'. Klik tombol 'Simpan Kata Kunci' untuk menyimpan atau  memperbarui data yang sudah ada."
        />

        <GuideStep
          number={3}
          title="Fetch Metadata"
          description="Tentukan rentang tahun dan tier jurnal (jika menggunakan database scopus) pada panel detail, lalu klik 'Fetch Metadata' untuk menarik data artikel."
        />

        <GuideStep
          number={4}
          title="Review Hasil Fetch"
          description="Periksa dialog preview yang muncul untuk memastikan pratinjau jumlah dan sampel artikel sudah sesuai."
        />

        <GuideStep
          number={5}
          title="Lihat Hasil"
          description="Pantau proses penarikan data pada progress bar pada pojok kanan bawah halaman. Setelah selesai, buka tab Ringkasan atau Daftar Artikel untuk mengevaluasi data."
        />
      </GuideSection>

      <GuideSection title="Ringkasan Hasil Pengambilan Metadata">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontSize: '11px' }}
        >
          Evaluasi penarikan data mencakup statistik berikut:
        </Typography>
        <List dense disablePadding sx={{ pl: 2, mb: 1 }}>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Total Artikel Preview: Jumlah keseluruhan artikel yang ditemukan saat pratinjau."
              slotProps={{
                primary: { sx: { fontSize: '11px', color: 'text.secondary' } },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Artikel Diperoleh: Jumlah artikel yang berhasil lolos kriteria filtering."
              slotProps={{
                primary: { sx: { fontSize: '11px', color: 'text.secondary' } },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Duplikat: Artikel yang teridentifikasi ganda atau sudah ada sebelumnya."
              slotProps={{
                primary: { sx: { fontSize: '11px', color: 'text.secondary' } },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Tier Tidak Cocok: Artikel dari jurnal yang di luar kuartil pilihan."
              slotProps={{
                primary: { sx: { fontSize: '11px', color: 'text.secondary' } },
              }}
            />
          </ListItem>
        </List>
      </GuideSection>

      <GuideSection title="Tips Berguna">
        <GuideTip>
          Gunakan kombinasi operator AND dan OR secara spesifik agar hasil
          pencarian tidak terlalu luas maupun terlalu sempit.
        </GuideTip>

        <GuideTip>
          Gunakan tombol Reset jika ingin mengulang susunan kata kunci dari
          awal.
        </GuideTip>

        <GuideTip>
          Filter tier jurnal (Q1–Q4) untuk menjaga standar kualitas literatur
          SLR Anda.
        </GuideTip>

        <GuideTip>
          Jika hasil penarikan artikel terlalu sedikit, pertimbangkan untuk
          memperluas rentang tahun atau menambahkan variasi sinonim dengan
          operator OR.
        </GuideTip>
      </GuideSection>
    </Box>
  );
}
