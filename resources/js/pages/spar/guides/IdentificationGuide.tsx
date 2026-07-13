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
        Tahap Acquisition digunakan untuk mengambil metadata artikel berdasarkan
        kata kunci atau judul. Panel ini memandu Anda mencari dan
        mengumpulkan artikel dari database.
      </GuideInfo>

      <GuideSection title="Aturan Penulisan Input">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontSize: '11px' }}
        >
          Sistem otomatis menyesuaikan jenis pencarian berdasarkan format input Anda:
        </Typography>
        <List dense disablePadding sx={{ pl: 2, mb: 1 }}>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Judul Spesifik (Tanpa Tanda Baca)"
              secondary="Ketik kalimat langsung. Jika tidak mengandung ';' atau '!', sistem mencari artikel dengan judul persis seperti input tersebut."
              slotProps={{
                primary: { sx: { fontSize: '11px', color: 'text.primary', fontWeight: 600 } },
                secondary: { sx: { fontSize: '11px', color: 'text.secondary' } },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Kata Kunci Tunggal"
              secondary="Input 1 kata tanpa spasi (misal: agriculture) otomatis dianggap kata kunci. Jika frasa berspasi (misal: machine learning), tambahkan ';' di akhir agar tidak dianggap sebagai judul."
              slotProps={{
                primary: { sx: { fontSize: '11px', color: 'text.primary', fontWeight: 600 } },
                secondary: { sx: { fontSize: '11px', color: 'text.secondary' } },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Kata Kunci Gabungan (;)"
              secondary="Gunakan titik koma (;) untuk memisah beberapa topik (logika AND). Contoh: machine learning; agriculture."
              slotProps={{
                primary: { sx: { fontSize: '11px', color: 'text.primary', fontWeight: 600 } },
                secondary: { sx: { fontSize: '11px', color: 'text.secondary' } },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Pengecualian Topik (!)"
              secondary="Tambahkan tanda seru (!) di awal kata untuk mengecualikannya (logika NOT). Contoh: agriculture; !climate change."
              slotProps={{
                primary: { sx: { fontSize: '11px', color: 'text.primary', fontWeight: 600 } },
                secondary: { sx: { fontSize: '11px', color: 'text.secondary' } },
              }}
            />
          </ListItem>
        </List>
      </GuideSection>

      <GuideSection title="Mulai">
        <GuideStep
          number={1}
          title="Tambah Input"
          description="Masukkan kata kunci atau judul di panel kiri, lalu tekan Enter atau klik Tambah."
        />

        <GuideStep
          number={2}
          title="Pilih Item"
          description="Klik item di panel kiri untuk melihat detail dan pengaturannya di panel tengah."
        />

        <GuideStep
          number={3}
          title="Fetch Metadata"
          description="Tentukan rentang tahun dan tier jurnal, lalu klik 'Fetch Metadata' untuk mengambil data artikel."
        />

        <GuideStep
          number={4}
          title="Review Hasil Fetch"
          description="Periksa modal review yang muncul. Pastikan jumlah dan sampel artikel sesuai sebelum Anda mengkonfirmasi."
        />

        <GuideStep
          number={5}
          title="Lihat Hasil"
          description="Buka tab 'Ringkasan' untuk melihat statistik, atau tab 'Artikel' untuk melihat daftar data lengkap."
        />
      </GuideSection>

      <GuideSection title="Artikel per & seluruh Kata Kunci / Judul">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontSize: '11px' }}
        >
          Menampilkan tabel artikel dari satu input spesifik atau gabungan seluruhnya, mencakup:
        </Typography>
        <List dense disablePadding sx={{ pl: 2, mb: 1 }}>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Judul artikel dan nama jurnal"
              slotProps={{ primary: { sx: { fontSize: '11px', color: 'text.secondary' } } }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Tahun publikasi"
              slotProps={{ primary: { sx: { fontSize: '11px', color: 'text.secondary' } } }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Tier jurnal (Q1-Q4)"
              slotProps={{ primary: { sx: { fontSize: '11px', color: 'text.secondary' } } }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Link untuk membuka artikel"
              slotProps={{ primary: { sx: { fontSize: '11px', color: 'text.secondary' } } }}
            />
          </ListItem>
        </List>
      </GuideSection>

      <GuideSection title="Ringkasan Hasil Pengambilan Metadata">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontSize: '11px' }}
        >
          Menampilkan statistik evaluasi penarikan data, meliputi:
        </Typography>
        <List dense disablePadding sx={{ pl: 2, mb: 1 }}>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Total Artikel Preview: Keseluruhan artikel saat preview awal."
              slotProps={{ primary: { sx: { fontSize: '11px', color: 'text.secondary' } } }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Artikel Diperoleh: Jumlah artikel yang lolos proses filtering."
              slotProps={{ primary: { sx: { fontSize: '11px', color: 'text.secondary' } } }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Duplikat: Artikel beridentitas ganda atau sudah ada di pencarian lain."
              slotProps={{ primary: { sx: { fontSize: '11px', color: 'text.secondary' } } }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Tier tidak cocok: Artikel dari jurnal di luar kuartil pilihan."
              slotProps={{ primary: { sx: { fontSize: '11px', color: 'text.secondary' } } }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Tanpa DOI / Di luar tahun: Artikel tanpa DOI valid atau di luar rentang waktu."
              slotProps={{ primary: { sx: { fontSize: '11px', color: 'text.secondary' } } }}
            />
          </ListItem>
        </List>
      </GuideSection>

      <GuideSection title="Tips Berguna">
        <GuideTip>
          Gunakan kata kunci atau judul spesifik untuk hasil pencarian yang lebih akurat.
        </GuideTip>

        <GuideTip>
          Filter tier jurnal (Q1-Q4) untuk meningkatkan kualitas literatur SLR Anda.
        </GuideTip>

        <GuideTip>
          Utamakan artikel dengan sitasi tinggi karena umumnya lebih berpengaruh di bidang tersebut.
        </GuideTip>

        <GuideTip>
          Gunakan filter untuk membandingkan hasil dari beberapa topik yang berbeda.
        </GuideTip>

        <GuideTip>
          Pastikan rentang tahun mencakup publikasi terbaru agar literatur relevan.
        </GuideTip>

        <GuideTip>
          Jika hasil fetch sedikit, perlebar rentang tahun atau gunakan sinonim kata kunci.
        </GuideTip>
      </GuideSection>
    </Box>
  );
}
