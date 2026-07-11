'use client';

import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function DashboardGuide() {
  return (
    <>
      <GuideInfo>
        Dashboard merupakan halaman utama untuk membuat, mengelola, dan membuka
        topik Systematic Literature Review (SLR).
      </GuideInfo>

      <GuideSection title="Memulai Penelitian">
        <GuideStep
          number={1}
          title="Buat Topik Baru"
          description="Klik tombol Buat Baru kemudian masukkan judul penelitian dan pilih basis data literatur ilmiah."
        />

        <GuideStep
          number={2}
          title="Pilih Basis Data"
          description="Pilih Scopus atau PubMed sebagai sumber artikel yang akan digunakan selama proses SLR."
        />

        <GuideStep
          number={3}
          title="Mulai SLR"
          description="Klik tombol Mulai pada salah satu topik untuk masuk ke workflow Systematic Literature Review."
        />
      </GuideSection>

      <GuideSection title="Mengelola Topik">
        <GuideStep
          number={1}
          title="Edit Topik"
          description="Gunakan tombol Edit untuk mengubah judul penelitian atau basis data."
        />

        <GuideStep
          number={2}
          title="Hapus Topik"
          description="Gunakan tombol Hapus untuk menghapus topik penelitian secara permanen."
        />

        <GuideStep
          number={3}
          title="Informasi Card"
          description="Setiap card menampilkan jumlah Keyword, Artikel yang berhasil diperoleh, serta jumlah artikel yang telah diekstraksi."
        />
      </GuideSection>

      <GuideInfo>
        Menghapus topik penelitian akan menghapus seluruh proses SLR yang
        terkait dan tidak dapat dibatalkan.
      </GuideInfo>
    </>
  );
}
