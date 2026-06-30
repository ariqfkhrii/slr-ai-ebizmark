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
        keyword yang telah ditentukan. Panel ini akan memandu Anda dalam
        menggunakan fitur Acquisition untuk melakukan pencarian dan pengumpulan
        artikel dari database.
      </GuideInfo>

      <GuideSection title="Mulai">
        <GuideStep
          number={1}
          title="Tambah Keyword"
          description="Masukkan kata kunci penelitian Anda di panel kiri pada kolom 'Tambah keyword', lalu tekan Enter atau klik tombol Tambah untuk menambahkan keyword ke daftar."
        />

        <GuideStep
          number={2}
          title="Pilih Keyword"
          description="Klik salah satu keyword di daftar panel kiri untuk melihat detail dan melakukan aksi pada keyword tersebut. Panel tengah akan menampilkan informasi terkait keyword yang dipilih."
        />

        <GuideStep
          number={3}
          title="Fetch Metadata"
          description="Klik tombol 'Fetch Metadata' pada panel tengah untuk mengambil data artikel dari database publik. Atur parameter seperti rentang tahun dan tier jurnal sesuai kebutuhan."
        />

        <GuideStep
          number={4}
          title="Review Hasil Fetch"
          description="Setelah proses fetch selesai, akan muncul modal review yang menampilkan jumlah artikel ditemukan, rekomendasi SLR, dan sample artikel. Pastikan data sesuai sebelum mengkonfirmasi."
        />

        <GuideStep
          number={5}
          title="Lihat Hasil"
          description="Gunakan tab 'List Artikel' untuk melihat daftar lengkap artikel, atau tab 'Grafis Artikel' untuk melihat visualisasi distribusi artikel per tahun."
        />
      </GuideSection>

      <GuideSection title="List Artikel">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontSize: '11px' }}
        >
          Menampilkan tabel semua artikel yang ditemukan dari keyword yang
          dipilih. Anda dapat melihat:
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
              primary="Jumlah sitasi (INT)"
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

      <GuideSection title="Grafis Artikel">
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontSize: '11px' }}
        >
          Menampilkan visualisasi distribusi artikel per tahun dalam bentuk
          grafik batang.
        </Typography>
        <List dense disablePadding sx={{ pl: 2, mb: 1 }}>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '11px',
                      color: 'text.primary',
                    }}
                  >
                    Tombol Filter Keyword:
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ fontSize: '11px', color: 'text.secondary' }}
                  >
                    {' '}
                    Secara default, grafik menampilkan data gabungan dari semua
                    keyword. Gunakan tombol on/off untuk menyaring grafik
                    berdasarkan keyword tertentu.
                  </Typography>
                </>
              }
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '11px',
                      color: 'text.primary',
                    }}
                  >
                    Grafik Batang:
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ fontSize: '11px', color: 'text.secondary' }}
                  >
                    {' '}
                    Menunjukkan distribusi artikel per tahun. Bar yang lebih
                    tinggi menunjukkan lebih banyak artikel pada tahun tersebut.
                  </Typography>
                </>
              }
            />
          </ListItem>
          <ListItem disablePadding sx={{ py: 0.25 }}>
            <ListItemText
              primary={
                <>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '11px',
                      color: 'text.primary',
                    }}
                  >
                    Unduh Grafik:
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{ fontSize: '11px', color: 'text.secondary' }}
                  >
                    {' '}
                    Gunakan menu unduh untuk menyimpan grafik dalam format SVG,
                    PNG, atau CSV.
                  </Typography>
                </>
              }
            />
          </ListItem>
        </List>
      </GuideSection>

      <GuideSection title="Tips Berguna">
        <GuideTip>
          Gunakan keyword yang spesifik untuk hasil pencarian yang lebih akurat
          dan relevan.
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
          Gunakan fitur filter keyword untuk membandingkan hasil dari topik
          penelitian yang berbeda.
        </GuideTip>

        <GuideTip>
          Pastikan rentang tahun yang dipilih mencakup publikasi terbaru agar
          literatur tetap relevan dengan perkembangan terkini.
        </GuideTip>

        <GuideTip>
          Jika hasil fetch terlalu sedikit, perlebar rentang tahun atau revisi
          keyword dengan sinonim atau istilah terkait.
        </GuideTip>
      </GuideSection>
    </Box>
  );
}
