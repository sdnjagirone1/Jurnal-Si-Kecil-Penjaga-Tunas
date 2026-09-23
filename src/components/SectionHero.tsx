import React, { useState } from 'react';
import { PlantIllustration } from './PlantIllustration';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface SectionHeroProps {
  onStart: () => void;
  onNavigateToSection: (sectionId: string) => void;
}

export const SectionHero: React.FC<SectionHeroProps> = ({ onStart, onNavigateToSection }) => {
  const [stage, setStage] = useState<'seed' | 'sprout' | 'seedling' | 'tall'>('sprout');
  const [isWatered, setIsWatered] = useState(false);
  const [isSunny, setIsSunny] = useState(false);
  const [sparkleMessage, setSparkleMessage] = useState<string | null>(null);

  const stages: Array<{ id: 'seed' | 'sprout' | 'seedling' | 'tall'; label: string; icon: string; day: string }> = [
    { id: 'seed', label: '1. Biji', icon: '🌰', day: 'Hari 1' },
    { id: 'sprout', label: '2. Kecambah', icon: '🌱', day: 'Hari 2 - 3' },
    { id: 'seedling', label: '3. Tanaman Kecil', icon: '🌿', day: 'Hari 4 - 5' },
    { id: 'tall', label: '4. Tanaman Tinggi', icon: '🍃', day: 'Hari 6 - 7' },
  ];

  const handleWater = () => {
    sound.playWater();
    setIsWatered(true);
    setSparkleMessage('Kangkung segar disiram air! 💧');
    setTimeout(() => setIsWatered(false), 1500);
    setTimeout(() => setSparkleMessage(null), 3000);
  };

  const handleSun = () => {
    sound.playStar();
    setIsSunny(true);
    setSparkleMessage('Matahari hangat membuat kangkung fotosintesis! ☀️');
    setTimeout(() => setIsSunny(false), 1500);
    setTimeout(() => setSparkleMessage(null), 3000);
  };

  const handleLove = () => {
    sound.playStar();
    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#22c55e', '#facc15', '#38bdf8'],
    });
    setSparkleMessage('Kangkung tumbuh sehat dengan kasih sayang! 💚');
    setTimeout(() => setSparkleMessage(null), 3000);
  };

  const handleReadAloud = () => {
    sound.speak(
      'Halo teman-teman kelas satu! Selamat datang di Si Kecil Penjaga Tunas, Media Pembelajaran Interaktif SDN Jagir 1 Surabaya. Ayo amati, ukur, dan catat pertumbuhan tanaman kangkungmu setiap hari!'
    );
  };

  return (
    <section id="beranda" className="relative overflow-hidden py-8 sm:py-14 bg-gradient-to-b from-amber-100/70 via-emerald-50/50 to-amber-50/30">
      {/* Nature Background Elements */}
      <div className="absolute top-4 left-6 text-3xl opacity-70 animate-pulse pointer-events-none">☁️</div>
      <div className="absolute top-16 right-10 text-3xl opacity-80 animate-bounce [animation-duration:5s] pointer-events-none">🦋</div>
      <div className="absolute bottom-6 left-12 text-2xl opacity-60 pointer-events-none">🌼</div>
      <div className="absolute bottom-8 right-16 text-2xl opacity-60 pointer-events-none">🐞</div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Canva Site Card Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-10 border-4 border-emerald-200/80 shadow-xl shadow-emerald-100/50">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-100 border-2 border-emerald-300 px-4 py-1.5 rounded-full text-emerald-900 font-bold text-xs sm:text-sm mb-3 shadow-2xs">
              <span>🏫</span>
              <span>MEDIA PEMBELAJARAN INTERAKTIF KELAS 1 SDN JAGIR I/393 SURABAYA</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 tracking-tight font-fun leading-tight mb-3">
              🌱 <span className="text-emerald-700 underline decoration-amber-400 decoration-wavy decoration-2">
                SI KECIL PENJAGA TUNAS
              </span>
            </h1>

            <p className="text-lg sm:text-2xl font-bold text-emerald-800 mb-4 font-fun">
              “Ayo Amati, Ukur, dan Catat Pertumbuhan Tanaman!” 🌿📏
            </p>

            {/* Read text button for 1st graders */}
            <div className="flex justify-center">
              <button
                onClick={handleReadAloud}
                className="inline-flex items-center gap-2 bg-sky-100 hover:bg-sky-200 text-sky-800 border-2 border-sky-300 px-4 py-2 rounded-2xl font-bold text-sm transition-all shadow-xs cursor-pointer hover:scale-105"
              >
                <span>🔊 Dengarkan Suara Ibu / Bapak Guru</span>
              </button>
            </div>
          </div>

          {/* Interactive Center Stage: Plant Growth Interactive Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Growth Stage Stepper */}
            <div className="lg:col-span-4 flex flex-col gap-3 order-2 lg:order-1">
              <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
                  🌿 Tahap Pertumbuhan
                </span>
                <p className="text-sm text-slate-700 font-medium">
                  Klik setiap tahap di bawah untuk melihat kangkung bertambah tinggi!
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
                {stages.map((st) => {
                  const isActive = stage === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        sound.playPop();
                        setStage(st.id);
                      }}
                      className={`text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isActive
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-md scale-102'
                          : 'bg-white hover:bg-emerald-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{st.icon}</span>
                        <div>
                          <div className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-800'}`}>
                            {st.label}
                          </div>
                          <div className={`text-xs ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                            {st.day}
                          </div>
                        </div>
                      </div>
                      {isActive && <span className="text-lg">✨</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Middle: Visual Plant & Pot */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-sky-50 to-emerald-50/60 rounded-3xl border-2 border-emerald-100 order-1 lg:order-2">
              <PlantIllustration
                stage={stage}
                isWatered={isWatered}
                isSunny={isSunny}
                heightCm={
                  stage === 'seed'
                    ? '0 - 0.5'
                    : stage === 'sprout'
                    ? '1 - 3'
                    : stage === 'seedling'
                    ? '4 - 8'
                    : '10 - 15'
                }
              />

              {sparkleMessage && (
                <div className="mt-2 bg-white/95 text-emerald-800 border-2 border-emerald-300 font-bold px-4 py-2 rounded-full text-xs sm:text-sm shadow-md animate-bounce text-center">
                  {sparkleMessage}
                </div>
              )}
            </div>

            {/* Right: Fun Action Buttons for Kids (Water, Sun, Love) */}
            <div className="lg:col-span-3 flex flex-col gap-3 order-3">
              <div className="bg-sky-50 border-2 border-sky-200 p-3.5 rounded-2xl text-center">
                <span className="text-xs font-bold text-sky-800 uppercase block mb-1">
                  ✨ Rawat Kangkungmu!
                </span>
                <p className="text-xs text-slate-600">
                  Coba tekan tombol di bawah untuk merawat tanaman:
                </p>
              </div>

              <button
                onClick={handleWater}
                className="flex items-center gap-3 bg-sky-400 hover:bg-sky-500 text-white font-bold p-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-2xl bg-white/20 p-2 rounded-xl">💧</span>
                <div className="text-left">
                  <div className="text-sm">Siram Air</div>
                  <div className="text-xs text-sky-100">Beri minum tanaman</div>
                </div>
              </button>

              <button
                onClick={handleSun}
                className="flex items-center gap-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold p-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-2xl bg-white/20 p-2 rounded-xl">☀️</span>
                <div className="text-left">
                  <div className="text-sm">Sinar Matahari</div>
                  <div className="text-xs text-amber-900">Hangat & cerah</div>
                </div>
              </button>

              <button
                onClick={handleLove}
                className="flex items-center gap-3 bg-rose-400 hover:bg-rose-500 text-white font-bold p-3.5 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <span className="text-2xl bg-white/20 p-2 rounded-xl">💖</span>
                <div className="text-left">
                  <div className="text-sm">Kasih Sayang</div>
                  <div className="text-xs text-rose-100">Semangat tumbuh!</div>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Huge Adventure Start Button */}
          <div className="mt-10 pt-6 border-t-2 border-emerald-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <button
              id="btn-mulai-petualangan"
              onClick={() => {
                sound.playStar();
                onStart();
              }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg sm:text-xl font-extrabold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer font-fun flex items-center justify-center gap-3 border-2 border-emerald-300"
            >
              <span>🚀</span>
              <span>MULAI PETUALANGAN SEKARANG!</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                onNavigateToSection('lkpd');
              }}
              className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-emerald-50 text-emerald-800 text-base sm:text-lg font-extrabold rounded-2xl shadow-md border-2 border-emerald-300 hover:scale-105 active:scale-95 transition-all cursor-pointer font-fun flex items-center justify-center gap-2"
            >
              <span>📝</span>
              <span>Lembar Kerja (LKPD 1)</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
