'use client';

import { Box } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function ManualClassificationGuide() {
  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Klasifikasi manual dilakukan dengan mengisi kategori tematik pada setiap
        artikel secara langsung berdasarkan hasil pembacaan konten artikel.
      </GuideInfo>
      <GuideSection title="Setup Kategori">
        <GuideStep
          number={1}
          title="Tentukan Kategori"
          description="Buat hingga 6 kategori tematik yang akan digunakan untuk mengklasifikasikan artikel."
        />

        <GuideStep
          number={2}
          title="Tambahkan Teori"
          description="Tambahkan teori atau catatan yang relevan sebagai panduan dalam proses klasifikasi manual."
        />

        <GuideStep
          number={3}
          title="Simpan Setup"
          description="Klik 'Save Setup' untuk menyimpan konfigurasi kategori sebelum melakukan klasifikasi manual."
        />
      </GuideSection>
      <GuideSection title="Proses Klasifikasi Manual">
        <GuideStep
          number={1}
          title="Baca Artikel"
          description="Baca konten setiap artikel untuk memahami topik dan tema yang dibahas."
        />

        <GuideStep
          number={2}
          title="Pilih Kategori"
          description="Pilih kategori yang sesuai dari setup yang telah dibuat untuk setiap artikel."
        />

        <GuideStep
          number={3}
          title="Simpan Klasifikasi"
          description="Simpan klasifikasi untuk setiap artikel dengan mengklik ikon centang (✔) pada kolom Action."
        />
      </GuideSection>
      <GuideSection title="Contoh Kategori Tematik yang Dapat Digunakan">
        <GuideStep
          number={1}
          title="Technology & Infrastructure"
          description="Membahas teknologi, arsitektur, infrastruktur, atau platform yang digunakan dalam penerapan sistem."
        />

        <GuideStep
          number={2}
          title="Methods & Algorithms"
          description="Berfokus pada metode, algoritma, model, atau pendekatan yang digunakan untuk menyelesaikan permasalahan penelitian."
        />

        <GuideStep
          number={3}
          title="Implementation & Applications"
          description="Membahas penerapan metode atau teknologi pada sistem, aplikasi, atau lingkungan tertentu."
        />

        <GuideStep
          number={4}
          title="Evaluation & Performance"
          description="Membahas evaluasi, pengujian, kinerja, efektivitas, atau perbandingan metode dan sistem."
        />

        <GuideStep
          number={5}
          title="Challenges & Limitations"
          description="Membahas permasalahan, tantangan, keterbatasan, atau hambatan dalam penerapan metode atau teknologi."
        />

        <GuideStep
          number={6}
          title="Trends & Future Development"
          description="Membahas perkembangan, tren penelitian, inovasi, atau arah pengembangan penelitian di masa mendatang."
        />
      </GuideSection>
    </Box>
  );
}
