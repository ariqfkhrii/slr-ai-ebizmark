'use client';

import { Box } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function AiClassificationGuide() {
  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Klasifikasi AI secara otomatis mengelompokkan artikel ke dalam kategori
        tematik berdasarkan setup kategori yang telah ditentukan sebelumnya.
      </GuideInfo>

      <GuideSection title="Setup Kategori">
        <GuideStep
          number={1}
          title="Tentukan Kategori"
          description="Buat hingga 6 kategori tematik yang akan digunakan untuk mengklasifikasikan artikel. Contoh: 'domain research', 'metodologi', dll."
        />

        <GuideStep
          number={2}
          title="Tambahkan Teori"
          description="Isi teori atau catatan tambahan yang relevan untuk membantu AI dalam proses klasifikasi."
        />

        <GuideStep
          number={3}
          title="Simpan Setup"
          description="Klik 'Save Setup' untuk menyimpan konfigurasi kategori sebelum menjalankan klasifikasi AI."
        />
      </GuideSection>

      <GuideSection title="Proses Klasifikasi AI">
        <GuideStep
          number={1}
          title="Jalankan Klasifikasi"
          description="Klik tombol 'AI Classification' untuk memulai proses klasifikasi otomatis pada seluruh artikel yang telah di-retrieve."
        />

        <GuideStep
          number={2}
          title="Proses Otomatis"
          description="AI akan menganalisis konten setiap artikel dan menetapkan kategori yang paling sesuai dari setup yang telah dibuat."
        />

        <GuideStep
          number={3}
          title="Hasil Klasifikasi"
          description="Hasil klasifikasi akan ditampilkan pada tabel dengan kategori yang dipilih AI untuk setiap artikel."
        />
      </GuideSection>

      <GuideSection title="Informasi yang Ditampilkan">
        <GuideStep
          number={1}
          title="Authors & Tahun"
          description="Nama penulis dan tahun publikasi artikel."
        />

        <GuideStep
          number={2}
          title="Country"
          description="Negara asal penulis atau afiliasi penelitian."
        />

        <GuideStep
          number={3}
          title="Research Method"
          description="Metode penelitian yang digunakan dalam artikel."
        />

        <GuideStep
          number={4}
          title="Kategori Tematik"
          description="Hasil klasifikasi AI berdasarkan setup kategori yang telah ditentukan."
        />
      </GuideSection>

      <GuideSection title="Tips Klasifikasi AI">
        <GuideStep
          number={1}
          title="Kategori Spesifik"
          description="Buat kategori yang spesifik dan jelas agar AI dapat mengklasifikasikan dengan lebih akurat."
        />

        <GuideStep
          number={2}
          title="Teori Pendukung"
          description="Tambahkan teori atau catatan untuk membantu AI memahami konteks kategori yang dibuat."
        />

        <GuideStep
          number={3}
          title="Review Hasil"
          description="Selalu review hasil klasifikasi AI dan lakukan koreksi manual jika diperlukan."
        />
      </GuideSection>
    </Box>
  );
}
