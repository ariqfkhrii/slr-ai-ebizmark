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
        kata kunci / judul yang telah ditentukan. Panel ini akan memandu Anda
        dalam menggunakan fitur Acquisition untuk melakukan pencarian dan
        pengumpulan artikel dari database.
      </GuideInfo>

      <GuideSection title="Mulai">
        <GuideStep
          number={1}
          title="Tambah Kata Kunci / Judul"
          description="Masukkan kata kunci / judul penelitian Anda di panel kiri, lalu tekan Enter atau klik tombol Tambah untuk memasukkannya ke dalam daftar."
        />

        <GuideStep
          number={2}
          title="Pilih Kata Kunci / Judul"
          description="Klik salah satu item di daftar panel kiri untuk melihat detail dan melakukan aksi. Panel tengah akan menampilkan informasi terkait kata kunci / judul yang dipilih."
        />

        <GuideStep
          number={3}
          title="Fetch Metadata"
          description="Klik tombol 'Fetch Metadata' pada panel tengah untuk mengambil data artikel dari database publik. Atur parameter seperti rentang tahun dan tier jurnal sesuai kebutuhan."
        />

        <GuideStep
          number={4}
          title="Review Hasil Fetch"
          description="Setelah proses fetch selesai, akan muncul modal review yang menampilkan jumlah artikel ditemukan, rekomendasi SLR, dan sampel artikel. Pastikan data sesuai sebelum mengkonfirmasi."
        />

        <GuideStep
          number={5}
          title="Lihat Hasil"
          description="Gunakan tab 'Ringkasan Hasil Pengambilan Metadata' untuk melihat statistik pencarian, serta tab 'Artikel per Kata Kunci / Judul' atau 'Artikel seluruh Kata Kunci / Judul' untuk melihat daftar data secara lengkap."
        />
      </GuideSection>

      <GuideSection title="Artikel per & seluruh Kata Kunci / Judul">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontSize: '11px' }}
        >
          Menampilkan tabel artikel berdasarkan satu kata kunci / judul spesifik
          atau gabungan seluruhnya. Anda dapat melihat:
        </Typography>
        <List dense disablePadding sx={{ pl: 2, mb: 1 }}>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Judul artikel dan nama jurnal"
              slotProps={{
                primary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Tahun publikasi"
              slotProps={{
                primary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Tier jurnal (Q1-Q4)"
              slotProps={{
                primary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Link untuk membuka artikel"
              slotProps={{
                primary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
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
          Menampilkan statistik dan hasil evaluasi dari proses penarikan data
          artikel, meliputi:
        </Typography>
        <List dense disablePadding sx={{ pl: 2, mb: 1 }}>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Total Artikel Preview: Keseluruhan artikel saat preview awal."
              slotProps={{
                primary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Artikel Valid: Jumlah artikel asli/valid yang berhasil disimpan."
              slotProps={{
                primary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Duplikat: Artikel dengan identitas ganda atau sudah didapat dari pencarian lain."
              slotProps={{
                primary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Tier tidak cocok: Artikel dari jurnal di luar rentang kuartil pilihan."
              slotProps={{
                primary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary="Tanpa DOI / Di luar tahun: Artikel tanpa DOI yang valid atau tidak masuk rentang waktu."
              slotProps={{
                primary: {
                  sx: { fontSize: '11px', color: 'text.secondary' },
                },
              }}
            />
          </ListItem>
        </List>
      </GuideSection>

      <GuideSection title="Tips Berguna">
        <GuideTip>
          Gunakan kata kunci / judul yang spesifik untuk hasil pencarian yang
          lebih akurat dan relevan.
        </GuideTip>

        <GuideTip>
          Filter berdasarkan tier jurnal (Q1-Q4) untuk meningkatkan kualitas
          literatur yang akan digunakan dalam SLR.
        </GuideTip>

        <GuideTip>
          Periksa artikel dengan sitasi tinggi terlebih dahulu, karena biasanya
          artikel tersebut lebih berpengaruh di bidangnya.
        </GuideTip>

        <GuideTip>
          Gunakan fitur filter kata kunci / judul untuk membandingkan hasil dari
          topik penelitian yang berbeda.
        </GuideTip>

        <GuideTip>
          Pastikan rentang tahun yang dipilih mencakup publikasi terbaru agar
          literatur tetap relevan dengan perkembangan terkini.
        </GuideTip>

        <GuideTip>
          Jika hasil fetch terlalu sedikit, perlebar rentang tahun atau revisi
          kata kunci / judul dengan sinonim atau istilah terkait.
        </GuideTip>
      </GuideSection>
    </Box>
  );
}
