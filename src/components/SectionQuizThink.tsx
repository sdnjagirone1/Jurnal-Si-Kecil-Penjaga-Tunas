import React, { useState } from 'react';
import { JournalDay } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SectionQuizThinkProps {
  journalData: JournalDay[];
  onAddStar?: () => void;
}

export const SectionQuizThink: React.FC<SectionQuizThinkProps> = ({
  journalData,
  onAddStar,
}) => {
  // Get dynamic values from journalData
  const lastDayHeight = Number(journalData[journalData.length - 1]?.heightCm) || 12;

  // Track answers
  const [q1, setQ1] = useState<number | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q3, setQ3] = useState<number | null>(null);
  const [q4, setQ4] = useState<string | null>(null);

  const [scoreToast, setScoreToast] = useState(false);

  // Checks
  const isQ1Correct = q1 === 15;
  const isQ2Correct = q2 === 'ya';
  const isQ3Correct = q3 === lastDayHeight || q3 === Math.round(lastDayHeight);
  const isQ4Correct = q4 === 'matahari_air';

  const correctCount = [isQ1Correct, isQ2Correct, isQ3Correct, isQ4Correct].filter(Boolean).length;

  const handleSelectQ1 = (day: number) => {
    setQ1(day);
    if (day === 15) {
      sound.playStar();
    } else {
      sound.playPop();
    }
  };

  const handleSelectQ2 = (val: string) => {
    setQ2(val);
    if (val === 'ya') {
      sound.playStar();
    } else {
      sound.playPop();
    }
  };

  const handleSelectQ3 = (val: number) => {
    setQ3(val);
    if (val === lastDayHeight || val === Math.round(lastDayHeight)) {
      sound.playStar();
    } else {
      sound.playPop();
    }
  };

  const handleSelectQ4 = (val: string) => {
    setQ4(val);
    if (val === 'matahari_air') {
      sound.playStar();
    } else {
      sound.playPop();
    }
  };

  const handleCheckAll = () => {
    if (correctCount === 4) {
      sound.playFanfare();
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#6366f1'],
      });
      if (onAddStar) onAddStar();
    } else {
      sound.playStar();
    }
    setScoreToast(true);
    setTimeout(() => setScoreToast(false), 4000);
  };

  const handleReadQuestion = (text: string) => {
    sound.speak(text);
  };

  return (
    <section id="tantangan" className="py-12 bg-amber-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-amber-300 shadow-xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-300 px-4 py-1 rounded-full text-amber-900 font-bold text-xs sm:text-sm mb-3">
              <span>🧠</span>
              <span>BAGIAN 8: KUIS REFLEKSI PENELITI</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-fun">
              Ayo Berpikir & Jawab Pertanyaan!
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              Buktikan bahwa kamu sudah menjadi Peneliti Kangkung yang hebat!
            </p>
          </div>

          {/* 4 Interactive Questions */}
          <div className="flex flex-col gap-6 mb-8">
            {/* PERTANYAAN 1 */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-sm font-fun">
                    1
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 font-fun">
                    Pada hari apa tanaman kangkung paling tinggi?
                  </h3>
                </div>
                <button
                  onClick={() => handleReadQuestion('Pada hari apa tanaman kangkung paling tinggi?')}
                  className="text-xs text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-full font-bold cursor-pointer"
                >
                  🔊 Baca
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[1, 5, 10, 15].map((day) => {
                  const isSelected = q1 === day;
                  return (
                    <button
                      key={day}
                      onClick={() => handleSelectQ1(day)}
                      className={`p-3 rounded-2xl border-2 font-bold text-sm transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isSelected
                          ? day === 15
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-103'
                            : 'bg-rose-400 text-white border-rose-500'
                          : 'bg-white hover:bg-emerald-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-xl">{day === 15 ? '🌟' : '🌱'}</span>
                      <span>Hari ke-{day}</span>
                    </button>
                  );
                })}
              </div>

              {q1 !== null && (
                <div className="mt-3 text-xs sm:text-sm font-bold">
                  {q1 === 15 ? (
                    <span className="text-emerald-700">✅ Betul! Di Hari ke-15 tanaman kangkung sudah tumbuh paling tinggi!</span>
                  ) : (
                    <span className="text-rose-600">❌ Coba lagi! Semakin bertambah hari tanaman semakin tinggi, jadi hari ke-15 adalah yang tertinggi!</span>
                  )}
                </div>
              )}
            </div>

            {/* PERTANYAAN 2 */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-sm font-fun">
                    2
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 font-fun">
                    Apakah tanaman kangkung bertambah tinggi?
                  </h3>
                </div>
                <button
                  onClick={() => handleReadQuestion('Apakah tanaman kangkung bertambah tinggi?')}
                  className="text-xs text-sky-800 bg-white border border-sky-300 px-2.5 py-1 rounded-full font-bold cursor-pointer"
                >
                  🔊 Baca
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => handleSelectQ2('ya')}
                  className={`p-4 rounded-2xl border-2 font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-3 ${
                    q2 === 'ya'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-103'
                      : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-2xl">😊</span>
                  <span>YA, BERTAMBAH TINGGI!</span>
                </button>

                <button
                  onClick={() => handleSelectQ2('tidak')}
                  className={`p-4 rounded-2xl border-2 font-bold text-base transition-all cursor-pointer flex items-center justify-center gap-3 ${
                    q2 === 'tidak'
                      ? 'bg-rose-400 text-white border-rose-500 shadow-md'
                      : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-2xl">🤔</span>
                  <span>TIDAK</span>
                </button>
              </div>

              {q2 !== null && (
                <div className="mt-3 text-xs sm:text-sm font-bold">
                  {q2 === 'ya' ? (
                    <span className="text-emerald-700">✅ Hebat! Kangkung tumbuh hidup dan bertambah tinggi setiap hari!</span>
                  ) : (
                    <span className="text-rose-600">❌ Coba perhatikan penggaris di grafik, batangnya bertambah panjang kan?</span>
                  )}
                </div>
              )}
            </div>

            {/* PERTANYAAN 3 */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-sm font-fun">
                    3
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 font-fun">
                    Berapa tinggi tanaman pada hari terakhir (Hari ke-15)?
                  </h3>
                </div>
                <button
                  onClick={() => handleReadQuestion('Berapa tinggi tanaman pada hari terakhir?')}
                  className="text-xs text-purple-800 bg-white border border-purple-300 px-2.5 py-1 rounded-full font-bold cursor-pointer"
                >
                  🔊 Baca
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                {[Math.max(1, lastDayHeight - 5), lastDayHeight, lastDayHeight + 6].map((h) => {
                  const isSelected = q3 === h;
                  const isCorrect = h === lastDayHeight;
                  return (
                    <button
                      key={h}
                      onClick={() => handleSelectQ3(h)}
                      className={`p-3.5 rounded-2xl border-2 font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-103'
                            : 'bg-rose-400 text-white border-rose-500'
                          : 'bg-white hover:bg-purple-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span className="text-xl">📏</span>
                      <span>{h} cm</span>
                    </button>
                  );
                })}
              </div>

              {q3 !== null && (
                <div className="mt-3 text-xs sm:text-sm font-bold">
                  {isQ3Correct ? (
                    <span className="text-emerald-700">✅ Pintar sekali! Sesuai catatan jurnalmu, tingginya adalah {lastDayHeight} cm!</span>
                  ) : (
                    <span className="text-rose-600">❌ Lihat angka di baris Hari ke-7 pada tabel jurnalmu ya!</span>
                  )}
                </div>
              )}
            </div>

            {/* PERTANYAAN 4 */}
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm font-fun">
                    4
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 font-fun">
                    Apa yang dibutuhkan tanaman agar dapat tumbuh?
                  </h3>
                </div>
                <button
                  onClick={() => handleReadQuestion('Apa yang dibutuhkan tanaman agar dapat tumbuh?')}
                  className="text-xs text-amber-900 bg-white border border-amber-300 px-2.5 py-1 rounded-full font-bold cursor-pointer"
                >
                  🔊 Baca
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <button
                  onClick={() => handleSelectQ4('matahari_air')}
                  className={`p-4 rounded-2xl border-2 font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center gap-3 text-left ${
                    q4 === 'matahari_air'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-102'
                      : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-3xl">☀️💧🌱</span>
                  <div>
                    <div>Air, Tanah & Sinar Matahari</div>
                    <div className="text-xs opacity-80">Makanan alami tanaman</div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectQ4('es_krim_hp')}
                  className={`p-4 rounded-2xl border-2 font-bold text-sm sm:text-base transition-all cursor-pointer flex items-center gap-3 text-left ${
                    q4 === 'es_krim_hp'
                      ? 'bg-rose-400 text-white border-rose-500 shadow-md'
                      : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="text-3xl">🍦📱🎮</span>
                  <div>
                    <div>Es Krim & Mainan HP</div>
                    <div className="text-xs opacity-80">Bukan makanan tanaman</div>
                  </div>
                </button>
              </div>

              {q4 !== null && (
                <div className="mt-3 text-xs sm:text-sm font-bold">
                  {q4 === 'matahari_air' ? (
                    <span className="text-emerald-700">✅ Tepat sekali! Kangkung butuh air, tanah yang subur, udara, dan cahaya matahari!</span>
                  ) : (
                    <span className="text-rose-600">❌ Tanaman tidak bisa makan es krim atau main HP! Hehehe.</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Check Results */}
          <div className="text-center pt-4 border-t-2 border-amber-100 flex flex-col items-center">
            <button
              onClick={handleCheckAll}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-lg rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer font-fun flex items-center gap-2"
            >
              <span>⭐</span>
              <span>Periksa Jawaban & Raih Bintang!</span>
            </button>

            {scoreToast && (
              <div className="mt-4 p-4 bg-amber-100 border-2 border-amber-300 text-amber-950 font-bold rounded-2xl text-center text-sm sm:text-base animate-bounce max-w-lg">
                🎉 Kamu berhasil menjawab <strong>{correctCount} dari 4</strong> pertanyaan dengan benar! Kamu calon peneliti cilik jempolan! 🌟
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
