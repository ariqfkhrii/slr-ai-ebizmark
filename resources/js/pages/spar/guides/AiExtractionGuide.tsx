'use client';

import { Box } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function AiExtractionGuide() {
  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Ekstraksi otomatis menggunakan AI untuk mengambil informasi penting dari
        setiap artikel seperti abstrak, pendahuluan, hasil, kesimpulan, dan
        lainnya.
      </GuideInfo>

      <GuideSection title="Langkah Ekstraksi AI">
        <GuideStep
          number={1}
          title="Sinkronisasi Metadata"
          description="Pastikan semua artikel telah berhasil disinkronisasi dan file TXT telah dibuat secara otomatis."
        />

        <GuideStep
          number={2}
          title="Jalankan Ekstraksi"
          description="Klik tombol 'Mulai Ekstraksi Otomatis' untuk memulai proses ekstraksi AI pada seluruh artikel."
        />

        <GuideStep
          number={3}
          title="Review Hasil"
          description="Periksa hasil ekstraksi pada setiap artikel dan lakukan edit jika diperlukan."
        />
      </GuideSection>

      <GuideSection title="Bagian yang Diekstraksi">
        <GuideStep
          number={1}
          title="Abstract"
          description="Ringkasan penelitian yang mencakup latar belakang, tujuan, metode, hasil, dan kesimpulan."
        />

        <GuideStep
          number={2}
          title="Introduction"
          description="Latar belakang masalah, tinjauan literatur, dan tujuan penelitian."
        />

        <GuideStep
          number={3}
          title="Result"
          description="Temuan utama dari penelitian yang disajikan dalam bentuk data dan analisis."
        />

        <GuideStep
          number={4}
          title="Conclusion"
          description="Kesimpulan dari hasil penelitian dan implikasinya."
        />

        <GuideStep
          number={5}
          title="Recommendation"
          description="Rekomendasi untuk penelitian atau praktik selanjutnya."
        />

        <GuideStep
          number={6}
          title="Novelty Gap"
          description="Kebaruan atau kesenjangan penelitian yang diisi oleh studi ini."
        />

        <GuideStep
          number={7}
          title="Limitation"
          description="Keterbatasan yang dihadapi dalam penelitian."
        />

        <GuideStep
          number={8}
          title="Future Research"
          description="Arah penelitian yang dapat dilakukan di masa mendatang."
        />
      </GuideSection>
    </Box>
  );
}
