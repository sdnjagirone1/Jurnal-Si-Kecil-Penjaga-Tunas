import React from 'react';
import { PageId, GROUPS_DATA, GroupInfo } from '../types';
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
  color: string;
  activeBg: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'beranda', label: 'Beranda', icon: '🏠', color: 'text-amber-700', activeBg: 'bg-amber-400 text-amber-950 ring-2 ring-amber-500' },
  { id: 'kenalan', label: 'Kenalan', icon: '🌿', color: 'text-emerald-700', activeBg: 'bg-emerald-500 text-white ring-2 ring-emerald-600' },
  { id: 'cara', label: 'Cara Amati', icon: '📋', color: 'text-teal-700', activeBg: 'bg-teal-500 text-white ring-2 ring-teal-600' },
  { id: 'lkpd', label: 'Lembar Kerja', icon: '📝', color: 'text-emerald-700', activeBg: 'bg-emerald-600 text-white ring-2 ring-emerald-700' },
  { id: 'jurnal', label: 'Jurnal (15 H)', icon: '📖', color: 'text-blue-700', activeBg: 'bg-blue-500 text-white ring-2 ring-blue-600' },
  { id: 'ukur', label: 'Ukur', icon: '📏', color: 'text-indigo-700', activeBg: 'bg-indigo-500 text-white ring-2 ring-indigo-600' },
  { id: 'amati', label: 'Amati', icon: '🔍', color: 'text-purple-700', activeBg: 'bg-purple-500 text-white ring-2 ring-purple-600' },
  { id: 'grafik', label: 'Grafik', icon: '📊', color: 'text-pink-700', activeBg: 'bg-pink-500 text-white ring-2 ring-pink-600' },
  { id: 'tantangan', label: 'Kuis', icon: '🧠', color: 'text-orange-700', activeBg: 'bg-orange-500 text-white ring-2 ring-orange-600' },
  { id: 'bintang', label: 'Bintang Siswa', icon: '⭐', color: 'text-yellow-700', activeBg: 'bg-amber-400 text-amber-950 ring-2 ring-amber-500' },
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

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b-2 border-emerald-100 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Logo & Brand & Active Group Badge */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2">
          <button
            onClick={() => {
              sound.playPop();
              onNavigate('beranda');
            }}
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-lime-400 flex items-center justify-center text-xl shadow-md shadow-emerald-200 group-hover:scale-105 transition-transform">
              🌱
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 tracking-wider uppercase block">
                MPI SDN Jagir I/393 Surabaya
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-800 leading-tight block font-fun">
                Si Kecil Penjaga Tunas
              </span>
            </div>
          </button>

          {/* Quick Group Selector in Navbar */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-2xl px-2.5 py-1">
            <span className="text-xs font-bold text-emerald-800 hidden sm:inline">Kelompok:</span>
            <select
              value={currentGroupId}
              onChange={(e) => {
                sound.playPop();
                onSelectGroup(Number(e.target.value));
              }}
              className="bg-transparent font-extrabold text-xs sm:text-sm text-emerald-900 cursor-pointer outline-hidden font-fun"
            >
              {GROUPS_DATA.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.badge} {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Sheet & Sound Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={() => {
                sound.playPop();
                onOpenSheetModal();
              }}
              title="Database Google Sheet"
              className={`p-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1 ${
                isSheetReady
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <span>📊</span>
            </button>
            <div className="flex items-center gap-1 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full text-xs font-bold text-amber-800">
              ⭐ <span>{starsCount}</span>
            </div>
            <button
              onClick={onToggleSpeech}
              title={speechEnabled ? 'Suara Narasi Aktif' : 'Suara Narasi Mati'}
              className={`p-1.5 rounded-xl text-xs border transition-colors ${
                speechEnabled ? 'bg-sky-100 border-sky-300 text-sky-700' : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}
            >
              {speechEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        </div>

        {/* Scrollable Nav Pills (Kids friendly buttons) */}
        <nav className="w-full md:w-auto overflow-x-auto py-1 no-scrollbar flex items-center gap-1.5 sm:gap-2">
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
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                  isActive
                    ? `${item.activeBg} scale-105 shadow-sm`
                    : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 hover:scale-102'
                }`}
              >
                <span className="text-base sm:text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Controls (Google Sheet + Stars + Audio) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Google Sheet Database Button */}
          <button
            onClick={() => {
              sound.playPop();
              onOpenSheetModal();
            }}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold border-2 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              isSheetReady
                ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
            }`}
            title="Kelola Database Google Sheet & Kode.gs"
          >
            <span>📊</span>
            <span>Google Sheet</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isSheetReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Star Trophy Counter */}
          <div className="flex items-center gap-1.5 bg-amber-100 border-2 border-amber-300 px-3 py-1 rounded-full text-xs sm:text-sm font-bold text-amber-900 shadow-2xs">
            <span className="text-base">⭐</span>
            <span>{starsCount} Bintang</span>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Efek Suara Aktif' : 'Efek Suara Dimatikan'}
            className={`p-1.5 rounded-xl text-xs border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            {soundEnabled ? '🔔' : '🔕'}
          </button>

          {/* Indonesian TTS Speech Toggle */}
          <button
            onClick={onToggleSpeech}
            title={speechEnabled ? 'Suara Narasi (TTS) Aktif' : 'Suara Narasi (TTS) Dimatikan'}
            className={`p-1.5 rounded-xl text-xs border transition-colors cursor-pointer ${
              speechEnabled
                ? 'bg-sky-100 border-sky-300 text-sky-800'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            {speechEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </div>
    </header>
  );
};
