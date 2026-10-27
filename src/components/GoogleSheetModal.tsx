import React, { useState, useEffect } from 'react';
import { sheetService } from '../utils/sheetService';
import { JournalDay, LkpdData } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  allGroupJournals: Record<number, JournalDay[]>;
  onApplyImportedData: (data: Record<number, JournalDay[]>) => void;
  allGroupLkpd?: Record<number, LkpdData>;
  onApplyImportedLkpd?: (data: Record<number, LkpdData>) => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  allGroupJournals,
  onApplyImportedData,
  allGroupLkpd,
  onApplyImportedLkpd,
}) => {
  const [webAppUrl, setWebAppUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'sync' | 'code' | 'guide'>('sync');
  const [testing, setTesting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncingLkpd, setSyncingLkpd] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchingLkpd, setFetchingLkpd] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWebAppUrl(sheetService.getWebAppUrl());
      setStatusMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveUrl = () => {
    sound.playPop();
    sheetService.setWebAppUrl(webAppUrl);
    setStatusMessage({
      type: 'success',
      text: 'URL Web App berhasil disimpan di browser ini!',
    });
  };

  const handleTestConnection = async () => {
    sound.playPop();
    setTesting(true);
    setStatusMessage({ type: 'info', text: 'Sedang menghubungi Google Apps Script...' });
    
    sheetService.setWebAppUrl(webAppUrl);
    
    const res = await sheetService.testConnection(webAppUrl);
    setTesting(false);
    if (res.success) {
      sound.playStar();
      setStatusMessage({ type: 'success', text: `🟢 ${res.message}` });
    } else {
      setStatusMessage({ type: 'error', text: `🔴 ${res.message}` });
    }
  };

  const handleSyncAll = async () => {
    sound.playPop();
    setSyncing(true);
    setStatusMessage({ type: 'info', text: 'Sedang mengirim data pengamatan 5 kelompok ke Google Sheets...' });
    
    sheetService.setWebAppUrl(webAppUrl);
    const res = await sheetService.syncAllGroups(allGroupJournals);
    setSyncing(false);
    
    if (res.success) {
      sound.playFanfare();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
      });
      setStatusMessage({ type: 'success', text: `🎉 ${res.message}` });
    } else {
      setStatusMessage({ type: 'error', text: `⚠️ ${res.message}` });
    }
  };

  const handleSyncAllLkpd = async () => {
    if (!allGroupLkpd) return;
    sound.playPop();
    setSyncingLkpd(true);
    setStatusMessage({ type: 'info', text: 'Sedang mengirim lembar kerja (LKPD 1) seluruh kelompok ke Google Sheets...' });

    sheetService.setWebAppUrl(webAppUrl);
    const res = await sheetService.syncAllLkpd(allGroupLkpd);
    setSyncingLkpd(false);

    if (res.success) {
      sound.playFanfare();
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b'],
      });
      setStatusMessage({ type: 'success', text: `🎉 ${res.message}` });
    } else {
      setStatusMessage({ type: 'error', text: `⚠️ ${res.message}` });
    }
  };

  const handleFetchAll = async () => {
    sound.playPop();
    setFetching(true);
    setStatusMessage({ type: 'info', text: 'Sedang mengambil data terbaru dari Google Sheets...' });
    
    sheetService.setWebAppUrl(webAppUrl);
    const res = await sheetService.fetchAllGroups();
    setFetching(false);
    
    if (res.success && res.data) {
      sound.playStar();
      onApplyImportedData(res.data);
      setStatusMessage({
        type: 'success',
        text: '✅ Berhasil memuat data dari Google Sheets! Tabel jurnal telah diperbarui.',
      });
    } else {
      setStatusMessage({ type: 'error', text: `⚠️ ${res.message || 'Gagal memuat data.'}` });
    }
  };

  const handleFetchAllLkpd = async () => {
    if (!onApplyImportedLkpd) return;
    sound.playPop();
    setFetchingLkpd(true);
    setStatusMessage({ type: 'info', text: 'Sedang mengambil data LKPD terbaru dari Google Sheets...' });

    sheetService.setWebAppUrl(webAppUrl);
    const res = await sheetService.fetchAllLkpd();
    setFetchingLkpd(false);

    if (res.success && res.data) {
      sound.playStar();
      onApplyImportedLkpd(res.data);
      setStatusMessage({
        type: 'success',
        text: '✅ Berhasil memuat data LKPD dari Google Sheets! Lembar kerja telah disinkronkan.',
      });
    } else {
      setStatusMessage({ type: 'error', text: `⚠️ ${res.message || 'Gagal memuat data LKPD.'}` });
    }
  };

  const handleCopyCode = () => {
    sound.playPop();
    const code = getCodeGsContent();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border-4 border-emerald-400 overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 p-4 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
              📊
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-extrabold font-fun">
                Database Google Sheets
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                Simpan & Sinkronkan Catatan Jurnal 15 Hari ke Google Spreadsheet
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold transition-all cursor-pointer active:scale-95"
            title="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs inside Modal */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-3 gap-2">
          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('sync');
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'bg-white text-emerald-800 border-t-2 border-x-2 border-emerald-400 shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <span>☁️</span>
            <span>Koneksi & Sinkron</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('code');
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-white text-emerald-800 border-t-2 border-x-2 border-emerald-400 shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <span>📜</span>
            <span>Kode.gs (Apps Script)</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              setActiveTab('guide');
            }}
            className={`px-4 py-2.5 rounded-t-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-white text-emerald-800 border-t-2 border-x-2 border-emerald-400 shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <span>📖</span>
            <span>Panduan Pemasangan</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-slate-800">
          {/* TAB 1: SYNC & CONNECTION */}
          {activeTab === 'sync' && (
            <div className="flex flex-col gap-6">
              {/* Web App URL Form */}
              <div className="bg-emerald-50/60 rounded-2xl p-4 sm:p-5 border-2 border-emerald-200">
                <label className="block text-xs sm:text-sm font-bold text-emerald-950 mb-1.5">
                  🔗 Masukkan URL Aplikasi Web Google Apps Script (Web App URL):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={webAppUrl}
                    onChange={(e) => setWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 bg-white border-2 border-emerald-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono text-slate-800 focus:outline-hidden focus:border-emerald-600"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUrl}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={handleTestConnection}
                      disabled={testing || !webAppUrl}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1"
                    >
                      {testing ? '⏳ Menguji...' : '🧪 Tes Koneksi'}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  *URL didapat saat melakukan <strong>Deploy (Terapkan) &gt; New deployment &gt; Web app</strong> pada Google Spreadsheet.
                </p>
              </div>

              {/* Status Message Display */}
              {statusMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold border-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                      : statusMessage.type === 'error'
                      ? 'bg-rose-100 border-rose-400 text-rose-950'
                      : 'bg-sky-100 border-sky-400 text-sky-950'
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              {/* Cloud Sync Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sync to Sheet */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="text-2xl mb-1">📖 ⬆️</div>
                    <h4 className="font-extrabold text-base text-emerald-950 font-fun">
                      Kirim Jurnal (15 Hari)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Unggah seluruh data jurnal 15 hari dari <strong>semua 5 kelompok</strong> ke tab sheet <code>Jurnal_15_Hari</code>.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncAll}
                    disabled={syncing || !webAppUrl}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>{syncing ? '⏳ Mengirim Data...' : '📤 Kirim Semua Jurnal Sekarang'}</span>
                  </button>
                </div>

                {/* Fetch from Sheet */}
                <div className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-300 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs">
                  <div>
                    <div className="text-2xl mb-1">📥 ⬇️</div>
                    <h4 className="font-extrabold text-base text-sky-950 font-fun">
                      Tarik Jurnal dari Google Sheet
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Unduh data jurnal terbaru dari tab <code>Jurnal_15_Hari</code> jika telah diedit di Spreadsheet.
                    </p>
                  </div>
                  <button
                    onClick={handleFetchAll}
                    disabled={fetching || !webAppUrl}
                    className="w-full py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>{fetching ? '⏳ Mengambil Data...' : '📥 Tarik Data Jurnal Terbaru'}</span>
                  </button>
                </div>
              </div>

              {/* LKPD 1 Sync Actions */}
              <div className="bg-gradient-to-br from-amber-50 to-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  <div>
                    <h4 className="font-extrabold text-base text-emerald-950 font-fun">
                      Sinkronisasi Lembar Kerja (LKPD 1: Ayo Menanam Kangkung)
                    </h4>
                    <p className="text-xs text-slate-600">
                      Disimpan otomatis pada tab sheet terpisah bernama <code>LKPD_1_Menanam</code> per kelompok.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleSyncAllLkpd}
                    disabled={syncingLkpd || !webAppUrl}
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>{syncingLkpd ? '⏳ Mengirim...' : '📤 Kirim Seluruh LKPD ke Sheet'}</span>
                  </button>

                  <button
                    onClick={handleFetchAllLkpd}
                    disabled={fetchingLkpd || !webAppUrl}
                    className="py-2.5 px-4 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span>{fetchingLkpd ? '⏳ Menarik...' : '📥 Tarik Data LKPD dari Sheet'}</span>
                  </button>
                </div>
              </div>

              {/* Data Structure Summary Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-xs font-bold text-slate-700 block mb-2 font-fun">
                  📋 Struktur Kolom Database Spreadsheet (Otomatis Dibuat):
                </span>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                  {[
                    'Timestamp',
                    'Kelompok_ID',
                    'Nama_Kelompok',
                    'Hari_Ke',
                    'Tanggal',
                    'Tinggi_cm',
                    'Kondisi',
                    'Emoji',
                    'Catatan_Pengamatan',
                    'Daun_Baru',
                    'Bertambah_Tinggi',
                    'Daun_Hijau',
                    'Segar',
                    'Daun_Kuning',
                    'Anggota_Kelompok',
                    'Status',
                  ].map((col, idx) => (
                    <span
                      key={col}
                      className="bg-white border border-slate-300 px-2 py-0.5 rounded-md text-slate-800 font-semibold"
                    >
                      {idx + 1}. {col}
                    </span>
                  ))}
                </div>

                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                  <span>💡</span>
                  <span>
                    <strong>Format Tinggi Tanaman:</strong> Mendukung angka desimal titik (misal: <code>2.5</code>) maupun koma (misal: <code>2,5</code>), dan tersimpan otomatis ke kolom <strong>Tinggi_cm</strong>.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE.GS VIEW & COPY */}
          {activeTab === 'code' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-800 font-fun">
                    Kode Google Apps Script (Kode.gs)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Salin seluruh kode di bawah ini lalu tempelkan di Google Apps Script spreadsheet Anda.
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <span>{copied ? '✅' : '📋'}</span>
                  <span>{copied ? 'Tersalin!' : 'Salin Kode.gs'}</span>
                </button>
              </div>

              {/* Code Box */}
              <div className="relative bg-slate-900 rounded-2xl p-4 overflow-x-auto border-2 border-slate-800 text-slate-100 font-mono text-xs max-h-96">
                <pre>{getCodeGsContent()}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP SETUP GUIDE */}
          {activeTab === 'guide' && (
            <div className="flex flex-col gap-4 text-xs sm:text-sm">
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4">
                <h4 className="font-bold text-amber-950 font-fun text-base mb-1 flex items-center gap-2">
                  <span>💡</span>
                  <span>Langkah Cepat Memasang Database Google Sheets (3 Menit):</span>
                </h4>
                <p className="text-slate-700">
                  Ikuti langkah mudah di bawah ini agar seluruh jurnal kelompok langsung tersimpan otomatis di Google Drive Anda.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Buat Google Spreadsheet Baru</strong>
                    <span className="text-slate-600">
                      Buka{' '}
                      <a
                        href="https://sheets.new"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 font-bold underline"
                      >
                        sheets.new
                      </a>{' '}
                      dan beri nama misalnya: <em>&quot;Database Jurnal Kangkung SDN Jagir 1&quot;</em>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Buka Editor Apps Script</strong>
                    <span className="text-slate-600">
                      Di Google Spreadsheet, klik menu atas: <strong>Ekstensi (Extensions) &gt; Apps Script</strong>.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Salin dan Tempel Kode.gs</strong>
                    <span className="text-slate-600">
                      Buka tab <strong>&quot;Kode.gs&quot;</strong> di modal ini, klik tombol <strong>&quot;Salin Kode.gs&quot;</strong>, lalu ganti/timpa semua kode di Apps Script dengan kode tersebut. Klik icon 💾 Simpan.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Deploy / Terapkan sebagai Aplikasi Web (Penting!)</strong>
                    <span className="text-slate-600 block mt-0.5">
                      Klik tombol biru <strong>Terapkan (Deploy) &gt; Penerapan Baru (New deployment)</strong>.
                    </span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700">
                      <li>Pilih jenis gerigi: <strong>Aplikasi Web (Web App)</strong></li>
                      <li>Jalankan sebagai: <strong>Saya (Akun Anda)</strong></li>
                      <li>
                        Akses: <strong className="text-emerald-700">Siapa saja (Anyone)</strong> *(Sangat penting agar siswa tidak diminta login Google!)*
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center shrink-0">
                    5
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Salin Web App URL ke Aplikasi Ini</strong>
                    <span className="text-slate-600">
                      Salin URL yang berakhiran <code>/exec</code>, lalu tempelkan pada tab <strong>&quot;Koneksi &amp; Sinkron&quot;</strong> di atas dan klik <strong>Simpan</strong>. Selesai!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-100 p-4 px-6 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            💡 Data juga tetap otomatis tersimpan secara offline di browser (localStorage).
          </span>
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper returning raw Kode.gs
function getCodeGsContent(): string {
  return `/**
 * 🌱 KODE.GS: DATABASE GOOGLE SHEETS
 * MEDIA PEMBELAJARAN INTERAKTIF KELAS 1 SDN JAGIR I/393 SURABAYA
 * "SI KECIL PENJAGA TUNAS"
 */

const SHEET_NAME = 'Jurnal_15_Hari';
const SHEET_LKPD = 'LKPD_1_Menanam';

const DATA_KELOMPOK = {
  1: { nama: 'Kelompok 1', badge: '🦁', anggota: 'Ghina, Fadillah, Misbah, Anam' },
  2: { nama: 'Kelompok 2', badge: '🐬', anggota: 'Sayyidah, Zaki, Nicole, Afif, Anders' },
  3: { nama: 'Kelompok 3', badge: '🦊', anggota: 'Faiz, Rasya, Dhistya, Davin, Alya' },
  4: { nama: 'Kelompok 4', badge: '🐼', anggota: 'Pinga, Kenzo, Nisa, Grisella, Danis' },
  5: { nama: 'Kelompok 5', badge: '🐨', anggota: 'Asyffa, Julio, Mawa, Bastiyan' }
};

const HEADERS_JURNAL = [
  'Timestamp',
  'Kelompok_ID',
  'Nama_Kelompok',
  'Hari_Ke',
  'Tanggal',
  'Tinggi_cm',
  'Kondisi',
  'Emoji',
  'Catatan_Pengamatan',
  'Daun_Baru',
  'Bertambah_Tinggi',
  'Daun_Hijau',
  'Segar',
  'Daun_Kuning',
  'Anggota_Kelompok',
  'Status'
];

const HEADERS_LKPD = [
  'Timestamp',
  'Kelompok_ID',
  'Nama_Kelompok',
  'Anggota_Kelompok',
  'Tugas1_Wadah_Media',
  'Tugas1_Lubang_Kecil',
  'Tugas1_Letak_Biji',
  'Tugas1_Tutup_Media',
  'Tugas1_Siram_Secukupnya',
  'Tugas1_Label_Nama',
  'Total_Langkah_Selesai',
  'Tugas3_Prediksi_Siswa',
  'Tugas4_Senang',
  'Tugas4_Bekerja_Sama',
  'Tugas4_Siap_Merawat',
  'Status_LKPD',
  'Keterangan_Gambar'
];

function parsePlantHeight(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') return isNaN(val) ? '' : val;
  var str = String(val).trim().replace(/cm$/i, '').trim().replace(',', '.');
  var num = parseFloat(str);
  return !isNaN(num) ? num : '';
}

function formatDateToYMD(val) {
  if (val === null || val === undefined || val === '') return '';
  if (Object.prototype.toString.call(val) === '[object Date]' || val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    try {
      return Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd');
    } catch (e) {
      var yr = val.getFullYear();
      var mo = (val.getMonth() + 1 < 10 ? '0' : '') + (val.getMonth() + 1);
      var da = (val.getDate() < 10 ? '0' : '') + val.getDate();
      return yr + '-' + mo + '-' + da;
    }
  }
  var str = String(val).trim();
  if (!str) return '';

  // 1. Format strip: 2026-09-22 atau 22-09-2026
  if (str.indexOf('-') !== -1) {
    var partsDash = str.split('T')[0].split(' ')[0].split('-');
    if (partsDash.length === 3) {
      if (partsDash[0].length === 4) {
        var y1 = partsDash[0];
        var m1 = partsDash[1].length === 1 ? '0' + partsDash[1] : partsDash[1];
        var d1 = partsDash[2].length === 1 ? '0' + partsDash[2] : partsDash[2];
        return y1 + '-' + m1 + '-' + d1;
      }
      if (partsDash[2].length === 4) {
        var d2 = partsDash[0].length === 1 ? '0' + partsDash[0] : partsDash[0];
        var m2 = partsDash[1].length === 1 ? '0' + partsDash[1] : partsDash[1];
        var y2 = partsDash[2];
        return y2 + '-' + m2 + '-' + d2;
      }
    }
  }

  // 2. Format garis miring: 22/09/2026 atau 2026/09/22
  if (str.indexOf('/') !== -1) {
    var partsSlash = str.split(' ')[0].split('/');
    if (partsSlash.length === 3) {
      if (partsSlash[2].length === 4) {
        var d3 = partsSlash[0].length === 1 ? '0' + partsSlash[0] : partsSlash[0];
        var m3 = partsSlash[1].length === 1 ? '0' + partsSlash[1] : partsSlash[1];
        var y3 = partsSlash[2];
        return y3 + '-' + m3 + '-' + d3;
      }
      if (partsSlash[0].length === 4) {
        var y4 = partsSlash[0];
        var m4 = partsSlash[1].length === 1 ? '0' + partsSlash[1] : partsSlash[1];
        var d4 = partsSlash[2].length === 1 ? '0' + partsSlash[2] : partsSlash[2];
        return y4 + '-' + m4 + '-' + d4;
      }
    }
  }

  // 3. Fallback konstruktor Date
  var parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    var pYr = parsed.getFullYear();
    var pMo = (parsed.getMonth() + 1 < 10 ? '0' : '') + (parsed.getMonth() + 1);
    var pDa = (parsed.getDate() < 10 ? '0' : '') + parsed.getDate();
    return pYr + '-' + pMo + '-' + pDa;
  }
  return '';
}

function extractDayHeight(day) {
  if (!day) return '';
  var candidates = [day.heightCm, day.height, day.tinggi, day.tinggiCm, day.tinggi_cm, day.height_cm];
  for (var i = 0; i < candidates.length; i++) {
    var val = candidates[i];
    if (val !== undefined && val !== null && val !== '') {
      var parsed = parsePlantHeight(val);
      if (parsed !== '') return parsed;
    }
  }
  return '';
}

function extractDigits(val) {
  if (val === null || val === undefined) return '';
  var clean = String(val).replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : '';
}

function formatHeaderRow(sheet, numCols, bgColor) {
  try {
    const headerRange = sheet.getRange(1, 1, 1, numCols);
    headerRange.setBackground(bgColor || '#10b981');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    for (let c = 1; c <= numCols; c++) {
      sheet.autoResizeColumn(c);
    }
  } catch (e) {}
}

function getHeaderColumnMap(sheet) {
  try {
    const lastCol = Math.max(sheet.getLastColumn(), HEADERS_JURNAL.length);
    if (lastCol === 0) return null;
    const firstRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const map = {};
    for (let c = 0; c < firstRow.length; c++) {
      const key = String(firstRow[c] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (key) map[key] = c + 1;
    }
    return map;
  } catch (e) {
    return null;
  }
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    const sheets = ss.getSheets();
    if (sheets.length === 1 && sheets[0].getLastRow() <= 1 && sheets[0].getName().toLowerCase().includes('sheet')) {
      sheet = sheets[0];
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS_JURNAL);
    formatHeaderRow(sheet, HEADERS_JURNAL.length, '#10b981');
  } else {
    const lastCol = Math.max(sheet.getLastColumn(), 1);
    const row1 = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const isRow1Empty = row1.every(function(cell) { return String(cell).trim() === ''; });
    if (isRow1Empty) {
      sheet.getRange(1, 1, 1, HEADERS_JURNAL.length).setValues([HEADERS_JURNAL]);
      formatHeaderRow(sheet, HEADERS_JURNAL.length, '#10b981');
    }
  }
  return sheet;
}

function getOrCreateLkpdSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_LKPD);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_LKPD);
    sheet.appendRow(HEADERS_LKPD);
    formatHeaderRow(sheet, HEADERS_LKPD.length, '#f59e0b');
  }
  return sheet;
}

function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || 'ping';

    if (action === 'ping' || action === 'status') {
      return jsonResponse({
        status: 'success',
        message: '🌱 API Google Sheet Jurnal Kangkung SDN Jagir 1 Aktif & Terhubung!',
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'getAll') {
      return jsonResponse({ status: 'success', data: readAllJournalData() });
    }

    if (action === 'getGroup') {
      const gId = parseInt(params.groupId, 10) || 1;
      const all = readAllJournalData();
      return jsonResponse({ status: 'success', groupId: gId, data: all[gId] || [] });
    }

    if (action === 'syncDay' && params.data) {
      const payload = JSON.parse(params.data);
      return jsonResponse(saveGroupJournal(payload.groupId, [payload.day || payload.dayData || payload]));
    }

    if (action === 'syncGroup' && params.data) {
      const payload = JSON.parse(params.data);
      return jsonResponse(saveGroupJournal(payload.groupId, payload.days || [payload.day]));
    }

    if (action === 'syncAll' && params.data) {
      const payload = JSON.parse(params.data);
      return jsonResponse(saveAllGroups(payload));
    }

    if (action === 'getAllLkpd') {
      return jsonResponse({ status: 'success', data: readAllLkpdData() });
    }

    if (action === 'syncLkpd' && params.data) {
      const payload = JSON.parse(params.data);
      return jsonResponse(saveGroupLkpd(payload.groupId, payload.lkpdData || payload));
    }

    if (action === 'syncAllLkpd' && params.data) {
      const payload = JSON.parse(params.data);
      return jsonResponse(saveAllLkpd(payload));
    }

    return jsonResponse({ status: 'success', message: 'Layanan siap.' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    let payload;
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.data) {
      payload = JSON.parse(e.parameter.data);
    } else {
      throw new Error('Tidak ada data payload yang diterima.');
    }

    const action = payload.action || 'syncGroup';

    if (action === 'syncDay') {
      return jsonResponse(saveGroupJournal(parseInt(payload.groupId, 10), [payload.day || payload.dayData || {}]));
    }
    if (action === 'syncGroup') {
      return jsonResponse(saveGroupJournal(parseInt(payload.groupId, 10), payload.days || (payload.day ? [payload.day] : [])));
    }
    if (action === 'syncAll') {
      return jsonResponse(saveAllGroups(payload.data || {}));
    }
    if (action === 'syncLkpd') {
      return jsonResponse(saveGroupLkpd(parseInt(payload.groupId, 10), payload.lkpdData || {}));
    }
    if (action === 'syncAllLkpd') {
      return jsonResponse(saveAllLkpd(payload.data || {}));
    }
    return jsonResponse({ status: 'error', message: 'Action tidak dikenali' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.toString() });
  }
}

function saveGroupJournal(groupId, days) {
  const sheet = getOrCreateSheet();
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);
  try {
    const groupInfo = DATA_KELOMPOK[groupId] || { nama: 'Kelompok ' + groupId, anggota: '-' };
    const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const values = sheet.getDataRange().getValues();
    const colMap = getHeaderColumnMap(sheet);

    const colKelompokIdx = (colMap && (colMap['kelompokid'] || colMap['idkelompok'] || colMap['kelompok'])) ? (colMap['kelompokid'] || colMap['idkelompok'] || colMap['kelompok']) - 1 : 1;
    const colHariIdx = (colMap && (colMap['harike'] || colMap['hari'])) ? (colMap['harike'] || colMap['hari']) - 1 : 3;

    const rowMap = {};
    for (let r = 1; r < values.length; r++) {
      const normG = extractDigits(values[r][colKelompokIdx]);
      const normH = extractDigits(values[r][colHariIdx]);
      if (normG && normH) {
        rowMap[normG + '_' + normH] = r + 1;
      }
    }

    const dayList = Array.isArray(days) ? days : Object.keys(days || {}).map(function(k) { return days[k]; });

    dayList.forEach(function (day) {
      const dayNum = extractDigits(day.dayNumber) || 1;
      const key = groupId + '_' + dayNum;
      const height = extractDayHeight(day);
      const condition = day.condition || '';
      const emoji = day.conditionEmoji || '';
      const notes = day.notes || '';
      const dateVal = formatDateToYMD(day.date) || day.date || '';
      const status = height !== '' ? 'Lengkap ⭐ (' + height + ' cm)' : (condition ? 'Tercatat' : 'Belum diisi');

      let rowData;
      if (colMap && Object.keys(colMap).length >= 5) {
        const numCols = Math.max(sheet.getLastColumn(), HEADERS_JURNAL.length);
        rowData = new Array(numCols).fill('');
        const defaultArr = [
          nowStr, groupId, groupInfo.nama, dayNum, dateVal, height,
          condition, emoji, notes, day.hasNewLeaves ? 'YA' : 'TIDAK',
          day.grewTaller ? 'YA' : 'TIDAK', day.greenLeaves ? 'YA' : 'TIDAK',
          day.looksFresh ? 'YA' : 'TIDAK', day.hasYellowLeaves ? 'YA' : 'TIDAK',
          groupInfo.anggota, status
        ];
        for (let i = 0; i < defaultArr.length && i < numCols; i++) {
          rowData[i] = defaultArr[i];
        }
        if (colMap['tinggicm']) rowData[colMap['tinggicm'] - 1] = height;
        else if (colMap['tinggi']) rowData[colMap['tinggi'] - 1] = height;
      } else {
        rowData = [
          nowStr, groupId, groupInfo.nama, dayNum, dateVal, height,
          condition, emoji, notes, day.hasNewLeaves ? 'YA' : 'TIDAK',
          day.grewTaller ? 'YA' : 'TIDAK', day.greenLeaves ? 'YA' : 'TIDAK',
          day.looksFresh ? 'YA' : 'TIDAK', day.hasYellowLeaves ? 'YA' : 'TIDAK',
          groupInfo.anggota, status
        ];
      }

      if (rowMap[key]) {
        sheet.getRange(rowMap[key], 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
        rowMap[key] = sheet.getLastRow();
      }
    });

    return {
      status: 'success',
      message: 'Berhasil menyimpan jurnal pengamatan ' + groupInfo.nama + '! (Tinggi kangkung tercatat di Spreadsheet)',
      groupId: groupId,
      updatedAt: nowStr
    };
  } finally {
    lock.releaseLock();
  }
}

function saveAllGroups(allData) {
  let count = 0;
  for (let gId = 1; gId <= 5; gId++) {
    if (allData[gId] && Array.isArray(allData[gId])) {
      saveGroupJournal(gId, allData[gId]);
      count++;
    }
  }
  return {
    status: 'success',
    message: 'Berhasil menyinkronkan seluruh jurnal dari ' + count + ' kelompok ke Google Sheet!',
    timestamp: new Date().toISOString()
  };
}

function readAllJournalData() {
  const sheet = getOrCreateSheet();
  const values = sheet.getDataRange().getValues();
  const colMap = getHeaderColumnMap(sheet);
  const result = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  const dayMaps = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} };

  const colKelompokIdx = (colMap && (colMap['kelompokid'] || colMap['idkelompok'] || colMap['kelompok'])) ? (colMap['kelompokid'] || colMap['idkelompok'] || colMap['kelompok']) - 1 : 1;
  const colHariIdx = (colMap && (colMap['harike'] || colMap['hari'])) ? (colMap['harike'] || colMap['hari']) - 1 : 3;
  const colTinggiIdx = (colMap && (colMap['tinggicm'] || colMap['tinggi'] || colMap['heightcm'])) ? (colMap['tinggicm'] || colMap['tinggi'] || colMap['heightcm']) - 1 : 5;
  const colTglIdx = (colMap && (colMap['tanggal'] || colMap['tgl'] || colMap['date'])) ? (colMap['tanggal'] || colMap['tgl'] || colMap['date']) - 1 : 4;
  const colKondisiIdx = (colMap && colMap['kondisi']) ? colMap['kondisi'] - 1 : 6;
  const colEmojiIdx = (colMap && colMap['emoji']) ? colMap['emoji'] - 1 : 7;
  const colCatatanIdx = (colMap && (colMap['catatanpengamatan'] || colMap['catatan'])) ? (colMap['catatanpengamatan'] || colMap['catatan']) - 1 : 8;
  const colDaunBaruIdx = (colMap && colMap['daunbaru']) ? colMap['daunbaru'] - 1 : 9;
  const colTinggiBaruIdx = (colMap && colMap['bertambahtinggi']) ? colMap['bertambahtinggi'] - 1 : 10;
  const colDaunHijauIdx = (colMap && colMap['daunhijau']) ? colMap['daunhijau'] - 1 : 11;
  const colSegarIdx = (colMap && colMap['segar']) ? colMap['segar'] - 1 : 12;
  const colKuningIdx = (colMap && colMap['daunkuning']) ? colMap['daunkuning'] - 1 : 13;

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const gId = extractDigits(row[colKelompokIdx]);
    const dayNum = extractDigits(row[colHariIdx]);

    if (gId >= 1 && gId <= 5 && dayNum >= 1 && dayNum <= 15) {
      dayMaps[gId][dayNum] = {
        dayNumber: dayNum,
        label: 'Hari ' + dayNum,
        date: formatDateToYMD(row[colTglIdx]),
        heightCm: parsePlantHeight(row[colTinggiIdx]),
        condition: String(row[colKondisiIdx] || ''),
        conditionEmoji: String(row[colEmojiIdx] || ''),
        notes: String(row[colCatatanIdx] || ''),
        hasNewLeaves: row[colDaunBaruIdx] === 'YA',
        grewTaller: row[colTinggiBaruIdx] === 'YA',
        greenLeaves: row[colDaunHijauIdx] === 'YA',
        looksFresh: row[colSegarIdx] === 'YA',
        hasYellowLeaves: row[colKuningIdx] === 'YA'
      };
    }
  }

  for (let g = 1; g <= 5; g++) {
    for (let d = 1; d <= 15; d++) {
      if (dayMaps[g][d]) {
        result[g].push(dayMaps[g][d]);
      } else {
        result[g].push({
          dayNumber: d,
          label: 'Hari ' + d,
          date: '',
          heightCm: '',
          condition: '',
          conditionEmoji: '',
          notes: '',
          hasNewLeaves: false,
          grewTaller: false,
          greenLeaves: false,
          looksFresh: false,
          hasYellowLeaves: false
        });
      }
    }
  }
  return result;
}

function saveGroupLkpd(groupId, lkpdData) {
  const sheet = getOrCreateLkpdSheet();
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);
  try {
    const groupInfo = DATA_KELOMPOK[groupId] || { nama: 'Kelompok ' + groupId, anggota: '-' };
    const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const tasks = lkpdData.tasks || {};
    const ref = lkpdData.reflection || {};
    let totalLangkah = 0;
    if (tasks.wadahMedia) totalLangkah++;
    if (tasks.lubangKecil) totalLangkah++;
    if (tasks.letakBiji) totalLangkah++;
    if (tasks.tutupMedia) totalLangkah++;
    if (tasks.siramSecukupnya) totalLangkah++;
    if (tasks.labelNama) totalLangkah++;

    const isComplete = totalLangkah === 6 && (lkpdData.prediction || '').trim().length > 0;
    const hasDrawing = Boolean(lkpdData.drawingDataUrl && lkpdData.drawingDataUrl.length > 50);

    const rowData = [
      nowStr,
      groupId,
      lkpdData.groupName || groupInfo.nama,
      lkpdData.members || groupInfo.anggota,
      tasks.wadahMedia ? 'SUDAH (✓)' : 'BELUM',
      tasks.lubangKecil ? 'SUDAH (✓)' : 'BELUM',
      tasks.letakBiji ? 'SUDAH (✓)' : 'BELUM',
      tasks.tutupMedia ? 'SUDAH (✓)' : 'BELUM',
      tasks.siramSecukupnya ? 'SUDAH (✓)' : 'BELUM',
      tasks.labelNama ? 'SUDAH (✓)' : 'BELUM',
      totalLangkah + ' / 6 Langkah',
      lkpdData.prediction || '',
      ref.senang ? 'YA (😊)' : 'TIDAK',
      ref.bekerjaSama ? 'YA (🤝)' : 'TIDAK',
      ref.siapMerawat ? 'YA (🌱)' : 'TIDAK',
      isComplete ? 'LENGKAP ⭐' : 'DALAM PROSES',
      hasDrawing ? 'Tersedia gambar di aplikasi' : 'Belum menggambar'
    ];

    const values = sheet.getDataRange().getValues();
    let existingRow = -1;
    for (let r = 1; r < values.length; r++) {
      if (parseInt(values[r][1], 10) === groupId) {
        existingRow = r + 1;
        break;
      }
    }

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return {
      status: 'success',
      message: 'Berhasil menyimpan LKPD 1 untuk ' + (lkpdData.groupName || groupInfo.nama) + '!',
      groupId: groupId
    };
  } finally {
    lock.releaseLock();
  }
}

function saveAllLkpd(allLkpd) {
  for (let gId = 1; gId <= 5; gId++) {
    if (allLkpd[gId]) {
      saveGroupLkpd(gId, allLkpd[gId]);
    }
  }
  return {
    status: 'success',
    message: 'Berhasil menyimpan seluruh lembar kerja (LKPD 1) 5 kelompok ke Google Sheet!',
    timestamp: new Date().toISOString()
  };
}

function readAllLkpdData() {
  const sheet = getOrCreateLkpdSheet();
  const values = sheet.getDataRange().getValues();
  const result = {};
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const gId = parseInt(row[1], 10);
    if (gId >= 1 && gId <= 5) {
      result[gId] = {
        groupId: gId,
        groupName: String(row[2] || ''),
        members: String(row[3] || ''),
        tasks: {
          wadahMedia: String(row[4]).includes('SUDAH'),
          lubangKecil: String(row[5]).includes('SUDAH'),
          letakBiji: String(row[6]).includes('SUDAH'),
          tutupMedia: String(row[7]).includes('SUDAH'),
          siramSecukupnya: String(row[8]).includes('SUDAH'),
          labelNama: String(row[9]).includes('SUDAH'),
        },
        prediction: String(row[11] || ''),
        reflection: {
          senang: String(row[12]).includes('YA'),
          bekerjaSama: String(row[13]).includes('YA'),
          siapMerawat: String(row[14]).includes('YA'),
        },
        drawingDataUrl: '',
        updatedAt: String(row[0] || '')
      };
    }
  }
  return result;
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;
}
