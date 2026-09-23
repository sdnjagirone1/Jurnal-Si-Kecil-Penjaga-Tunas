import React, { useState } from 'react';
import { JournalDay, GROUPS_DATA, GroupInfo } from '../types';
import { sound } from '../utils/audio';
import { sheetService } from '../utils/sheetService';
import confetti from 'canvas-confetti';

interface SectionJournalProps {
  currentGroupId: number;
  onSelectGroup: (groupId: number) => void;
  journalData: JournalDay[];
  onUpdateDay: (dayNumber: number, field: keyof JournalDay, value: string | number) => void;
  onLoadSample: () => void;
  onResetData: () => void;
  onOpenSheetModal: () => void;
}

const CONDITION_OPTIONS = [
  { label: 'Biji belum tumbuh', emoji: '🌰', bg: 'bg-amber-100 text-amber-900 border-amber-300' },
  { label: 'Sehat', emoji: '🌱', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { label: 'Daun hijau', emoji: '😊', bg: 'bg-green-100 text-green-800 border-green-300' },
  { label: 'Segar', emoji: '☀️', bg: 'bg-amber-100 text-amber-800 border-amber-300' },
  { label: 'Daun bertambah', emoji: '🍃', bg: 'bg-lime-100 text-lime-800 border-lime-300' },
  { label: 'Layu', emoji: '💧', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
  { label: 'Ada daun menguning', emoji: '⚠️', bg: 'bg-orange-100 text-orange-800 border-orange-300' },
];

export const SectionJournal: React.FC<SectionJournalProps> = ({
  currentGroupId,
  onSelectGroup,
  journalData,
  onUpdateDay,
  onLoadSample,
  onResetData,
  onOpenSheetModal,
}) => {
  const [activeDayPopup, setActiveDayPopup] = useState<number | null>(null);
  const [saveToast, setSaveToast] = useState(false);
  const [syncingToSheet, setSyncingToSheet] = useState(false);
  const [sheetToast, setSheetToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const activeGroup: GroupInfo =
    GROUPS_DATA.find((g) => g.id === currentGroupId) || GROUPS_DATA[0];

  // Count filled days out of 15
  const filledCount = journalData.filter(
    (d) => d.heightCm !== '' && Number(d.heightCm) > 0
  ).length;

  const handleSyncThisGroup = async () => {
    sound.playPop();
    if (!sheetService.isConfigured()) {
      onOpenSheetModal();
      return;
    }

    setSyncingToSheet(true);
    setSheetToast(null);

    const res = await sheetService.syncGroup(currentGroupId, journalData);
    setSyncingToSheet(false);

    if (res.success) {
      sound.playFanfare();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
      setSheetToast({ type: 'success', message: `✅ ${res.message}` });
    } else {
      setSheetToast({ type: 'error', message: `⚠️ ${res.message}` });
    }

    setTimeout(() => setSheetToast(null), 5000);
  };

  const handleHeightChange = (dayNumber: number, val: string) => {
    const sanitized = val.replace(/[^0-9.]/g, '');
    onUpdateDay(dayNumber, 'heightCm', sanitized);
    sound.playPop();
  };

  const handleQuickAdjust = (dayNumber: number, delta: number) => {
    const current = Number(journalData.find((d) => d.dayNumber === dayNumber)?.heightCm) || 0;
    const nextVal = Math.max(0, parseFloat((current + delta).toFixed(1)));
    onUpdateDay(dayNumber, 'heightCm', nextVal);
    sound.playPop();
  };

  const handleSelectCondition = (dayNumber: number, cond: { label: string; emoji: string }) => {
    onUpdateDay(dayNumber, 'condition', cond.label);
    onUpdateDay(dayNumber, 'conditionEmoji', cond.emoji);
    setActiveDayPopup(null);
    sound.playStar();
  };

  const handleSaveAll = () => {
    sound.playStar();
    confetti({
      particleCount: 35,
      spread: 65,
      origin: { y: 0.5 },
      colors: ['#22c55e', '#facc15', '#38bdf8', '#ec4899'],
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  return (
    <section id="jurnal" className="py-12 bg-emerald-50/70">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="bg-white rounded-3xl p-5 sm:p-10 border-4 border-emerald-400 shadow-xl">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-emerald-100 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 px-4 py-1 rounded-full text-emerald-800 font-bold text-xs sm:text-sm mb-2">
                <span>📖</span>
                <span>HALAMAN UTAMA: BUKU JURNAL KELOMPOK (15 HARI)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-fun">
                Buku Jurnal Pengamatan Kangkung
              </h2>
              <p className="text-slate-600 text-sm font-medium mt-1">
                Pilih kelompokmu dan catat pengamatan kangkung selama minimal 15 hari!
              </p>
            </div>

            {/* Quick Actions for Class / Demo & Cloud Sync */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSyncThisGroup}
                disabled={syncingToSheet}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 disabled:opacity-60"
                title="Kirim catatan kelompok ini ke Google Sheet"
              >
                <span>{syncingToSheet ? '⏳' : '☁️'}</span>
                <span>{syncingToSheet ? 'Menyimpan...' : 'Simpan ke Sheet'}</span>
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  onOpenSheetModal();
                }}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-emerald-800 border-2 border-emerald-300 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Buka Pengaturan Google Sheet & Kode.gs"
              >
                <span>📊</span>
                <span>Menu Sheet</span>
              </button>

              <button
                onClick={() => {
                  sound.playStar();
                  onLoadSample();
                }}
                className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-amber-300 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Isi contoh pertumbuhan kangkung 15 hari secara otomatis"
              >
                <span>✨</span>
                <span>Isi Contoh</span>
              </button>

              <button
                onClick={() => {
                  if (confirm(`Kosongkan data jurnal ${activeGroup.name}?`)) {
                    sound.playPop();
                    onResetData();
                  }
                }}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-300 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer"
                title="Hapus data jurnal untuk mulai baru"
              >
                <span>🔄</span>
                <span>Mulai Baru</span>
              </button>
            </div>
          </div>

          {/* GROUP SELECTOR TABS (5 KELOMPOK) */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs sm:text-sm font-extrabold text-emerald-900 uppercase tracking-wider font-fun flex items-center gap-1.5">
                <span>👥</span>
                <span>Pilih Kelompok Peneliti Cilik:</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Tiap kelompok memiliki buku jurnal tersendiri
              </span>
            </div>

            {/* 5 Group Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {GROUPS_DATA.map((group) => {
                const isSelected = group.id === currentGroupId;
                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      sound.playPop();
                      onSelectGroup(group.id);
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                      isSelected
                        ? 'bg-gradient-to-b ' +
                          group.accentBg +
                          ' text-white border-white shadow-md scale-103 ring-4 ring-emerald-200'
                        : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{group.badge}</span>
                    <span className={`font-extrabold text-sm sm:text-base font-fun ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {group.name}
                    </span>
                    <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100 font-bold' : 'text-slate-500'}`}>
                      {group.members.length} Siswa
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE GROUP BANNER WITH MEMBER CHIPS */}
          <div className="bg-gradient-to-r from-emerald-100 via-lime-100 to-amber-100 rounded-3xl p-5 mb-6 border-2 border-emerald-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm border-2 border-emerald-300 shrink-0">
                {activeGroup.badge}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Buku Jurnal Aktif
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    {filledCount} / 15 Hari Terisi
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-fun mt-0.5">
                  {activeGroup.name}
                </h3>
              </div>
            </div>

            {/* List of Member Badges */}
            <div className="flex flex-wrap items-center gap-1.5 max-w-lg">
              <span className="text-xs font-bold text-emerald-900 w-full mb-0.5">
                Anggota Kelompok:
              </span>
              {activeGroup.members.map((member, i) => (
                <span
                  key={member}
                  className="inline-flex items-center gap-1 bg-white/90 border border-emerald-300 text-emerald-900 font-bold text-xs px-2.5 py-1 rounded-xl shadow-2xs"
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-200 text-[10px] flex items-center justify-center font-extrabold text-emerald-800">
                    {i + 1}
                  </span>
                  <span>{member}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 15 Days Progress Star Track */}
          <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 mb-6 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
              <span>🌟 Jejak Bintang 15 Hari Pengamatan:</span>
              <span className="text-emerald-700">{Math.round((filledCount / 15) * 100)}% Lengkap</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 no-scrollbar">
              {journalData.map((d) => {
                const isFilled = d.heightCm !== '' && Number(d.heightCm) > 0;
                return (
                  <div
                    key={d.dayNumber}
                    title={`Hari ${d.dayNumber}: ${isFilled ? d.heightCm + ' cm' : 'Belum diisi'}`}
                    className={`flex-1 min-w-[32px] h-8 sm:h-9 rounded-xl flex items-center justify-center text-xs font-extrabold transition-transform shrink-0 ${
                      isFilled
                        ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300 shadow-2xs scale-105'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    {isFilled ? '⭐' : d.dayNumber}
                  </div>
                );
              })}
            </div>
          </div>

          {/* TABLE CONTAINER: 15 Days of Interactive Observations */}
          <div className="overflow-x-auto rounded-2xl border-3 border-emerald-200 shadow-sm max-h-[620px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead className="sticky top-0 z-20">
                <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-fun text-sm sm:text-base shadow-sm">
                  <th className="py-3.5 px-4 font-bold rounded-tl-xl w-28">Hari</th>
                  <th className="py-3.5 px-4 font-bold w-48">📅 Tanggal</th>
                  <th className="py-3.5 px-4 font-bold w-52">📏 Tinggi (cm)</th>
                  <th className="py-3.5 px-4 font-bold rounded-tr-xl">🌱 Kondisi Tanaman (Ketik Manual)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-emerald-100 text-slate-800 text-sm sm:text-base">
                {journalData.map((row, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={row.dayNumber}
                      className={`transition-colors ${
                        isEven ? 'bg-white hover:bg-emerald-50/50' : 'bg-emerald-50/30 hover:bg-emerald-50/80'
                      }`}
                    >
                      {/* Hari Column */}
                      <td className="py-3 px-4 font-extrabold font-fun text-emerald-900">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-xs text-emerald-800">
                            {row.dayNumber}
                          </span>
                          <span>{row.label}</span>
                        </div>
                      </td>

                      {/* Tanggal Column */}
                      <td className="py-3 px-4">
                        <input
                          type="date"
                          value={row.date}
                          onChange={(e) => onUpdateDay(row.dayNumber, 'date', e.target.value)}
                          className="bg-white border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 w-full cursor-pointer shadow-2xs"
                        />
                      </td>

                      {/* Tinggi Tanaman (cm) with stepper buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(row.dayNumber, -0.5)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 flex items-center justify-center text-sm cursor-pointer active:scale-95"
                            title="Kurang 0.5 cm"
                          >
                            -
                          </button>

                          <div className="relative flex-1">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="0"
                              value={row.heightCm}
                              onChange={(e) => handleHeightChange(row.dayNumber, e.target.value)}
                              className="w-full bg-white border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-3 py-1.5 text-center font-extrabold text-sm sm:text-base text-emerald-900 shadow-2xs"
                            />
                            <span className="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                              cm
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(row.dayNumber, 0.5)}
                            className="w-8 h-8 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold border border-emerald-300 flex items-center justify-center text-sm cursor-pointer active:scale-95"
                            title="Tambah 0.5 cm"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Kondisi Tanaman: Kolom Isian Yang Dapat Diketik Manual Oleh Siswa */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 w-full">
                          {/* Tombol Emoji & Saran Cepat */}
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                sound.playPop();
                                setActiveDayPopup(activeDayPopup === row.dayNumber ? null : row.dayNumber);
                              }}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-base sm:text-lg cursor-pointer transition-transform active:scale-95 shadow-2xs"
                              title="Pilih emoji atau klik saran cepat"
                            >
                              <span>{row.conditionEmoji || '🌱'}</span>
                            </button>

                            {/* Dropdown Emoji & Saran Cepat */}
                            {activeDayPopup === row.dayNumber && (
                              <div className="absolute top-full left-0 z-30 mt-2 w-64 bg-white rounded-2xl border-3 border-emerald-300 shadow-xl p-3 animate-in fade-in duration-150">
                                <div className="text-xs font-bold text-emerald-800 mb-2 flex items-center justify-between">
                                  <span>💡 Saran Cepat (Bisa Diklik):</span>
                                  <button
                                    onClick={() => setActiveDayPopup(null)}
                                    className="text-slate-400 hover:text-slate-600 font-bold"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {CONDITION_OPTIONS.map((opt) => (
                                    <button
                                      key={opt.label}
                                      type="button"
                                      onClick={() => handleSelectCondition(row.dayNumber, opt)}
                                      className={`p-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold text-left transition-transform hover:scale-102 cursor-pointer ${opt.bg}`}
                                    >
                                      <span className="text-base">{opt.emoji}</span>
                                      <span className="truncate">{opt.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Input Isian Teks Manual */}
                          <div className="flex-1 min-w-[160px]">
                            <input
                              type="text"
                              value={row.condition}
                              onChange={(e) => {
                                onUpdateDay(row.dayNumber, 'condition', e.target.value);
                                if (!row.conditionEmoji) {
                                  onUpdateDay(row.dayNumber, 'conditionEmoji', '🌱');
                                }
                              }}
                              placeholder="Ketik kondisi (misal: Daun hijau, segar)..."
                              className="w-full bg-white border-2 border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 rounded-xl px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 shadow-2xs transition-all"
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Save & Feedback Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t-2 border-emerald-100">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
              <span className="text-lg">💾</span>
              <span>
                Jurnal <strong>{activeGroup.name}</strong> tersimpan di browser & siap dikirim ke Google Sheet!
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleSyncThisGroup}
                disabled={syncingToSheet}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm font-fun disabled:opacity-60"
              >
                <span>{syncingToSheet ? '⏳' : '☁️'}</span>
                <span>{syncingToSheet ? 'Menyimpan...' : `Simpan ${activeGroup.name} ke Sheet`}</span>
              </button>

              <button
                onClick={handleSaveAll}
                className="flex-1 sm:flex-initial px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm font-fun"
              >
                <span>🎉</span>
                <span>Simpan Lokal {activeGroup.name}!</span>
              </button>
            </div>
          </div>

          {sheetToast && (
            <div
              className={`mt-4 p-3.5 border-2 rounded-2xl text-center text-xs sm:text-sm font-bold shadow-xs ${
                sheetToast.type === 'success'
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                  : 'bg-rose-100 border-rose-400 text-rose-950'
              }`}
            >
              {sheetToast.message}
            </div>
          )}

          {saveToast && (
            <div className="mt-4 p-3.5 bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-bold rounded-2xl text-center text-sm animate-bounce">
              🌟 Hebat! Jurnal pengamatan {activeGroup.name} berhasil disimpan! Bintang bertambah!
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
