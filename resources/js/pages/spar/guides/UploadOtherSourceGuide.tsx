'use client';

import { Box, Typography } from '@mui/material';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';
import GuideTip from './components/GuideTip';

export default function UploadOtherSourceGuide() {
  return (
    <Box sx={{ maxHeight: '87.5vh', overflowY: 'auto', pr: 1 }}>
      <GuideInfo>
        Fitur Unggah Sumber Lain digunakan untuk menambahkan artikel yang
        diperoleh dari sumber selain Scopus dan PubMed ke dalam proses SLR.
        Artikel yang berhasil ditambahkan akan tetap dapat diproses dalam SLR.
      </GuideInfo>

      <GuideSection title="Tahap Unggah PDF">
        <GuideStep
          number={1}
          title="Pilih File PDF"
          description="Pilih file PDF artikel yang ingin ditambahkan atau seret file ke area unggah (Drag and Drop)."
        />

        <GuideStep
          number={2}
          title="Periksa Format File"
          description="Pastikan file yang diunggah berformat PDF. Sistem hanya menerima file dengan format PDF."
        />

        <GuideStep
          number={3}
          title="Periksa Ukuran File"
          description="Pastikan ukuran file tidak lebih dari 50 MB. File yang melebihi batas ukuran tidak dapat diunggah."
        />

        <GuideStep
          number={4}
          title="Konfirmasi File"
          description="Setelah file berhasil dipilih, periksa nama dan informasi file kemudian klik 'Konfirmasi' untuk melanjutkan ke tahap pengisian metadata."
        />
      </GuideSection>

      <GuideSection title="Tahap Pengisian Metadata">
        <GuideStep
          number={1}
          title="Isi Metadata Artikel"
          description="Isi metadata artikel secara manual berdasarkan informasi yang terdapat pada artikel."
        />

        <GuideStep
          number={2}
          title="Pilih Keyword Topik SLR"
          description="Pilih kata kunci dari topik SLR yang sesuai dengan artikel yang sedang ditambahkan."
        />

        <GuideStep
          number={3}
          title="Periksa Metadata"
          description="Pastikan informasi metadata yang dimasukkan sudah sesuai dengan artikel, terutama judul, penulis, keyword, dan tahun publikasi."
        />

        <GuideStep
          number={4}
          title="Simpan Artikel"
          description="Klik 'Simpan Artikel' untuk menyimpan PDF beserta metadata artikel ke dalam daftar artikel yang tersedia."
        />
      </GuideSection>

      <GuideSection title="Metadata yang Perlu Diisi">
        <GuideStep
          number={1}
          title="DOI"
          description="Masukkan DOI artikel jika artikel memiliki DOI."
        />

        <GuideStep
          number={2}
          title="Judul"
          description="Masukkan judul artikel sesuai dengan judul yang tercantum pada dokumen PDF."
        />

        <GuideStep
          number={3}
          title="Author"
          description="Masukkan nama penulis artikel sesuai dengan informasi pada artikel."
        />

        <GuideStep
          number={4}
          title="Tier Artikel"
          description="Pilih tier jurnal artikel jika diketahui. Pilih 'Tidak ada' jika artikel tidak memiliki atau tidak diketahui tier-nya."
        />

        <GuideStep
          number={5}
          title="Kata Kunci Topik SLR"
          description="Pilih keyword dari topik SLR yang menjadi dasar keterkaitan artikel dengan kajian yang dilakukan."
        />

        <GuideStep
          number={6}
          title="Kata Kunci Artikel"
          description="Masukkan kata kunci yang tercantum pada metadata artikel."
        />

        <GuideStep
          number={7}
          title="Jumlah Sitasi"
          description="Masukkan jumlah sitasi artikel jika informasi tersebut tersedia."
        />

        <GuideStep
          number={8}
          title="Tahun Publikasi"
          description="Masukkan tahun publikasi artikel sesuai dengan informasi pada artikel."
        />

        <GuideStep
          number={9}
          title="Abstrak"
          description="Masukkan abstrak artikel sesuai dengan abstrak yang tercantum pada dokumen."
        />
      </GuideSection>

      <GuideTip>
        <Typography sx={{ fontSize: 13 }}>
          Gunakan fitur ini ketika artikel yang relevan diperoleh dari sumber
          lain di luar Scopus dan PubMed, tetapi tetap ingin memasukkannya ke
          dalam proses SLR.
        </Typography>
      </GuideTip>

      <GuideTip>
        <Typography sx={{ fontSize: 13 }}>
          Pastikan metadata yang dimasukkan sesuai dengan artikel asli karena
          informasi tersebut akan digunakan pada tahapan SLR berikutnya.
        </Typography>
      </GuideTip>
    </Box>
  );
}
