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

      <GuideSection title="Informasi yang Ditampilkan">
        <GuideStep
          number={1}
          title="Authors & Tahun"
          description="Nama penulis dan tahun publikasi artikel."
        />

        <GuideStep
          number={2}
          title="Negara"
          description="Negara asal penulis atau afiliasi penelitian."
        />

        <GuideStep
          number={3}
          title="Metode Penelitian"
          description="Metode penelitian yang digunakan dalam artikel."
        />

        <GuideStep
          number={4}
          title="Kategori Tematik"
          description="Kategori yang dipilih secara manual berdasarkan setup yang telah dibuat."
        />
      </GuideSection>

      <GuideSection title="Tips Klasifikasi Manual">
        <GuideStep
          number={1}
          title="Baca dengan Teliti"
          description="Pastikan membaca konten artikel secara keseluruhan sebelum menentukan kategori."
        />

        <GuideStep
          number={2}
          title="Konsistensi Kategori"
          description="Gunakan kategori yang konsisten untuk artikel-artikel dengan tema yang serupa."
        />

        <GuideStep
          number={3}
          title="Catat Teori Pendukung"
          description="Gunakan fitur teori/notes untuk mencatat alasan pemilihan kategori tertentu."
        />

        <GuideStep
          number={4}
          title="Review Klasifikasi"
          description="Periksa kembali semua klasifikasi untuk memastikan tidak ada artikel yang terlewat."
        />
      </GuideSection>
    </Box>
  );
}
