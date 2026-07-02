'use client';

import { Box } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function ManualExtractionGuide() {
  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Ekstraksi manual dilakukan dengan mengisi langsung setiap bagian artikel
        berdasarkan hasil membaca full paper yang telah disinkronisasi.
      </GuideInfo>

      <GuideSection title="Langkah Ekstraksi Manual">
        <GuideStep
          number={1}
          title="Baca Full Paper"
          description="Baca seluruh isi paper yang telah disinkronisasi untuk memahami konten secara menyeluruh."
        />

        <GuideStep
          number={2}
          title="Isi Komponen"
          description="Masukkan informasi ke dalam setiap komponen yang tersedia berdasarkan hasil pembacaan paper."
        />

        <GuideStep
          number={3}
          title="Simpan Perubahan"
          description="Klik tombol 'Save Changes' untuk menyimpan hasil ekstraksi manual yang telah diisi."
        />
      </GuideSection>

      <GuideSection title="Komponen yang Diisi Manual">
        <GuideStep
          number={1}
          title="Abstract"
          description="Tulis ringkasan penelitian yang mencakup latar belakang, tujuan, metode, hasil, dan kesimpulan."
        />

        <GuideStep
          number={2}
          title="Introduction"
          description="Tulis latar belakang masalah, tinjauan literatur, dan tujuan penelitian."
        />

        <GuideStep
          number={3}
          title="Result"
          description="Tulis temuan utama dari penelitian yang disajikan dalam bentuk data dan analisis."
        />

        <GuideStep
          number={4}
          title="Conclusion"
          description="Tulis kesimpulan dari hasil penelitian dan implikasinya."
        />

        <GuideStep
          number={5}
          title="Recommendation"
          description="Tulis rekomendasi untuk penelitian atau praktik selanjutnya."
        />

        <GuideStep
          number={6}
          title="Novelty Gap"
          description="Tulis kebaruan atau kesenjangan penelitian yang diisi oleh studi ini."
        />

        <GuideStep
          number={7}
          title="Limitation"
          description="Tulis keterbatasan yang dihadapi dalam penelitian."
        />

        <GuideStep
          number={8}
          title="Future Research"
          description="Tulis arah penelitian yang dapat dilakukan di masa mendatang."
        />
      </GuideSection>

      <GuideSection title="Tips Ekstraksi Manual">
        <GuideStep
          number={1}
          title="Baca dengan Teliti"
          description="Pastikan membaca paper secara keseluruhan sebelum mengisi komponen untuk menghindari informasi yang terlewat."
        />

        <GuideStep
          number={2}
          title="Gunakan Bahasa Sendiri"
          description="Tulis hasil ekstraksi dengan bahasa sendiri yang mudah dipahami, tidak perlu menyalin persis dari paper."
        />

        <GuideStep
          number={3}
          title="Periksa Kembali"
          description="Review kembali setiap komponen yang telah diisi untuk memastikan akurasi dan kelengkapan informasi."
        />
      </GuideSection>
    </Box>
  );
}
