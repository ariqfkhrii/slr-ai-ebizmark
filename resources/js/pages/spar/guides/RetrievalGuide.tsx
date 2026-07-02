'use client';

import { Box } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function RetrievalGuide() {
  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Retrieval adalah proses pengumpulan full-text PDF dari artikel yang
        telah lolos tahap screening untuk selanjutnya dilakukan ekstraksi
        informasi.
      </GuideInfo>

      <GuideSection title="Status Artikel">
        <GuideStep
          number={1}
          title="Artikel Diperoleh"
          description="Artikel yang sudah memiliki file PDF lengkap dan siap untuk proses ekstraksi."
        />

        <GuideStep
          number={2}
          title="Artikel Belum Diperoleh"
          description="Artikel yang masih memerlukan upload file PDF untuk dapat diproses lebih lanjut."
        />
      </GuideSection>

      <GuideSection title="Cara Upload PDF">
        <GuideStep
          number={1}
          title="Upload Manual"
          description="Drag & drop file PDF atau klik untuk memilih file dari perangkat Anda."
        />

        <GuideStep
          number={2}
          title="Upload & Scan DOI"
          description="Masukkan DOI artikel dan sistem akan mencoba mengambil file PDF secara otomatis melalui Crossref."
        />
      </GuideSection>

      <GuideSection title="Konfigurasi DOI">
        <GuideStep
          number={1}
          title="Pre-link"
          description="URL dasar untuk mengakses DOI, umumnya https://doi.org/"
        />

        <GuideStep
          number={2}
          title="Post-link"
          description="DOI lengkap artikel yang akan diakses, contoh: 10.3390/a19050366"
        />

        <GuideStep
          number={3}
          title="Hasil Link"
          description="Gabungan pre-link dan post-link akan membentuk URL lengkap untuk mengakses artikel."
        />
      </GuideSection>

      <GuideSection title="Informasi Artikel">
        <GuideStep
          number={1}
          title="Judul"
          description="Judul lengkap artikel yang di-retrieval."
        />

        <GuideStep
          number={2}
          title="DOI"
          description="Digital Object Identifier (DOI) sebagai identifikasi unik artikel."
        />

        <GuideStep
          number={3}
          title="Status"
          description="Menunjukkan apakah artikel sudah 'Included' (layak) atau tidak."
        />

        <GuideStep
          number={4}
          title="Quartile & Tahun"
          description="Menunjukkan peringkat jurnal (Q1-Q4) dan tahun publikasi artikel."
        />
      </GuideSection>

      <GuideSection title="Tips Retrieval">
        <GuideStep
          number={1}
          title="Pastikan PDF Lengkap"
          description="Upload file PDF yang berisi full-text artikel, bukan hanya abstrak atau preview."
        />

        <GuideStep
          number={2}
          title="Gunakan DOI yang Valid"
          description="Pastikan DOI yang dimasukkan benar dan dapat diakses melalui Crossref."
        />

        <GuideStep
          number={3}
          title="Periksa Kualitas PDF"
          description="Pastikan PDF dapat dibaca dengan baik dan tidak rusak sebelum diupload."
        />
      </GuideSection>
    </Box>
  );
}
