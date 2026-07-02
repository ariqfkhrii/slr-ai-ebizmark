'use client';

import { Box } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function AutoReportingGuide() {
  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Auto Reporting menggunakan Gemini 2.5 Flash untuk menghasilkan narasi
        laporan SIR (Systematic Literature Review) berbasis PRISMA secara
        otomatis dari artikel-artikel yang telah di-include.
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
          description="Jumlah artikel yang telah lolos screening dan digunakan sebagai konteks AI untuk menghasilkan laporan."
        />

        <GuideStep
          number={3}
          title="PRISMA Sections"
          description="Total bagian laporan yang akan di-generate sesuai dengan panduan PRISMA (Introduction, Methods, Results, Discussion)."
        />

        <GuideStep
          number={4}
          title="AI Generated"
          description="Jumlah bagian yang telah berhasil di-generate oleh AI dan persentase progres penyelesaian."
        />
      </GuideSection>

      <GuideSection title="Cara Generate Laporan">
        <GuideStep
          number={1}
          title="Generate per Item"
          description="Klik tombol 'GENERATE AI' pada setiap item untuk menghasilkan narasi secara individu."
        />

        <GuideStep
          number={2}
          title="Generate per Chapter"
          description="Gunakan tombol 'GENERATE ALL' untuk menghasilkan seluruh item dalam satu chapter sekaligus."
        />

        <GuideStep
          number={3}
          title="View / Edit"
          description="Klik 'VIEW / EDIT' untuk melihat dan mengedit hasil generate AI sebelum disimpan."
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

      <GuideSection title="Tips Auto Reporting">
        <GuideStep
          number={1}
          title="Pastikan Artikel Lengkap"
          description="Semua artikel yang di-include harus memiliki data lengkap untuk hasil generate yang akurat."
        />

        <GuideStep
          number={2}
          title="Generate Bertahap"
          description="Generate per bagian terlebih dahulu untuk memastikan kualitas, baru lanjut ke bagian berikutnya."
        />

        <GuideStep
          number={3}
          title="Review Hasil"
          description="Selalu review dan edit hasil generate AI untuk memastikan akurasi dan kesesuaian dengan konteks penelitian."
        />

        <GuideStep
          number={4}
          title="Pantau Progres"
          description="Perhatikan metrik 'AI Generated' untuk mengetahui progres penyelesaian laporan secara keseluruhan."
        />
      </GuideSection>
    </Box>
  );
}
