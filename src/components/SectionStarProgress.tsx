import React, { useState } from 'react';
import { GROUPS_DATA, GroupInfo, JournalDay } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SectionStarProgressProps {
  currentGroupId: number;
  onSelectGroup: (groupId: number) => void;
  allGroupJournals: Record<number, JournalDay[]>;
  onAddStar?: () => void;
}

export const SectionStarProgress: React.FC<SectionStarProgressProps> = ({
  currentGroupId,
  onSelectGroup,
  allGroupJournals,
  onAddStar,
}) => {
  const activeGroup: GroupInfo =
    GROUPS_DATA.find((g) => g.id === currentGroupId) || GROUPS_DATA[0];

  const activeJournal = allGroupJournals[currentGroupId] || [];

  // Calculate filled days for active group
  const filledDaysCount = activeJournal.filter(
    (d) => d.heightCm !== '' && Number(d.heightCm) > 0
  ).length;

  // Student check-in clicks state stored locally
  const [studentBonusStars, setStudentBonusStars] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('kangkung_student_stars_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {};
  });

  const handleStudentStarClick = (studentName: string) => {
    sound.playStar();
    confetti({
      particleCount: 20,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#10b981', '#6366f1'],
    });

    setStudentBonusStars((prev) => {
      const next = {
        ...prev,
        [studentName]: (prev[studentName] || 0) + 1,
      };
      localStorage.setItem('kangkung_student_stars_v1', JSON.stringify(next));
      return next;
    });

    if (onAddStar) onAddStar();
  };

  const handleCelebration = () => {
    sound.playFanfare();
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#eab308', '#22c55e', '#3b82f6', '#ec4899', '#a855f7'],
    });
  };

  const handleReadSummary = () => {
    sound.speak(
      `Papan progres bintang ${activeGroup.name}. ${filledDaysCount} dari 15 hari pengamatan sudah berhasil dicatat di buku jurnal. Hebat sekali para anggota kelompok!`
    );
  };

  return (
    <section id="bintang" className="py-12 bg-gradient-to-b from-yellow-50/60 via-amber-50/40 to-emerald-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-amber-300 shadow-xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 px-4 py-1 rounded-full text-amber-900 font-bold text-xs sm:text-sm mb-3 shadow-2xs">
              <span>🌟</span>
              <span>BAGIAN 9: PAPAN PROGRES BINTANG PENGAMATAN</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-800 font-fun">
              Papan Prestasi Bintang Peneliti Cilik
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              Setiap kali kamu mengisi hasil pengamatan di buku jurnal, bintang emas kelompokmu akan bertambah!
            </p>
            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                onClick={handleReadSummary}
                className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-900 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                <span>🔊 Bacakan Ringkasan</span>
              </button>
              <button
                onClick={handleCelebration}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <span>✨ Rayakan Bintang!</span>
              </button>
            </div>
          </div>

          {/* Group Selector */}
          <div className="mb-8">
            <span className="text-xs sm:text-sm font-extrabold text-slate-700 block mb-2 font-fun text-center sm:text-left">
              Pilih Kelompok untuk Melihat Progres Bintang:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
              {GROUPS_DATA.map((group) => {
                const isSelected = group.id === currentGroupId;
                const groupFilled = (allGroupJournals[group.id] || []).filter(
                  (d) => d.heightCm !== '' && Number(d.heightCm) > 0
                ).length;

                return (
                  <button
                    key={group.id}
                    onClick={() => {
                      sound.playPop();
                      onSelectGroup(group.id);
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                      isSelected
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-md scale-103 ring-4 ring-amber-200'
                        : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-0.5">{group.badge}</span>
                    <span className="font-extrabold text-sm sm:text-base font-fun">{group.name}</span>
                    <span className="text-xs font-bold mt-1 text-amber-900">
                      ⭐ {groupFilled} / 15 Hari
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Group Highlight Banner */}
          <div className="bg-gradient-to-r from-amber-100 via-yellow-50 to-emerald-100 rounded-3xl p-6 border-3 border-amber-300 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-amber-300 flex items-center justify-center text-4xl sm:text-5xl shadow-sm shrink-0 animate-bounce">
                {activeGroup.badge}
              </div>
              <div>
                <span className="bg-amber-500 text-white text-xs font-extrabold px-3 py-0.5 rounded-full uppercase">
                  Papan Aktif
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-fun mt-1">
                  {activeGroup.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {activeGroup.members.length} Peneliti Cilik Beraksi • SDN Jagir 1
                </p>
              </div>
            </div>

            {/* Star Total Pill */}
            <div className="bg-white rounded-2xl p-4 border-2 border-amber-300 flex items-center gap-4 text-center shadow-xs">
              <div>
                <span className="text-xs font-bold text-slate-500 block uppercase">Bintang Terkumpul</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-fun flex items-center justify-center gap-1">
                  <span>⭐</span>
                  <span>{filledDaysCount}</span>
                  <span className="text-base text-slate-400 font-normal">/ 15</span>
                </div>
              </div>

              <div className="border-l border-slate-200 pl-4">
                <span className="text-xs font-bold text-slate-500 block uppercase">Pencapaian</span>
                <span className="text-sm font-extrabold text-emerald-700 font-fun">
                  {Math.round((filledDaysCount / 15) * 100)}% Lengkap
                </span>
              </div>
            </div>
          </div>

          {/* 15 Days Star Stamp Grid */}
          <div className="bg-amber-50/60 rounded-3xl p-5 sm:p-6 border-2 border-amber-200 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base sm:text-lg font-bold text-slate-800 font-fun flex items-center gap-2">
                <span>🌟</span>
                <span>Peta Koleksi 15 Bintang Emas {activeGroup.name}:</span>
              </h4>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                1 Pengamatan Jurnal = 1 Bintang ⭐
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-15 gap-2">
              {Array.from({ length: 15 }, (_, i) => i + 1).map((dayNum) => {
                const dayData = activeJournal.find((d) => d.dayNumber === dayNum);
                const isEarned = dayData && dayData.heightCm !== '' && Number(dayData.heightCm) > 0;

                return (
                  <div
                    key={dayNum}
                    className={`rounded-2xl p-2.5 flex flex-col items-center text-center transition-all ${
                      isEarned
                        ? 'bg-amber-400 text-amber-950 shadow-sm scale-102 ring-2 ring-amber-300'
                        : 'bg-white text-slate-400 border border-slate-200'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl mb-1">
                      {isEarned ? '⭐' : '🌱'}
                    </span>
                    <span className="text-[11px] font-extrabold font-fun">H-{dayNum}</span>
                    <span className="text-[9px] truncate w-full">
                      {isEarned ? `${dayData.heightCm} cm` : 'Belum'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INDIVIDUAL STUDENT STAR BOARD (TIAP SISWA) */}
          <div className="bg-white rounded-3xl p-5 sm:p-8 border-3 border-emerald-300 shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b-2 border-emerald-100">
              <div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-fun flex items-center gap-2">
                  <span>👦👧</span>
                  <span>Bintang Setiap Anggota {activeGroup.name}:</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Klik tombol <strong>“+ Bintang Hari Ini”</strong> ketika siswa ikut aktif merawat dan mengukur tanaman!
                </p>
              </div>

              <div className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-full self-start sm:self-auto">
                Total Anggota: {activeGroup.members.length} Siswa
              </div>
            </div>

            {/* Student Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeGroup.members.map((member, index) => {
                const bonus = studentBonusStars[member] || 0;
                const totalMemberStars = filledDaysCount + bonus;

                // Milestone badge
                let milestoneBadge = '🌱 Tunas Cilik';
                let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                if (totalMemberStars >= 15) {
                  milestoneBadge = '🏆 Peneliti Hebat 15 Hari';
                  badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
                } else if (totalMemberStars >= 10) {
                  milestoneBadge = '🌿 Kangkung Subur';
                  badgeColor = 'bg-green-100 text-green-800 border-green-300';
                } else if (totalMemberStars >= 5) {
                  milestoneBadge = '🍃 Daun Pertama';
                  badgeColor = 'bg-teal-100 text-teal-800 border-teal-300';
                }

                return (
                  <div
                    key={member}
                    className="bg-gradient-to-r from-emerald-50/70 to-teal-50/50 border-2 border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 shadow-2xs hover:border-emerald-400 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white border-2 border-emerald-300 flex items-center justify-center text-xl font-black text-emerald-800 shadow-xs font-fun">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-lg font-extrabold text-slate-800 font-fun">
                            {member}
                          </div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                            {milestoneBadge}
                          </span>
                        </div>
                      </div>

                      {/* Stars badge */}
                      <div className="text-right">
                        <div className="text-xl font-extrabold text-amber-500 flex items-center gap-1 font-fun justify-end">
                          <span>⭐</span>
                          <span>{totalMemberStars}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold">Bintang Emas</span>
                      </div>
                    </div>

                    {/* Visual Star Rows */}
                    <div className="bg-white/80 rounded-xl p-2 border border-emerald-200 flex flex-wrap items-center gap-1 min-h-[36px]">
                      {Array.from({ length: Math.min(15, totalMemberStars) }).map((_, sIdx) => (
                        <span key={sIdx} className="text-base" title={`Bintang ke-${sIdx + 1}`}>
                          ⭐
                        </span>
                      ))}
                      {totalMemberStars > 15 && (
                        <span className="text-xs font-bold text-amber-700 ml-1">
                          +{totalMemberStars - 15} Bonus
                        </span>
                      )}
                      {totalMemberStars === 0 && (
                        <span className="text-xs text-slate-400 italic">
                          Mulai isi jurnal untuk dapat bintang!
                        </span>
                      )}
                    </div>

                    {/* Interactive Add Star Button for this student */}
                    <button
                      onClick={() => handleStudentStarClick(member)}
                      className="w-full py-2 bg-white hover:bg-amber-100 text-amber-900 border-2 border-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>🌟</span>
                      <span>Beri Bintang untuk {member} Hari Ini</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3 Milestone Badges for Grade 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
              <span className="text-3xl block mb-1">🌱</span>
              <h5 className="font-extrabold text-emerald-900 font-fun text-sm sm:text-base">
                Tahap 1: Tunas Awal
              </h5>
              <p className="text-xs text-emerald-700 mt-1">
                Isi Hari 1 s.d. Hari 5 untuk meraih Lencana Tunas Kangkung!
              </p>
              <div className="mt-2 text-xs font-bold text-slate-600">
                {filledDaysCount >= 5 ? '✅ Berhasil Diraih!' : `${Math.min(5, filledDaysCount)}/5 Hari`}
              </div>
            </div>

            <div className="bg-lime-50 border-2 border-lime-200 rounded-2xl p-4 text-center">
              <span className="text-3xl block mb-1">🌿</span>
              <h5 className="font-extrabold text-lime-950 font-fun text-sm sm:text-base">
                Tahap 2: Daun Rimbun
              </h5>
              <p className="text-xs text-lime-800 mt-1">
                Isi Hari 6 s.d. Hari 10 untuk membuka Lencana Kangkung Subur!
              </p>
              <div className="mt-2 text-xs font-bold text-slate-600">
                {filledDaysCount >= 10 ? '✅ Berhasil Diraih!' : `${Math.min(10, filledDaysCount)}/10 Hari`}
              </div>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
              <span className="text-3xl block mb-1">🌟</span>
              <h5 className="font-extrabold text-amber-950 font-fun text-sm sm:text-base">
                Tahap 3: Panen Raya 15 Hari
              </h5>
              <p className="text-xs text-amber-800 mt-1">
                Isi lengkap 15 Hari pengamatan untuk meraih Bintang Kehormatan Utama!
              </p>
              <div className="mt-2 text-xs font-bold text-slate-600">
                {filledDaysCount >= 15 ? '🎉 Selesai Sempurna!' : `${filledDaysCount}/15 Hari`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
