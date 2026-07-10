'use client';

import { Box } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function AutoReportingGuide() {
  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Halaman ini digunakan untuk menyusun laporan secara manual berdasarkan
        panduan PRISMA.
      </GuideInfo>

      <GuideSection title="Metrik Laporan">
        <GuideStep
          number={1}
          title="Research Plan"
          description="Nama dan ID dari rencana penelitian yang sedang dikerjakan."
        />

        <GuideStep
          number={2}
          title="Included Articles"
          description="Jumlah artikel yang telah lolos screening dan digunakan sebagai konteks laporan."
        />

        <GuideStep
          number={3}
          title="PRISMA Sections"
          description="Total bagian laporan yang harus diselesaikan sesuai panduan PRISMA."
        />

        <GuideStep
          number={4}
          title="Bagian Selesai"
          description="Jumlah bagian yang telah selesai ditulis dan persentase progres penyelesaian."
        />
      </GuideSection>

      <GuideSection title="Cara Menyusun Laporan">
        <GuideStep
          number={1}
          title="Edit per Item"
          description="Klik tombol 'Lihat / Edit' pada setiap item untuk menulis atau menyempurnakan narasi."
        />

        <GuideStep
          number={2}
          title="Simpan Perubahan"
          description="Setelah mengedit, simpan perubahan untuk memperbarui laporan."
        />

        <GuideStep
          number={3}
          title="Cek Section"
          description="Pastikan setiap section PRISMA ditutup dengan lengkap sebelum melanjutkan."
        />
      </GuideSection>

      <GuideSection title="Bagian PRISMA">
        <GuideStep
          number={1}
          title="Rationale"
          description="Jelaskan rasional atau alasan dilakukannya review dalam konteks pengetahuan yang ada."
        />

        <GuideStep
          number={2}
          title="Objectives"
          description="Tulis pernyataan yang jelas tentang tujuan atau pertanyaan yang dijawab oleh review."
        />

        <GuideStep
          number={3}
          title="Methods"
          description="Metode yang digunakan dalam review termasuk kriteria inklusi, sumber data, dan strategi pencarian."
        />

        <GuideStep
          number={4}
          title="Results"
          description="Hasil dari review termasuk karakteristik studi dan temuan utama."
        />

        <GuideStep
          number={5}
          title="Discussion"
          description="Pembahasan hasil review, interpretasi, dan implikasinya."
        />
      </GuideSection>

      <GuideSection title="Tips Manual">
        <GuideStep
          number={1}
          title="Pastikan Artikel Lengkap"
          description="Semua artikel yang di-include harus memiliki data lengkap agar narasi akurat."
        />

        <GuideStep
          number={2}
          title="Tulis Bertahap"
          description="Selesaikan setiap bagian secara berurutan untuk menjaga konsistensi."
        />

        <GuideStep
          number={3}
          title="Review Narasi"
          description="Periksa ulang konten dan sesuaikan dengan konteks penelitian sebelum menyimpan."
        />

        <GuideStep
          number={4}
          title="Pantau Progres"
          description="Perhatikan metrik bagian selesai untuk mengetahui status laporan."
        />
      </GuideSection>
    </Box>
  );
}
