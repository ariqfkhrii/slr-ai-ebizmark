'use client';

import GuideInfo from './components/GuideInfo';
import GuideSection from './components/GuideSection';
import GuideStep from './components/GuideStep';
import React, { useState } from "react";

export default function DashboardGuide() {
  const [activeTab, setActiveTab] = useState("kriteria");

  return (
    <div className="space-y-4">
      {/* Tab Navigation (Boxed / Kotak-kotak Style) */}
      <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1.5 rounded-lg border border-gray-200">
        <button
          className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-all text-center ${
            activeTab === "kriteria"
              ? "bg-white text-blue-600 shadow-sm font-semibold border border-gray-200"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("kriteria")}
        >
          Kriteria Topik SLR
        </button>
        <button
          className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-all text-center ${
            activeTab === "kelola"
              ? "bg-white text-blue-600 shadow-sm font-semibold border border-gray-200"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("kelola")}
        >
          Membuat & Mengelola
        </button>
        <button
          className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-md transition-all text-center ${
            activeTab === "mulai"
              ? "bg-white text-blue-600 shadow-sm font-semibold border border-gray-200"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => setActiveTab("mulai")}
        >
          Mulai SLR
        </button>
      </div>

      {/* TAB 1: Kriteria Topik SLR */}
      {activeTab === "kriteria" && (
        <>
          <GuideSection title="Kriteria Input Topik SLR">
            <GuideStep
              number={1}
              title="Fokus & Spesifik"
              description="Hindari topik yang terlalu umum seperti 'Media Sosial' atau 'Pendidikan'. Persempit ke intervensi atau dampak yang spesifik agar jumlah artikel relevan terukur."
            />

            <GuideStep
              number={2}
              title="Mengandung Elemen yang Jelas"
              description="Susun topik Anda agar menjawab 3 hal dasar: Siapa yang diteliti (subjek), Apa metode/faktor yang diuji, dan Apa perubahan atau hasil yang ingin diukur."
            />

            <GuideStep
              number={3}
              title="Memiliki Kecukupan Literatur Terdahulu"
              description="SLR merangkum studi empiris yang sudah ada. Pastikan topik Anda bukan isu yang sama sekali baru tanpa adanya artikel ilmiah terkait di database."
            />

            <GuideStep
              number={4}
              title="Berorientasi Evaluasi atau Perbandingan"
              description="Topik sebaiknya bertujuan untuk mengukur dampak suatu fenomena, membandingkan dua pendekatan sosial/kebijakan, atau menemukan gap penelitian."
            />
          </GuideSection>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700">Contoh Penyusunan Topik:</p>
            <p><b>Topik Umum:</b> "Dampak Media Sosial pada Remaja"</p>
            <p><b>Fokus SLR:</b> "Pengaruh Penggunaan TikTok terhadap Kecemasan Sosial pada Remaja Usia Sekolah Menengah"</p>
          </div>
        </>
      )}

      {/* TAB 2: Membuat, Edit, & Hapus Topik */}
      {activeTab === "kelola" && (
        <>
          <GuideSection title="Membuat Topik Baru">
            <GuideStep
              number={1}
              title="Buat Topik Baru"
              description="Klik tombol 'Buat Baru' pada dashboard untuk membuka formulir pembuat topik."
            />

            <GuideStep
              number={2}
              title="Isi Judul & Pilih Basis Data"
              description="Masukkan judul penelitian yang telah memenuhi kriteria SLR, lalu pilih basis data literatur yang sesuai dengan cakupan penelitian Anda."
            />
          </GuideSection>

          {/* Penjelasan Perbedaan Basis Data (Scopus vs PubMed) */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900 space-y-2">
            <p className="font-semibold text-blue-950">💡 Perbedaan Cakupan Pencarian Basis Data:</p>
            <p>
              Pemilihan basis data menentukan jenis dan cakupan artikel ilmiah yang akan ditemukan oleh sistem:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-blue-900">
              <li>
                <b>PubMed:</b> Berfokus khusus pada literatur bidang biomedis dan kesehatan dengan pembaruan artikel terkini yang sangat cepat.
              </li>
              <li>
                <b>Scopus:</b> Memiliki cakupan jurnal yang jauh lebih luas untuk berbagai disiplin ilmu dengan jumlah hasil pencarian artikel yang lebih banyak untuk publikasi rilisan terbaru.
              </li>
            </ul>
          </div>

          <GuideSection title="Mengelola Topik">
            <GuideStep
              number={1}
              title="Edit Topik"
              description="Gunakan tombol Edit pada card topik untuk mengubah judul penelitian atau memperbarui basis data jika diperlukan."
            />

            <GuideStep
              number={2}
              title="Hapus Topik"
              description="Gunakan tombol Hapus untuk membersihkan topik yang tidak digunakan secara permanen."
            />

            <GuideStep
              number={3}
              title="Informasi Card Topik"
              description="Setiap card topik menampilkan infomrasi ringkas: Artikel yang terkumpul dan Artikel yang berhasil diekstraksi."
            />
          </GuideSection>

          <GuideInfo>
            ⚠️ <b>Perhatian:</b> Menghapus topik penelitian akan menghapus
            seluruh data dari proses SLR yang terkait. Tindakan ini tidak
            dapat dibatalkan.
          </GuideInfo>
        </>
      )}

      {/* TAB 3: Mulai SLR */}
      {activeTab === "mulai" && (
        <>
          <GuideInfo>
            Setelah topik berhasil dibuat dan diperiksa kriterianya, Anda siap
            masuk ke dalam workflow SLR.
          </GuideInfo>

          <GuideSection title="Langkah Memulai Workflow SLR">
            <GuideStep
              number={1}
              title="Pilih Topik Penelitian"
              description="Cari topik yang ingin Anda kerjakan."
            />

            <GuideStep
              number={2}
              title="Klik Tombol 'Mulai SLR'"
              description="Klik tombol 'Mulai SLR' pada topik tersebut."
            />

            <GuideStep
              number={3}
              title="Masuk ke Workflow SLR"
              description="Sistem akan mengarahkan Anda ke tahapan pertama dalam melakukan SLR."
            />
          </GuideSection>
        </>
      )}
    </div>
  );
}