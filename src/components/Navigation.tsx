import React, { useState, useRef, useEffect } from 'react';
import { PageId, GROUPS_DATA } from '../types';
import { sound } from '../utils/audio';
import { sheetService } from '../utils/sheetService';

interface NavigationProps {
  activeSection: PageId;
  onNavigate: (section: PageId) => void;
  starsCount: number;
  currentGroupId: number;
  onSelectGroup: (groupId: number) => void;
  soundEnabled: boolean;
  speechEnabled: boolean;
  onToggleSound: () => void;
  onToggleSpeech: () => void;
  onOpenSheetModal: () => void;
}

interface NavItem {
  id: PageId;
  label: string;
  icon: string;
  activeBg: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'beranda', label: 'Beranda', icon: '🏠', activeBg: 'bg-amber-400 text-amber-950 ring-2 ring-amber-500' },
  { id: 'kenalan', label: 'Kenalan', icon: '🌿', activeBg: 'bg-emerald-500 text-white ring-2 ring-emerald-600' },
  { id: 'cara', label: 'Cara Amati', icon: '📋', activeBg: 'bg-teal-500 text-white ring-2 ring-teal-600' },
  { id: 'lkpd', label: 'Lembar Kerja', icon: '📝', activeBg: 'bg-emerald-600 text-white ring-2 ring-emerald-700' },
  { id: 'jurnal', label: 'Jurnal (15H)', icon: '📖', activeBg: 'bg-blue-500 text-white ring-2 ring-blue-600' },
  { id: 'ukur', label: 'Ukur', icon: '📏', activeBg: 'bg-indigo-500 text-white ring-2 ring-indigo-600' },
  { id: 'amati', label: 'Amati', icon: '🔍', activeBg: 'bg-purple-500 text-white ring-2 ring-purple-600' },
  { id: 'grafik', label: 'Grafik', icon: '📊', activeBg: 'bg-pink-500 text-white ring-2 ring-pink-600' },
  { id: 'tantangan', label: 'Kuis', icon: '🧠', activeBg: 'bg-orange-500 text-white ring-2 ring-orange-600' },
  { id: 'bintang', label: 'Bintang', icon: '⭐', activeBg: 'bg-amber-400 text-amber-950 ring-2 ring-amber-500' },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onNavigate,
  starsCount,
  currentGroupId,
  onSelectGroup,
  soundEnabled,
  speechEnabled,
  onToggleSound,
  onToggleSpeech,
  onOpenSheetModal,
}) => {
  const isSheetReady = sheetService.isConfigured();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const activeGroup = GROUPS_DATA.find((g) => g.id === currentGroupId) || GROUPS_DATA[0];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md shadow-xs no-print select-none">
      {/* ========================================================
          TINGKAT 1 (BAGIAN ATAS):
          - Nama Aplikasi (Mendatar 2 Baris) & Logo Tunas
          - Pilih Nama Kelompok
          - Pengaturan Google Sheet
          - Jumlah Bintang Siswa
          - Lonceng Notifikasi & Pengingat
          - Pengaturan Suara (Sound FX & Narasi Suara)
          ======================================================== */}
      <div className="border-b border-emerald-100 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Logo & Judul Aplikasi (Mendatar 2 Baris, Rapi & Tidak Bertumpuk) */}
          <button
            onClick={() => {
              sound.playPop();
              onNavigate('beranda');
            }}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none shrink-0"
            title="Kembali ke Beranda"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center text-lg sm:text-xl shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform shrink-0">
              🌱
            </div>
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-xs sm:text-sm md:text-base font-extrabold text-slate-800 leading-tight font-fun tracking-tight whitespace-nowrap">
                Si Kecil Penjaga Tunas
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-emerald-700 leading-tight whitespace-nowrap">
                MPI Kelas 1 SDN Jagir I/393 Surabaya
              </span>
            </div>
          </button>

          {/* Kontrol Bagian Atas: Kelompok, Sheet, Bintang, Lonceng, dan Suara */}
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap justify-end ml-auto">
            
            {/* 1. Pilih Nama Kelompok */}
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded-xl px-2 py-1 shadow-2xs hover:bg-emerald-100/60 transition-colors">
              <span className="text-xs font-bold text-emerald-800 hidden xl:inline">Kelompok:</span>
              <span className="text-sm">{activeGroup.badge}</span>
              <select
                value={currentGroupId}
                onChange={(e) => {
                  sound.playPop();
                  onSelectGroup(Number(e.target.value));
                }}
                className="bg-transparent font-extrabold text-xs sm:text-sm text-emerald-900 cursor-pointer outline-hidden font-fun pr-0.5"
                title="Pilih Kelompok Belajar"
              >
                {GROUPS_DATA.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Pengaturan Google Sheet */}
            <button
              onClick={() => {
                sound.playPop();
                onOpenSheetModal();
              }}
              className={`px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 sm:gap-1.5 shadow-2xs ${
                isSheetReady
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
              }`}
              title={isSheetReady ? 'Google Sheet Tersambung (Klik untuk kelola)' : 'Atur Google Sheet'}
            >
              <span className="text-sm">📊</span>
              <span className="hidden sm:inline">Google Sheet</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isSheetReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </button>

            {/* 3. Jumlah Bintang Siswa */}
            <div
              className="flex items-center gap-1 bg-amber-100 border border-amber-300 px-2 sm:px-2.5 py-1 rounded-xl text-xs font-bold text-amber-900 shadow-2xs cursor-pointer hover:bg-amber-200 transition-colors"
              title={`Total ${starsCount} Bintang Diraih`}
              onClick={() => {
                sound.playPop();
                onNavigate('bintang');
              }}
            >
              <span className="text-sm">⭐</span>
              <span className="font-extrabold text-amber-950">{starsCount}</span>
              <span className="hidden lg:inline text-[11px]">Bintang</span>
            </div>

            {/* 4. Lonceng Notifikasi */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  sound.playPop();
                  setShowNotifications((prev) => !prev);
                }}
                title="Pengingat & Notifikasi Siswa"
                className={`p-1.5 sm:px-2 sm:py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 shadow-2xs ${
                  showNotifications
                    ? 'bg-amber-200 border-amber-400 text-amber-950'
                    : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
                }`}
              >
                <span className="text-sm">🔔</span>
                <span className="hidden xl:inline">Notifikasi</span>
                {/* Badge Dot */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              </button>

              {/* Popover Notifikasi Pengingat Siswa */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border-2 border-emerald-300 p-3.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">🔔</span>
                      <div>
                        <div className="text-xs font-extrabold text-emerald-900 font-fun">Pengingat Harian Siswa</div>
                        <div className="text-[10px] text-emerald-700">SDN Jagir I/393 Surabaya</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-2.5 space-y-2 text-xs">
                    <div className="flex items-start gap-2 p-2 rounded-xl bg-sky-50 border border-sky-100">
                      <span className="text-base shrink-0">💧</span>
                      <div>
                        <span className="font-bold text-sky-900 block">Siram Kangkung Pagi & Sore</span>
                        <span className="text-sky-700 text-[11px] leading-tight block">
                          Siram dengan air secukupnya agar tanah tetap lembab dan kangkung tumbuh subur.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-base shrink-0">📏</span>
                      <div>
                        <span className="font-bold text-emerald-900 block">Ukur Tinggi Batang Hari Ini</span>
                        <span className="text-emerald-700 text-[11px] leading-tight block">
                          Gunakan penggaris tegak lurus dari pangkal tanah ke daun teratas.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-xl bg-amber-50 border border-amber-100">
                      <span className="text-base shrink-0">📝</span>
                      <div>
                        <span className="font-bold text-amber-900 block">Isi Jurnal 15 Hari</span>
                        <span className="text-amber-800 text-[11px] leading-tight block">
                          Amati perubahan daun dan warna kangkung bersama anggota kelompokmu.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-xl bg-purple-50 border border-purple-100">
                      <span className="text-base shrink-0">⭐</span>
                      <div>
                        <span className="font-bold text-purple-900 block">Kumpulkan Bintang Prestasi</span>
                        <span className="text-purple-800 text-[11px] leading-tight block">
                          Dapatkan 15 bintang untuk meraih Sertifikat Petani Cilik Berprestasi!
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => {
                        sound.playPop();
                        setShowNotifications(false);
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Siap, Mengerti! 👍
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Pengaturan Suara (Efek Suara & Narasi Suara) */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              {/* Sound FX Button */}
              <button
                onClick={() => {
                  sound.playPop();
                  onToggleSound();
                }}
                title={soundEnabled ? 'Efek Suara Aktif (Klik untuk mematikan)' : 'Efek Suara Mati (Klik untuk menyalakan)'}
                className={`p-1 sm:px-1.5 sm:py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                  soundEnabled
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className="text-sm">{soundEnabled ? '🎵' : '🔇'}</span>
                <span className="hidden xl:inline text-[10px]">FX</span>
              </button>

              {/* TTS Speech Narration Button */}
              <button
                onClick={() => {
                  sound.playPop();
                  onToggleSpeech();
                }}
                title={speechEnabled ? 'Suara Narasi Aktif (Klik untuk mematikan)' : 'Suara Narasi Mati (Klik untuk menyalakan)'}
                className={`p-1 sm:px-1.5 sm:py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                  speechEnabled
                    ? 'bg-sky-500 text-white shadow-2xs'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className="text-sm">{speechEnabled ? '🗣️' : '🔇'}</span>
                <span className="hidden xl:inline text-[10px]">Suara</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================
          TINGKAT 2 (BAGIAN BAWAH):
          - Menu-Menu Aplikasi (10 Item)
          - Menyesuaikan ukuran layar:
            * Layar kecil/HP: Menampilkan ICON SAJA (tanpa geser-geser!)
            * Layar tablet/komputer: Menampilkan ICON + NAMA MENU
          - Memenuhi lebar layar secara proporsional tanpa perlu scroll
          ======================================================== */}
      <div className="bg-emerald-50/80 border-b-2 border-emerald-200">
        <div className="max-w-7xl mx-auto px-1 sm:px-3 py-1">
          <nav 
            className="grid grid-cols-10 gap-0.5 sm:gap-1 md:gap-1.5 w-full items-center"
            aria-label="Menu Pembelajaran Siswa"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => {
                    sound.playPop();
                    onNavigate(item.id);
                  }}
                  title={item.label}
                  aria-label={item.label}
                  className={`flex flex-col md:flex-row items-center justify-center gap-0.5 md:gap-1.5 py-1 px-0.5 sm:px-1 rounded-xl text-center transition-all cursor-pointer select-none ${
                    isActive
                      ? `${item.activeBg} font-extrabold shadow-sm scale-102`
                      : 'bg-white/80 hover:bg-white text-slate-700 hover:text-emerald-900 hover:shadow-2xs font-bold border border-emerald-100'
                  }`}
                >
                  {/* Icon: Tampil di semua ukuran layar */}
                  <span className="text-base sm:text-lg leading-none shrink-0">
                    {item.icon}
                  </span>
                  {/* Label Menu: Sembunyi di layar kecil (HP), tampil di layar medium ke atas (md:inline) */}
                  <span className="hidden md:inline text-[11px] lg:text-xs truncate leading-tight tracking-tight">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
