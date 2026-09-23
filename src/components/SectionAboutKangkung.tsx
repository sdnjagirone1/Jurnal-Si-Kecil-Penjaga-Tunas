import React, { useState } from 'react';
import { PlantIllustration } from './PlantIllustration';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

export const SectionAboutKangkung: React.FC = () => {
  const [highlightPart, setHighlightPart] = useState<'akar' | 'batang' | 'daun' | null>(null);
  const [answer, setAnswer] = useState<'yes' | 'no' | null>(null);

  const partsInfo = {
    daun: {
      name: '🍃 Daun Kangkung',
      color: 'bg-emerald-500 text-white',
      desc: 'Daun berbentuk seperti mata panah kecil dan berwarna hijau segar. Daun menyerap cahaya matahari!',
    },
    batang: {
      name: '🌿 Batang Kangkung',
      color: 'bg-lime-500 text-slate-900',
      desc: 'Batang kangkung berongga dan lentur. Batang membawa air dari akar menuju daun agar tanaman berdiri tegak!',
    },
    akar: {
      name: '🌱 Akar Kangkung',
      color: 'bg-amber-500 text-white',
      desc: 'Akar berada di dalam tanah atau air. Akar bertugas menyerap air dan makanan untuk kangkung!',
    },
  };

  const handleSelectAnswer = (choice: 'yes' | 'no') => {
    setAnswer(choice);
    if (choice === 'yes') {
      sound.playStar();
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#facc15', '#38bdf8'],
      });
      sound.speak('Hebat sekali! Betul, kangkung akan bertambah tinggi setiap hari jika kita rawat dengan baik!');
    } else {
      sound.playPop();
      sound.speak('Hmm, coba kita amati nanti di jurnal ya! Kangkung pasti bertambah tinggi jika diberi air dan matahari.');
    }
  };

  const handleReadSummary = () => {
    sound.speak(
      'Kenalan dengan Kangkung. Kangkung adalah tanaman yang enak dimakan. Kangkung butuh air, tanah, udara, dan cahaya matahari. Tanaman tumbuh semakin tinggi dari hari ke hari.'
    );
  };

  return (
    <section id="kenalan" className="py-12 bg-emerald-50/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-emerald-300 shadow-lg">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 px-4 py-1 rounded-full text-emerald-800 font-bold text-sm mb-3">
              <span>🌿</span>
              <span>BAGIAN 2: TENTANG KANGKUNG</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-fun">
              Kenalan dengan Tanaman Kangkung
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              Yuk belajar fakta seru tentang kangkung bersama teman-teman!
            </p>
            <button
              onClick={handleReadSummary}
              className="mt-3 inline-flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              <span>🔊 Bacakan untukku</span>
            </button>
          </div>

          {/* 3 Simple Facts Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <span className="text-4xl p-2 bg-white rounded-2xl shadow-xs">🥗</span>
              <div>
                <h3 className="font-bold text-slate-800 text-base font-fun mb-1">
                  Sayuran Enak & Sehat
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Kangkung adalah tanaman sayur yang bisa dimasak dan dimakan. Banyak vitamin yang bikin tubuh kuat!
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <span className="text-4xl p-2 bg-white rounded-2xl shadow-xs">💧</span>
              <div>
                <h3 className="font-bold text-slate-800 text-base font-fun mb-1">
                  Kebutuhan Tanaman
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Kangkung membutuhkan <strong>air</strong>, <strong>tanah</strong>, <strong>udara</strong>, dan <strong>cahaya matahari</strong> untuk hidup.
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <span className="text-4xl p-2 bg-white rounded-2xl shadow-xs">📏</span>
              <div>
                <h3 className="font-bold text-slate-800 text-base font-fun mb-1">
                  Tumbuh Setiap Hari
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tanaman kangkung tumbuh semakin tinggi dan daunnya bertambah dari hari ke hari!
                </p>
              </div>
            </div>
          </div>

          {/* Plant Parts Interactive Explorer */}
          <div className="bg-gradient-to-r from-emerald-100/60 via-amber-50 to-emerald-100/60 rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-slate-800 font-fun mb-2">
              🔍 Sentuh Bagian Tubuh Tanaman Kangkung!
            </h3>
            <p className="text-center text-sm text-slate-600 mb-6">
              Klik tombol di bawah untuk melihat bagian akar, batang, atau daun!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Illustration with highlights */}
              <div className="md:col-span-6 flex justify-center bg-white/80 p-4 rounded-2xl border-2 border-emerald-100">
                <PlantIllustration stage="tall" highlightPart={highlightPart} heightCm={12} />
              </div>

              {/* Part Selectors */}
              <div className="md:col-span-6 flex flex-col gap-3">
                {/* Daun */}
                <button
                  onClick={() => {
                    sound.playPop();
                    setHighlightPart(highlightPart === 'daun' ? null : 'daun');
                  }}
                  className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    highlightPart === 'daun'
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-102'
                      : 'bg-white hover:bg-emerald-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-lg font-fun">
                    <span className="flex items-center gap-2">🍃 <span>Daun Kangkung</span></span>
                    <span className="text-sm underline">Klik Lihat</span>
                  </div>
                  {highlightPart === 'daun' && (
                    <p className="text-sm text-emerald-100 mt-2 font-medium leading-relaxed">
                      {partsInfo.daun.desc}
                    </p>
                  )}
                </button>

                {/* Batang */}
                <button
                  onClick={() => {
                    sound.playPop();
                    setHighlightPart(highlightPart === 'batang' ? null : 'batang');
                  }}
                  className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    highlightPart === 'batang'
                      ? 'bg-lime-500 text-slate-900 border-lime-600 shadow-md scale-102'
                      : 'bg-white hover:bg-lime-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-lg font-fun">
                    <span className="flex items-center gap-2">🌿 <span>Batang Kangkung</span></span>
                    <span className="text-sm underline">Klik Lihat</span>
                  </div>
                  {highlightPart === 'batang' && (
                    <p className="text-sm text-slate-900 mt-2 font-medium leading-relaxed">
                      {partsInfo.batang.desc}
                    </p>
                  )}
                </button>

                {/* Akar */}
                <button
                  onClick={() => {
                    sound.playPop();
                    setHighlightPart(highlightPart === 'akar' ? null : 'akar');
                  }}
                  className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    highlightPart === 'akar'
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-102'
                      : 'bg-white hover:bg-amber-50 text-slate-800 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-lg font-fun">
                    <span className="flex items-center gap-2">🌱 <span>Akar Kangkung</span></span>
                    <span className="text-sm underline">Klik Lihat</span>
                  </div>
                  {highlightPart === 'akar' && (
                    <p className="text-sm text-amber-100 mt-2 font-medium leading-relaxed">
                      {partsInfo.akar.desc}
                    </p>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Question Card */}
          <div className="bg-amber-50 border-3 border-amber-300 rounded-3xl p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-xs">
            <span className="text-3xl block mb-2">🤔💡</span>
            <h4 className="text-lg sm:text-xl font-extrabold text-slate-800 font-fun mb-2">
              “Menurutmu, apakah tanaman kangkung akan bertambah tinggi setiap hari?”
            </h4>
            <p className="text-sm text-slate-600 mb-6">
              Pilih jawabanmu dengan menekan tombol di bawah:
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handleSelectAnswer('yes')}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-lg font-bold border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  answer === 'yes'
                    ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-200 scale-105 shadow-md'
                    : 'bg-white hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                <span>😊</span>
                <span>YA, BERTAMBAH TINGGI!</span>
              </button>

              <button
                onClick={() => handleSelectAnswer('no')}
                className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl text-lg font-bold border-2 transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  answer === 'no'
                    ? 'bg-rose-500 text-white border-rose-600 ring-4 ring-rose-200 scale-105 shadow-md'
                    : 'bg-white hover:bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                <span>🤔</span>
                <span>TIDAK</span>
              </button>
            </div>

            {/* Feedback message */}
            {answer === 'yes' && (
              <div className="mt-5 p-4 bg-emerald-100 text-emerald-900 rounded-2xl font-bold text-sm sm:text-base border-2 border-emerald-300 animate-bounce">
                🎉 Hore! Jawabanmu Tepat! Kangkung yang disiram dan terkena sinar matahari akan tumbuh semakin tinggi setiap hari! ⭐
              </div>
            )}
            {answer === 'no' && (
              <div className="mt-5 p-4 bg-amber-100 text-amber-900 rounded-2xl font-bold text-sm sm:text-base border-2 border-amber-300">
                🌱 Ayo kita buktikan bersama! Nanti saat kita amati di jurnal, kita lihat apakah kangkungmu bertambah tinggi ya! 😊
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
