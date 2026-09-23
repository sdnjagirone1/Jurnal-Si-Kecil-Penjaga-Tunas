import React, { useState } from 'react';
import { sound } from '../utils/audio';

export const SectionGuideSteps: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      badge: '1️⃣ Langkah 1',
      title: 'Lihat Tanaman',
      icon: '👀',
      subtitle: 'Amati tanaman dengan teliti.',
      detail:
        'Dekati tanaman kangkungmu di kebun atau di pot. Perhatikan apakah ada tunas baru yang keluar dari tanah hari ini!',
      color: 'from-amber-400 to-yellow-300 text-amber-950 border-amber-300',
      tagBg: 'bg-amber-100 text-amber-900',
    },
    {
      num: 2,
      badge: '2️⃣ Langkah 2',
      title: 'Ukur Tinggi Tanaman',
      icon: '📏',
      subtitle: 'Gunakan penggaris.',
      detail:
        'Tempelkan angka 0 penggaris pada pangkal bawah tanaman dekat tanah. Lalu lihat angka di ujung daun kangkung paling atas!',
      color: 'from-emerald-500 to-green-400 text-white border-emerald-400',
      tagBg: 'bg-emerald-100 text-emerald-900',
    },
    {
      num: 3,
      badge: '3️⃣ Langkah 3',
      title: 'Perhatikan Kondisi Tanaman',
      icon: '🌱',
      subtitle: 'Lihat warna daun, batang, dan kondisi tanaman.',
      detail:
        'Apakah daunnya hijau segar? Apakah batangnya berdiri tegak atau layu butuh disiram air? Apakah ada daun yang menguning?',
      color: 'from-teal-500 to-cyan-400 text-white border-teal-400',
      tagBg: 'bg-teal-100 text-teal-900',
    },
    {
      num: 4,
      badge: '4️⃣ Langkah 4',
      title: 'Catat Hasilnya',
      icon: '✏️',
      subtitle: 'Masukkan hasil pengamatan ke jurnal.',
      detail:
        'Tuliskan tanggal, tinggi tanaman (sentimeter), dan pilih emoji kondisi tanaman di Buku Jurnal Pengamatan!',
      color: 'from-blue-500 to-indigo-400 text-white border-blue-400',
      tagBg: 'bg-blue-100 text-blue-900',
    },
  ];

  const handleReadStep = (stepNum: number) => {
    const s = steps.find((item) => item.num === stepNum);
    if (s) {
      sound.speak(`${s.badge}. ${s.title}. ${s.subtitle}. ${s.detail}`);
    }
  };

  return (
    <section id="cara" className="py-12 bg-sky-50/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-sky-300 shadow-lg">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-sky-100 border border-sky-300 px-4 py-1 rounded-full text-sky-800 font-bold text-sm mb-3">
              <span>📋</span>
              <span>BAGIAN 3: PANDUAN PENGAMATAN</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-fun">
              Cara Melakukan Pengamatan Kangkung
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              Ikuti 4 langkah mudah ini setiap hari agar jadi peneliti cilik yang hebat!
            </p>
          </div>

          {/* Kid with Ruler & Notepad Cartoon Illustration Banner */}
          <div className="bg-gradient-to-r from-amber-50 via-lime-50 to-emerald-50 rounded-3xl p-6 border-2 border-emerald-200 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Cute Kid Scientist Avatar */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-200 border-4 border-white shadow-md flex items-center justify-center text-4xl shrink-0">
                🧑‍🌾
              </div>
              <div>
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-0.5 rounded-full uppercase">
                  Tips Peneliti Cilik
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 font-fun mt-1">
                  “Ukur tanaman di waktu yang sama setiap hari!”
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Misalnya setiap pagi pukul 08.00 bersama Bapak/Ibu Guru atau sepulang sekolah.
                </p>
              </div>
            </div>

            {/* Quick Listen Button */}
            <button
              onClick={() => handleReadStep(activeStep)}
              className="px-4 py-2 bg-white hover:bg-sky-50 text-sky-800 border-2 border-sky-300 rounded-2xl font-bold text-sm shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <span>🔊 Dengarkan Langkah {activeStep}</span>
            </button>
          </div>

          {/* 4 Steps Grid with Step Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {steps.map((st) => {
              const isSelected = activeStep === st.num;
              return (
                <div
                  key={st.num}
                  onClick={() => {
                    sound.playPop();
                    setActiveStep(st.num);
                  }}
                  className={`rounded-2xl p-5 border-3 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-gradient-to-b ' + st.color + ' shadow-lg scale-103'
                      : 'bg-slate-50 hover:bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${isSelected ? 'bg-white/20 text-white' : st.tagBg}`}>
                        {st.badge}
                      </span>
                      <span className="text-3xl">{st.icon}</span>
                    </div>

                    <h4 className={`text-lg font-bold font-fun mb-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                      {st.title}
                    </h4>
                    <p className={`text-xs font-semibold mb-3 ${isSelected ? 'text-white/90' : 'text-emerald-700'}`}>
                      {st.subtitle}
                    </p>
                  </div>

                  <p className={`text-xs leading-relaxed mt-2 p-2 rounded-xl ${isSelected ? 'bg-black/10 text-white/95' : 'bg-white text-slate-600 border border-slate-100'}`}>
                    {st.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Visual Step Guide Diagram */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 border-2 border-slate-200 flex flex-wrap items-center justify-center gap-2 text-center text-xs sm:text-sm font-bold text-slate-600">
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full">👀 1. Lihat</span>
            <span>➡️</span>
            <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">📏 2. Ukur</span>
            <span>➡️</span>
            <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full">🌱 3. Amati Daun</span>
            <span>➡️</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">✏️ 4. Tulis Jurnal</span>
          </div>
        </div>
      </div>
    </section>
  );
};
