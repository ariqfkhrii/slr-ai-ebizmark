'use client';

import { Box } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function AutoReportingGuide() {
  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Halaman ini digunakan untuk menampilkan laporan SLR berbentuk PRISMA
        Flow Diagram.
      </GuideInfo>

      <GuideSection title="Metrik Laporan">
        <GuideStep
          number={1}
          title="Included Articles"
          description="Jumlah artikel yang telah lolos screening dan digunakan sebagai konteks laporan."
        />

        <GuideStep
          number={2}
          title="PRISMA Sections"
          description="Total bagian laporan yang harus diselesaikan sesuai panduan PRISMA."
        />

        <GuideStep
          number={3}
          title="Bagian Selesai"
          description="Jumlah bagian yang telah selesai ditulis dan persentase progres penyelesaian."
        />
      </GuideSection>
    </Box>
  );
}
