import React, { useState, useEffect } from 'react';
import { GROUPS_DATA, GroupInfo, JournalDay } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SectionMeasureProps {
  currentGroupId: number;
  onSelectGroup: (groupId: number) => void;
  journalData: JournalDay[];
  onUpdateJournalHeight: (dayNumber: number, heightCm: number) => void;
}

export const SectionMeasure: React.FC<SectionMeasureProps> = ({
  currentGroupId,
  onSelectGroup,
  journalData,
  onUpdateJournalHeight,
}) => {
  const activeGroup: GroupInfo =
    GROUPS_DATA.find((g) => g.id === currentGroupId) || GROUPS_DATA[0];

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [measuredHeight, setMeasuredHeight] = useState<number>(7.5);
  const [appliedToast, setAppliedToast] = useState<string | null>(null);

  // When selectedDay or currentGroupId changes, sync measuredHeight from journalData if already set
  useEffect(() => {
    const existing = journalData.find((d) => d.dayNumber === selectedDay);
    if (existing && existing.heightCm !== '' && !isNaN(Number(existing.heightCm))) {
      setMeasuredHeight(Number(existing.heightCm));
    }
  }, [selectedDay, currentGroupId, journalData]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMeasuredHeight(val);
    sound.playPop();
  };

  const handleApply = () => {
    sound.playStar();
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b'],
    });

    onUpdateJournalHeight(selectedDay, measuredHeight);

    setAppliedToast(
      `Tinggi ${measuredHeight} cm berhasil disimpan ke Buku Jurnal ${activeGroup.name} (Hari ${selectedDay})! ⭐`
    );
    setTimeout(() => setAppliedToast(null), 3500);
  };

  const handleReadGuide = () => {
    sound.speak(
      `Berapa tinggi tanaman kangkung ${activeGroup.name} pada Hari ke-${selectedDay}? Letakkan angka 0 pada bagian bawah tanaman, lalu lihat angka pada ujung tanaman!`
    );
  };

  return (
    <section id="ukur" className="py-12 bg-indigo-50/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-indigo-300 shadow-xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="inline-flex items-center gap-2 bg-indigo-100 border border-indigo-300 px-4 py-1 rounded-full text-indigo-800 font-bold text-xs sm:text-sm mb-3">
              <span>📏</span>
              <span>BAGIAN 5: SIMULASI PENGUKURAN KELOMPOK</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-fun">
              Ayo Ukur Tinggi Kangkung {activeGroup.name}!
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              Aktivitas seru membaca penggaris dan mencatat langsung ke Buku Jurnal 15 Hari
            </p>
            <button
              onClick={handleReadGuide}
              className="mt-3 inline-flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              <span>🔊 Bacakan Petunjuk</span>
            </button>
          </div>

          {/* Group Switcher inside Section 5 */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-xs font-bold text-slate-600 w-full sm:w-auto text-center">
              Pilih Kelompok Pengukur:
            </span>
            {GROUPS_DATA.map((group) => {
              const isSelected = group.id === currentGroupId;
              return (
                <button
                  key={group.id}
                  onClick={() => {
                    sound.playPop();
                    onSelectGroup(group.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs scale-105 ring-2 ring-indigo-200'
                      : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{group.badge}</span>
                  <span>{group.name}</span>
                </button>
              );
            })}
          </div>

          {/* 15 Days Selector Tabs */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
              <span>📅 Pilih Hari Pengamatan untuk {activeGroup.name}:</span>
              <span className="text-indigo-600">Sedang mengukur Hari ke-{selectedDay}</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {Array.from({ length: 15 }, (_, i) => i + 1).map((d) => {
                const dayData = journalData.find((j) => j.dayNumber === d);
                const hasHeight = dayData && dayData.heightCm !== '' && Number(dayData.heightCm) > 0;
                return (
                  <button
                    key={d}
                    onClick={() => {
                      sound.playPop();
                      setSelectedDay(d);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                      selectedDay === d
                        ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300 scale-105'
                        : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                    }`}
                  >
                    <span>Hari {d}</span>
                    {hasHeight && <span className="text-[10px]">✅</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Guide Banner */}
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4">
            <div className="text-3xl sm:text-4xl p-2 bg-white rounded-2xl shadow-xs">
              💡
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Petunjuk Mengukur:
              </div>
              <p className="text-base sm:text-lg font-bold text-amber-950 font-fun mt-0.5">
                “Letakkan angka 0 pada bagian bawah tanaman, lalu lihat angka pada ujung tanaman.”
              </p>
            </div>
          </div>

          {/* Interactive Simulation Arena */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left/Middle: Visual Ruler & Plant Stage */}
            <div className="lg:col-span-7 bg-gradient-to-b from-sky-50 via-emerald-50/40 to-amber-50/30 rounded-3xl p-6 border-3 border-indigo-100 flex flex-col items-center relative overflow-hidden">
              {/* Tag indicator */}
              <div className="absolute top-3 left-4 text-xs font-bold text-indigo-800 bg-white/90 px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
                {activeGroup.badge} {activeGroup.name} • Hari {selectedDay}
              </div>

              {/* Plant & Ruler Stage */}
              <div className="relative w-full max-w-sm h-84 flex items-end justify-center pt-8">
                {/* Visual Plant Stem & Leaves scaling with measuredHeight */}
                <div className="relative flex flex-col items-center z-10 mr-12">
                  {/* Plant Graphic */}
                  <div
                    className="relative flex flex-col items-center transition-all duration-300 origin-bottom"
                    style={{
                      height: `${Math.max(40, measuredHeight * 12)}px`,
                      maxHeight: '230px',
                    }}
                  >
                    {/* Top leaf */}
                    <div className="w-8 h-10 bg-gradient-to-t from-emerald-500 to-green-400 rounded-t-full border-2 border-emerald-600 shadow-xs flex items-center justify-center">
                      <span className="text-xs">🍃</span>
                    </div>

                    {/* Stem with leaf branches */}
                    <div className="w-4 flex-1 bg-gradient-to-r from-emerald-500 to-green-600 border-x border-emerald-700 relative">
                      {measuredHeight > 4 && (
                        <div className="absolute left-3 top-6 w-6 h-3 bg-emerald-500 rounded-r-full border border-emerald-700"></div>
                      )}
                      {measuredHeight > 8 && (
                        <div className="absolute right-3 top-14 w-6 h-3 bg-emerald-500 rounded-l-full border border-emerald-700"></div>
                      )}
                      {measuredHeight > 14 && (
                        <div className="absolute left-3 top-24 w-7 h-3.5 bg-emerald-500 rounded-r-full border border-emerald-700"></div>
                      )}
                    </div>

                    {/* Indicator line pointing to top leaf */}
                    <div className="absolute -top-3 left-full ml-2 flex items-center gap-1.5 whitespace-nowrap bg-indigo-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-md animate-pulse">
                      <span>⬅️ Ujung Daun: {measuredHeight} cm</span>
                    </div>
                  </div>

                  {/* Cute Pot at bottom */}
                  <div className="w-28 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-b-2xl border-2 border-amber-800 flex flex-col items-center justify-center text-white shadow-md">
                    <span className="text-xs font-bold">🪴 Pot Kangkung</span>
                    <span className="text-[10px] text-amber-200">Pangkal = 0 cm</span>
                  </div>
                </div>

                {/* VIRTUAL RULER (PENGGARIS 0 - 25 CM) */}
                <div
                  className="absolute right-4 bottom-16 w-14 bg-yellow-200 border-2 border-yellow-500 rounded-t-md shadow-md flex flex-col justify-between py-1 ring-2 ring-yellow-400"
                  style={{ height: '240px' }}
                >
                  {/* Ruler graduation marks */}
                  <div className="flex flex-col justify-between h-full px-1 text-[9px] font-mono font-bold text-amber-950">
                    {[25, 20, 15, 12, 10, 8, 6, 4, 2, 0].map((num) => (
                      <div key={num} className="flex items-center justify-between border-b border-yellow-400/80">
                        <span>{num}</span>
                        <div className={`h-0.5 bg-amber-900 ${num % 5 === 0 ? 'w-4' : 'w-2'}`}></div>
                      </div>
                    ))}
                  </div>
                  <span className="text-[9px] font-bold text-center text-amber-800">
                    CM
                  </span>
                </div>
              </div>

              {/* Zero mark alignment hint */}
              <div className="mt-3 text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span>📍 Angka 0 tepat di garis pangkal tanah pot</span>
              </div>
            </div>

            {/* Right: Controls & Data Input */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {/* Question Box */}
              <div className="bg-indigo-50 border-2 border-indigo-200 p-5 rounded-2xl">
                <h3 className="text-lg font-bold text-indigo-950 font-fun mb-1">
                  “Berapa tinggi kangkung {activeGroup.name} (Hari {selectedDay})?”
                </h3>
                <p className="text-xs text-slate-600 mb-4">
                  Geser tombol atau pilih angka cepat untuk mencatat ke Jurnal:
                </p>

                {/* Interactive Slider (0 to 30 cm) */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span>0 cm (Tunas Awal)</span>
                    <span>30 cm (Kangkung Dewasa)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={measuredHeight}
                    onChange={handleSliderChange}
                    className="w-full accent-indigo-600 h-3.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Main Height Input Display */}
                <div className="bg-white border-3 border-indigo-300 rounded-2xl p-4 text-center shadow-xs">
                  <span className="text-xs font-bold text-indigo-600 uppercase block mb-1">
                    Hasil Pengukuran Hari ke-{selectedDay}
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-indigo-950 font-fun flex items-center justify-center gap-2">
                    <span>📏</span>
                    <span>{measuredHeight}</span>
                    <span className="text-xl text-slate-500 font-normal">cm</span>
                  </div>
                </div>
              </div>

              {/* Transfer to Journal Button */}
              <button
                onClick={handleApply}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-extrabold text-base rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer font-fun flex items-center justify-center gap-2"
              >
                <span>💾</span>
                <span>Simpan ke Jurnal {activeGroup.name} (Hari {selectedDay})</span>
              </button>

              {appliedToast && (
                <div className="p-3 bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-bold rounded-2xl text-center text-sm animate-bounce">
                  {appliedToast}
                </div>
              )}

              {/* Quick preset buttons for Grade 1 */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                <span className="text-xs font-bold text-slate-600 block mb-2">
                  ⚡ Pilihan Cepat Tinggi (cm):
                </span>
                <div className="flex flex-wrap gap-2">
                  {[1, 3, 5, 8, 11, 15, 18, 22, 26].map((cm) => (
                    <button
                      key={cm}
                      onClick={() => {
                        setMeasuredHeight(cm);
                        sound.playPop();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-100 border border-slate-300 text-xs font-bold text-slate-700 hover:text-indigo-800 transition-colors cursor-pointer"
                    >
                      {cm} cm
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
