'use client';

import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import React, { useState } from 'react';
import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';

export default function AcquisitionGuide() {
  const [activeTab, setActiveTab] = useState('kriteria');

  return (
    <Box sx={{ maxHeight: '74.5vh', overflowY: 'auto', pr: 1 }}>
      {/* Tab Navigation (Boxed / Kotak-kotak Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-gray-100 p-1.5 rounded-lg border border-gray-200 mb-4">
        <button
          className={`py-2 px-2 text-xs font-medium rounded-md transition-all text-center ${
            activeTab === 'kriteria'
              ? 'bg-white text-blue-600 shadow-sm font-semibold border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('kriteria')}
        >
          Kriteria Kata Kunci
        </button>
        <button
          className={`py-2 px-2 text-xs font-medium rounded-md transition-all text-center ${
            activeTab === 'operator'
              ? 'bg-white text-blue-600 shadow-sm font-semibold border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('operator')}
        >
          Kata Kunci
        </button>
        <button
          className={`py-2 px-2 text-xs font-medium rounded-md transition-all text-center ${
            activeTab === 'langkah'
              ? 'bg-white text-blue-600 shadow-sm font-semibold border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('langkah')}
        >
          Langkah Akusisi
        </button>
        <button
          className={`py-2 px-2 text-xs font-medium rounded-md transition-all text-center ${
            activeTab === 'ringkasan'
              ? 'bg-white text-blue-600 shadow-sm font-semibold border border-gray-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
          onClick={() => setActiveTab('ringkasan')}
        >
          Hasil
        </button>
      </div>

      {/* TAB 1: Kriteria Kata Kunci */}
      {activeTab === 'kriteria' && (
        <>
          <GuideSection title="Kriteria Kata Kunci SLR">
            <GuideStep
              number={1}
              title="Pecah Topik Menjadi Komponen Utama"
              description="Ambil istilah penting dari topik Anda berdasarkan elemen dasarnya: Siapa objeknya (Populasi/Subjek), Apa solusi/metodenya (Intervensi), dan Apa yang ingin diukur (Hasil/Outcome)."
            />

            <GuideStep
              number={2}
              title="Siapkan Sinonim & Variasi Ejaan"
              description="Memakai istilah berbeda untuk hal yang sama. Kumpulkan sinonim, singkatan, atau istilah bahasa Inggrisnya (misal: 'Artificial Intelligence' dan 'AI')."
            />

            <GuideStep
              number={3}
              title="Spesifik & Hindari Kata Yang Terlalu Umum"
              description="Hindari kata berdiri sendiri yang terlalu luas seperti 'Sistem', 'Aplikasi', atau 'Analisis'. Kata yang terlalu umum akan memicu ribuan artikel yang tidak relevan."
            />
          </GuideSection>

          {/* Contoh Praktis & Visual */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-700 space-y-2 mt-3">
            <p className="font-semibold text-gray-900">Contoh Pengelompokan Kata Kunci:</p>
            
            <div className="space-y-1">
              <p className="text-gray-600 font-medium">1. Hubungkan Sinonim dengan <b>OR</b>:</p>
              <p className="pl-2 border-l-2 border-blue-400 font-mono bg-white p-1 rounded">
                ("TikTok" <b>OR</b> "Social Media" <b>OR</b> "Instagram")
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-gray-600 font-medium">2. Hubungkan Antar-Komponen dengan <b>AND</b>:</p>
              <p className="pl-2 border-l-2 border-green-400 font-mono bg-white p-1 rounded">
                ("TikTok" <b>OR</b> "Social Media") <b>AND</b> ("Social Anxiety" <b>OR</b> "Mental Health")
              </p>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: Operator Logika (Query Builder) */}
      {activeTab === 'operator' && (
        <GuideSection title="Penyusunan Kata Kunci dengan Operator Logika">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontSize: '11px' }}
          >
            Anda dapat merangkai kata kunci secara visual menggunakan operator logika Boolean:
          </Typography>
          <List dense disablePadding sx={{ pl: 2, mb: 1 }}>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary="Kata Kunci Pertama"
                secondary="Ketik kata kunci awal Anda pada kolom input, lalu tekan Enter atau tombol Tambah (+)."
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '11px',
                      color: 'text.primary',
                      fontWeight: 600,
                    },
                  },
                  secondary: {
                    sx: { fontSize: '11px', color: 'text.secondary' },
                  },
                }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary="Operator Logika (AND, OR, NOT)"
                secondary="Gunakan AND untuk menggabungkan topik berbeda, OR untuk menghubungkan sinonim/variasi kata, dan NOT untuk mengecualikan istilah tertentu."
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '11px',
                      color: 'text.primary',
                      fontWeight: 600,
                    },
                  },
                  secondary: {
                    sx: { fontSize: '11px', color: 'text.secondary' },
                  },
                }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary="Ubah Operator Cepat"
                secondary="Klik langsung pada chip badge operator (AND/OR/NOT) di area visual untuk mengubah hubungan antar kata kunci secara interaktif."
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '11px',
                      color: 'text.primary',
                      fontWeight: 600,
                    },
                  },
                  secondary: {
                    sx: { fontSize: '11px', color: 'text.secondary' },
                  },
                }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary="Menghapus Kata Kunci"
                secondary="Klik ikon silang (x) pada chip kata kunci yang ingin dihapus dari susunan."
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '11px',
                      color: 'text.primary',
                      fontWeight: 600,
                    },
                  },
                  secondary: {
                    sx: { fontSize: '11px', color: 'text.secondary' },
                  },
                }}
              />
            </ListItem>
          </List>
        </GuideSection>
      )}

      {/* TAB 3: Langkah-Langkah di Halaman */}
      {activeTab === 'langkah' && (
        <GuideSection title="Langkah-Langkah Pengambilan Data">
          <GuideStep
            number={1}
            title="Rangkai atau Edit Kata Kunci"
            description="Gunakan Keyword Builder di panel kiri. Jika kata kunci sudah ada dari database, sistem akan otomatis menampilkan susunan kuncinya dan Anda dapat langsung mengeditnya."
          />

          <GuideStep
            number={2}
            title="Simpan / Update"
            description="Periksa pratinjau string pada 'OUTPUT KATA KUNCI'. Klik tombol 'Simpan Kata Kunci' untuk menyimpan atau memperbarui data yang sudah ada."
          />

          <GuideStep
            number={3}
            title="Fetch Metadata"
            description="Tentukan rentang tahun dan tier jurnal (jika menggunakan database Scopus) pada panel detail, lalu klik 'Fetch Metadata' untuk menarik data artikel."
          />

          <GuideStep
            number={4}
            title="Review Hasil Fetch"
            description="Periksa dialog preview yang muncul untuk memastikan pratinjau jumlah dan sampel artikel sudah sesuai."
          />

          <GuideStep
            number={5}
            title="Lihat Hasil"
            description="Pantau proses penarikan data pada progress bar di pojok kanan bawah halaman. Setelah selesai, buka tab Ringkasan atau Daftar Artikel untuk mengevaluasi data."
          />
        </GuideSection>
      )}

      {/* TAB 4: Ringkasan Hasil Metadata */}
      {activeTab === 'ringkasan' && (
        <GuideSection title="Ringkasan Hasil Pengambilan Metadata">
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1, fontSize: '11px' }}
          >
            Evaluasi penarikan data mencakup hal-hal berikut:
          </Typography>
          <List dense disablePadding sx={{ pl: 2, mb: 1 }}>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary="Total Artikel Preview: Jumlah keseluruhan artikel yang ditemukan saat pratinjau."
                slotProps={{
                  primary: { sx: { fontSize: '11px', color: 'text.secondary' } },
                }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary="Artikel Diperoleh: Jumlah artikel yang berhasil lolos kriteria filtering."
                slotProps={{
                  primary: { sx: { fontSize: '11px', color: 'text.secondary' } },
                }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary="Duplikat: Artikel yang teridentifikasi ganda atau sudah ada sebelumnya."
                slotProps={{
                  primary: { sx: { fontSize: '11px', color: 'text.secondary' } },
                }}
              />
            </ListItem>
            <ListItem disablePadding sx={{ py: 0.25 }}>
              <ListItemText
                primary="Tier Tidak Cocok: Artikel dari jurnal yang di luar kuartil pilihan."
                slotProps={{
                  primary: { sx: { fontSize: '11px', color: 'text.secondary' } },
                }}
              />
            </ListItem>
          </List>
        </GuideSection>
      )}
    </Box>
  );
}