'use client';

import { Box, Typography } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';
import GuideTip from './components/GuideTip';

export default function ScreeningGuide() {
  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Tahap Screening digunakan untuk menyeleksi artikel yang relevan dengan
        topik SLR dan atau kata kunci pencarian, artikel dengan status include
        akan diproses ke tahap berikutnya, sedangkan artikel dengan status
        exclude tidak akan diproses ke tahap berikutnya.
      </GuideInfo>

      <GuideSection title="Tahapan Screening">
        <GuideStep
          number={1}
          title="Review Judul"
          description="Periksa kesesuaian judul artikel dengan topik SLR dan atau kata kunci pencarian."
        />

        <GuideStep
          number={2}
          title="Review Abstrak"
          description="Baca abstrak sebelum menentukan status inklusi eksklusi."
        />

        <GuideStep
          number={3}
          title="Urutkan Berdasarkan Skor Similarity"
          description="Urutkan artikel berdasarkan skor similarity dengan menekan tombol 'Urutkan Relevansi' untuk memudahkan penentuan status inklusi eksklusi."
        />

        <GuideStep
          number={4}
          title="Tetapkan Status"
          description="Klik checkbox pada satu atau beberapa artikel, lalu tekan tombol di antara tabel included dan e"
        />
      </GuideSection>

      <GuideTip>
        <Typography sx={{ fontSize: 13 }}>
          Untuk melakukan inklusi atau eksklusi semua artikel sekaligus, dapat
          menggunakan checkbox di header tabel. Namun, pastikan untuk meninjau
          artikel terlebih dahulu sebelum melakukan inklusi atau eksklusi
          massal.
        </Typography>
      </GuideTip>

      <GuideTip>
        <Typography sx={{ fontSize: 13 }}>
          Gunakan filter berdasarkan pencarian judul atau DOI artikel, tier, dan
          rentang tahun publikasi untuk mempermudah proses screening.
        </Typography>
      </GuideTip>
    </Box>
  );
}
