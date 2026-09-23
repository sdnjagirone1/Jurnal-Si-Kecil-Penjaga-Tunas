import React, { useState, useEffect } from 'react';
import { GROUPS_DATA, GroupInfo, JournalDay } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SectionObservationProps {
  currentGroupId: number;
  onSelectGroup: (groupId: number) => void;
  journalData: JournalDay[];
  onUpdateJournalObservation: (
    dayNumber: number,
    data: {
      hasNewLeaves: boolean;
      grewTaller: boolean;
      greenLeaves: boolean;
      looksFresh: boolean;
      hasYellowLeaves: boolean;
      seedNotSprouted?: boolean;
      notes: string;
      condition?: string;
      conditionEmoji?: string;
    }
  ) => void;
  onAddStar?: () => void;
}

export const SectionObservation: React.FC<SectionObservationProps> = ({
  currentGroupId,
  onSelectGroup,
  journalData,
  onUpdateJournalObservation,
  onAddStar,
}) => {
  const activeGroup: GroupInfo =
    GROUPS_DATA.find((g) => g.id === currentGroupId) || GROUPS_DATA[0];

  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [seedNotSprouted, setSeedNotSprouted] = useState<boolean>(false);
  const [hasNewLeaves, setHasNewLeaves] = useState<boolean>(true);
  const [grewTaller, setGrewTaller] = useState<boolean>(true);
  const [greenLeaves, setGreenLeaves] = useState<boolean>(true);
  const [looksFresh, setLooksFresh] = useState<boolean>(true);
  const [hasYellowLeaves, setHasYellowLeaves] = useState<boolean>(false);
  const [plantCondition, setPlantCondition] = useState<string>('');
  const [dailyNotes, setDailyNotes] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state from journalData whenever selectedDay or currentGroupId changes
  useEffect(() => {
    const dayData = journalData.find((d) => d.dayNumber === selectedDay);
    if (dayData) {
      setSeedNotSprouted(dayData.seedNotSprouted ?? false);
      setHasNewLeaves(dayData.hasNewLeaves ?? true);
      setGrewTaller(dayData.grewTaller ?? true);
      setGreenLeaves(dayData.greenLeaves ?? true);
      setLooksFresh(dayData.looksFresh ?? true);
      setHasYellowLeaves(dayData.hasYellowLeaves ?? false);
      setPlantCondition(dayData.condition || '');
      setDailyNotes(dayData.notes || '');
    }
  }, [selectedDay, currentGroupId, journalData]);

  const quickStickers = [
    '🌰 Biji belum tumbuh',
    '🌱 Mulai berkecambah!',
    '🍃 Daun makin lebat!',
    '📏 Tumbuh lebih tinggi!',
    '☀️ Sangat segar!',
    '💧 Sudah disiram!',
  ];

  const handleAddSticker = (stickerText: string) => {
    sound.playPop();
    setDailyNotes((prev) => (prev ? `${prev} ${stickerText}` : stickerText));
  };

  const handleSaveObservation = () => {
    sound.playStar();
    confetti({
      particleCount: 35,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#3b82f6'],
    });

    // Use custom condition typed by students, or auto-derive if empty
    let condition = plantCondition.trim();
    let conditionEmoji = '🌱';
    if (!condition) {
      if (seedNotSprouted) {
        condition = 'Biji belum tumbuh';
        conditionEmoji = '🌰';
      } else if (hasYellowLeaves) {
        condition = 'Ada daun menguning';
        conditionEmoji = '⚠️';
      } else if (looksFresh) {
        condition = 'Segar';
        conditionEmoji = '☀️';
      } else if (greenLeaves) {
        condition = 'Daun hijau';
        conditionEmoji = '😊';
      } else if (hasNewLeaves) {
        condition = 'Daun bertambah';
        conditionEmoji = '🍃';
      } else {
        condition = 'Sehat';
      }
    } else {
      if (condition.toLowerCase().includes('biji') || condition.toLowerCase().includes('belum')) {
        conditionEmoji = '🌰';
      } else if (condition.toLowerCase().includes('kuning') || condition.toLowerCase().includes('layu')) {
        conditionEmoji = '🍂';
      } else if (condition.toLowerCase().includes('segar') || condition.toLowerCase().includes('tumbuh')) {
        conditionEmoji = '☀️';
      } else if (condition.toLowerCase().includes('daun') || condition.toLowerCase().includes('hijau')) {
        conditionEmoji = '🍃';
      }
    }

    onUpdateJournalObservation(selectedDay, {
      hasNewLeaves,
      grewTaller,
      greenLeaves,
      looksFresh,
      hasYellowLeaves,
      seedNotSprouted,
      notes: dailyNotes,
      condition,
      conditionEmoji,
    });

    if (onAddStar) onAddStar();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleReadGuide = () => {
    sound.speak(
      `Ayo amati tanaman kangkung ${activeGroup.name} pada Hari ke-${selectedDay}! Centang apa yang kamu lihat hari ini: apakah memiliki daun baru? Bertambah tinggi? Daunnya berwarna hijau? Terlihat segar? Atau ada daun yang menguning? Tuliskan apa yang kamu lihat!`
    );
  };

  return (
    <section id="amati" className="py-12 bg-purple-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-purple-300 shadow-xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="inline-flex items-center gap-2 bg-purple-100 border border-purple-300 px-4 py-1 rounded-full text-purple-800 font-bold text-xs sm:text-sm mb-3">
              <span>🔍</span>
              <span>BAGIAN 6: LEMBAR PENGAMATAN 15 HARI TERSINKRON</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-fun">
              Ayo Amati Kangkung {activeGroup.name}!
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              Hasil checklist pengamatan di sini otomatis tersimpan ke Buku Jurnal 15 Hari!
            </p>
            <button
              onClick={handleReadGuide}
              className="mt-3 inline-flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-800 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              <span>🔊 Bacakan Lembar Ceklis</span>
            </button>
          </div>

          {/* Group Switcher inside Section 6 */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-xs font-bold text-slate-600 w-full sm:w-auto text-center">
              Pilih Kelompok Pengamat:
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
                      ? 'bg-purple-600 text-white border-purple-700 shadow-xs scale-105 ring-2 ring-purple-200'
                      : 'bg-slate-100 hover:bg-purple-50 text-slate-700 border-slate-200'
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
              <span>📅 Pilih Hari Ceklis:</span>
              <span className="text-purple-700 font-bold">
                Mengamati Hari ke-{selectedDay} ({activeGroup.name})
              </span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
              {Array.from({ length: 15 }, (_, i) => i + 1).map((d) => {
                const dayData = journalData.find((j) => j.dayNumber === d);
                const isChecked = dayData && (dayData.notes || dayData.condition);
                return (
                  <button
                    key={d}
                    onClick={() => {
                      sound.playPop();
                      setSelectedDay(d);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1 ${
                      selectedDay === d
                        ? 'bg-purple-600 text-white shadow-md scale-105 ring-2 ring-purple-300'
                        : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200'
                    }`}
                  >
                    <span>Hari {d}</span>
                    {isChecked && <span className="text-[10px]">⭐</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checklist Card */}
          <div className="bg-gradient-to-br from-purple-50/60 via-pink-50/40 to-white rounded-3xl p-6 sm:p-8 border-2 border-purple-200 mb-8">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 font-fun mb-4 flex items-center gap-2">
              <span>📋</span>
              <span>Hari ini (Hari {selectedDay}), tanaman kangkung {activeGroup.name}:</span>
            </h3>

            {/* Checklist items */}
            <div className="flex flex-col gap-3">
              {/* Check 0: Biji belum tumbuh */}
              <label
                onClick={() => {
                  sound.playPop();
                  const next = !seedNotSprouted;
                  setSeedNotSprouted(next);
                  if (next) {
                    setHasNewLeaves(false);
                    setGrewTaller(false);
                    setGreenLeaves(false);
                    if (!plantCondition || plantCondition === 'Sehat') {
                      setPlantCondition('Biji belum tumbuh');
                    }
                  } else {
                    if (plantCondition === 'Biji belum tumbuh') {
                      setPlantCondition('');
                    }
                  }
                }}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  seedNotSprouted
                    ? 'bg-amber-100/90 border-amber-500 text-amber-950 shadow-xs ring-2 ring-amber-300/60'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50/50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${
                    seedNotSprouted ? 'bg-amber-600 text-white' : 'border-2 border-slate-300'
                  }`}
                >
                  {seedNotSprouted ? '✓' : ''}
                </div>
                <span className="text-2xl">🌰</span>
                <div className="flex flex-col">
                  <span className="font-bold text-sm sm:text-base text-slate-800">
                    Biji belum tumbuh
                  </span>
                  <span className="text-xs text-amber-800 font-medium">
                    (Biji masih berada di dalam tanah, belum keluar tunas/akar)
                  </span>
                </div>
              </label>

              {/* Check 1 */}
              <label
                onClick={() => {
                  sound.playPop();
                  setHasNewLeaves(!hasNewLeaves);
                }}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  hasNewLeaves
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${
                    hasNewLeaves ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'
                  }`}
                >
                  {hasNewLeaves ? '✓' : ''}
                </div>
                <span className="text-xl">🌿</span>
                <span className="font-bold text-sm sm:text-base">Memiliki daun baru</span>
              </label>

              {/* Check 2 */}
              <label
                onClick={() => {
                  sound.playPop();
                  setGrewTaller(!grewTaller);
                }}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  grewTaller
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${
                    grewTaller ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'
                  }`}
                >
                  {grewTaller ? '✓' : ''}
                </div>
                <span className="text-xl">📏</span>
                <span className="font-bold text-sm sm:text-base">Bertambah tinggi</span>
              </label>

              {/* Check 3 */}
              <label
                onClick={() => {
                  sound.playPop();
                  setGreenLeaves(!greenLeaves);
                }}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  greenLeaves
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${
                    greenLeaves ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'
                  }`}
                >
                  {greenLeaves ? '✓' : ''}
                </div>
                <span className="text-xl">💚</span>
                <span className="font-bold text-sm sm:text-base">Daunnya berwarna hijau</span>
              </label>

              {/* Check 4 */}
              <label
                onClick={() => {
                  sound.playPop();
                  setLooksFresh(!looksFresh);
                }}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  looksFresh
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${
                    looksFresh ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300'
                  }`}
                >
                  {looksFresh ? '✓' : ''}
                </div>
                <span className="text-xl">💧</span>
                <span className="font-bold text-sm sm:text-base">Terlihat segar dan segar</span>
              </label>

              {/* Check 5 */}
              <label
                onClick={() => {
                  sound.playPop();
                  setHasYellowLeaves(!hasYellowLeaves);
                }}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  hasYellowLeaves
                    ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-base transition-colors ${
                    hasYellowLeaves ? 'bg-amber-500 text-white' : 'border-2 border-slate-300'
                  }`}
                >
                  {hasYellowLeaves ? '✓' : ''}
                </div>
                <span className="text-xl">🟡</span>
                <span className="font-bold text-sm sm:text-base">Ada daun yang menguning</span>
              </label>
            </div>
          </div>

          {/* Daily Notes & Manual Condition Input */}
          <div className="bg-purple-50/60 rounded-3xl p-6 sm:p-8 border-2 border-purple-200 mb-8 space-y-5">
            {/* Input Kondisi Tanaman (Ketik Manual) */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-800 font-fun mb-1.5 flex items-center gap-2">
                <span>🌱</span>
                <span>Kondisi Tanaman (Ketik Manual oleh Siswa):</span>
              </label>
              <input
                type="text"
                value={plantCondition}
                onChange={(e) => setPlantCondition(e.target.value)}
                placeholder="Ketik kondisi kangkung di sini (misal: Daun hijau segar, tumbuh tunas, segar sekali)..."
                className="w-full bg-white border-2 border-purple-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-2xl px-4 py-2.5 font-semibold text-slate-800 text-sm sm:text-base placeholder:text-slate-400 shadow-2xs transition-all"
              />
            </div>

            {/* Catatan Tambahan */}
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 font-fun mb-1.5 flex items-center gap-2">
                <span>✍️</span>
                <span>“Apa yang kalian lihat hari ini (Hari {selectedDay})?”</span>
              </h3>
              <p className="text-xs text-slate-600 mb-2 font-medium">
                Tulis catatan atau klik tombol stiker cepat di bawah:
              </p>

              {/* Quick Stickers */}
              <div className="flex flex-wrap gap-2 mb-3">
                {quickStickers.map((sticker) => (
                  <button
                    key={sticker}
                    onClick={() => handleAddSticker(sticker)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-100 border border-purple-200 text-xs font-bold text-purple-900 transition-colors cursor-pointer shadow-2xs"
                  >
                    {sticker}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                rows={3}
                value={dailyNotes}
                onChange={(e) => setDailyNotes(e.target.value)}
                placeholder="Contoh: Kangkung segar sekali, ada dua daun baru tumbuh ke arah cahaya matahari!"
                className="w-full bg-white border-2 border-purple-300 rounded-2xl p-3.5 font-medium text-slate-800 text-sm sm:text-base focus:border-purple-500 focus:ring-2 focus:ring-purple-200 shadow-2xs"
              />
            </div>
          </div>

          {/* Action Button: Save to active group's journal */}
          <div className="text-center flex flex-col items-center">
            <button
              onClick={handleSaveObservation}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-base sm:text-lg rounded-2xl shadow-xl transition-all active:scale-95 cursor-pointer font-fun flex items-center gap-2"
            >
              <span>⭐</span>
              <span>Simpan Ceklis ke Jurnal {activeGroup.name} (Hari {selectedDay})</span>
            </button>

            {savedSuccess && (
              <div className="mt-4 p-4 bg-emerald-100 border-2 border-emerald-300 text-emerald-950 font-bold rounded-2xl text-center text-sm sm:text-base animate-bounce max-w-lg">
                🎉 Hebat! Lembar pengamatan Hari ke-{selectedDay} {activeGroup.name} berhasil tersinkron dengan Buku Jurnal! ⭐
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
