import React from 'react';
import { JournalDay, GROUPS_DATA, GroupInfo } from '../types';
import { sound } from '../utils/audio';

interface SectionGrowthChartProps {
  currentGroupId: number;
  onSelectGroup: (groupId: number) => void;
  journalData: JournalDay[];
  onNavigateToJournal: () => void;
}

export const SectionGrowthChart: React.FC<SectionGrowthChartProps> = ({
  currentGroupId,
  onSelectGroup,
  journalData,
  onNavigateToJournal,
}) => {
  const activeGroup: GroupInfo =
    GROUPS_DATA.find((g) => g.id === currentGroupId) || GROUPS_DATA[0];

  // Convert heights to numbers (15 days)
  const chartData = journalData.map((d) => {
    const parsed = typeof d.heightCm === 'number' ? d.heightCm : parseFloat(d.heightCm) || 0;
    return {
      day: d.dayNumber,
      label: `H-${d.dayNumber}`,
      height: parsed,
      condition: d.condition || 'Sehat',
      emoji: d.conditionEmoji || '🌱',
    };
  });

  const maxHeightValue = Math.max(...chartData.map((d) => d.height), 20);
  const yCeil = Math.ceil(maxHeightValue / 5) * 5 || 20;

  const firstDayHeight = chartData[0]?.height || 0;
  const lastDayHeight = chartData[chartData.length - 1]?.height || 0;
  const growthDifference = Math.max(0, parseFloat((lastDayHeight - firstDayHeight).toFixed(1)));

  const handleReadAloud = () => {
    sound.speak(
      `Wah! Tanaman kangkung milik ${activeGroup.name} semakin tinggi! Pada hari pertama tingginya ${firstDayHeight} sentimeter, dan pada hari ke-15 sudah mencapai ${lastDayHeight} sentimeter. Selama 15 hari bertambah tinggi ${growthDifference} sentimeter!`
    );
  };

  return (
    <section id="grafik" className="py-12 bg-pink-50/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-4 border-pink-300 shadow-xl">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <div className="inline-flex items-center gap-2 bg-pink-100 border border-pink-300 px-4 py-1 rounded-full text-pink-800 font-bold text-xs sm:text-sm mb-3">
              <span>📊</span>
              <span>BAGIAN 7: GRAFIK PERTUMBUHAN 15 HARI</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 font-fun">
              Grafik Pertumbuhan Kangkung 15 Hari
            </h2>
            <p className="text-slate-600 mt-2 font-medium">
              Lihat grafik batang kangkung dari Hari 1 hingga Hari 15 untuk tiap kelompok!
            </p>
          </div>

          {/* Group Switcher inside Chart Section */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            <span className="text-xs font-bold text-slate-600 w-full sm:w-auto text-center">
              Lihat Grafik Kelompok:
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
                      ? 'bg-pink-600 text-white border-pink-700 shadow-xs scale-105'
                      : 'bg-slate-100 hover:bg-pink-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{group.badge}</span>
                  <span>{group.name}</span>
                </button>
              );
            })}
          </div>

          {/* Celebratory Banner */}
          <div className="bg-gradient-to-r from-emerald-100 via-amber-100 to-lime-100 border-3 border-emerald-300 rounded-3xl p-5 mb-8 text-center shadow-xs">
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-fun flex items-center justify-center gap-2 flex-wrap">
              <span>{activeGroup.badge}</span>
              <span>“Wah! Tanaman kangkung {activeGroup.name} semakin tinggi!”</span>
              <span>🌱🎉</span>
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 font-semibold mt-1">
              Grafik batang 15 hari otomatis diperbarui dari Buku Jurnal {activeGroup.name}!
            </p>
            <button
              onClick={handleReadAloud}
              className="mt-2.5 inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <span>🔊 Dengarkan Kesimpulan Grafik</span>
            </button>
          </div>

          {/* MAIN GRAPH AREA: 15-Day Child-Friendly Visual Bar & Stem Chart */}
          <div className="bg-gradient-to-b from-sky-50/70 via-white to-amber-50/50 rounded-3xl p-4 sm:p-6 border-2 border-pink-200 mb-8 relative">
            {/* Top Y-Axis Label */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-pink-700 bg-pink-100 px-3 py-1 rounded-full">
                <span>📏 Sumbu Y: Tinggi Tanaman (cm)</span>
              </div>
              <div className="text-xs font-bold text-slate-500">
                Skala Maksimal: {yCeil} cm
              </div>
            </div>

            {/* Scrollable container for 15 days on small screens */}
            <div className="overflow-x-auto pb-4 no-scrollbar">
              <div
                className="relative h-72 sm:h-80 flex items-end justify-between gap-1 sm:gap-2 pt-8 pb-10 border-b-4 border-amber-800/80 px-2 sm:px-4"
                style={{ minWidth: '650px' }}
              >
                {/* Horizontal guideline marks */}
                <div className="absolute inset-0 top-8 bottom-10 flex flex-col justify-between pointer-events-none opacity-40">
                  <div className="border-b border-dashed border-slate-300 w-full flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-slate-400">
                    {yCeil} cm
                  </div>
                  <div className="border-b border-dashed border-slate-300 w-full flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-slate-400">
                    {Math.round(yCeil * 0.66)} cm
                  </div>
                  <div className="border-b border-dashed border-slate-300 w-full flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-slate-400">
                    {Math.round(yCeil * 0.33)} cm
                  </div>
                  <div className="border-b border-slate-300 w-full flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-slate-400">
                    0 cm
                  </div>
                </div>

                {/* 15 Daily Plant Stems */}
                {chartData.map((item) => {
                  const heightPercent = yCeil > 0 ? Math.min(100, (item.height / yCeil) * 100) : 0;

                  return (
                    <div
                      key={item.day}
                      className="relative flex-1 flex flex-col items-center h-full justify-end group z-10"
                    >
                      {/* Floating height pill */}
                      <div className="mb-1.5 bg-emerald-700 text-white font-extrabold text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full shadow-xs border border-white whitespace-nowrap transition-transform group-hover:scale-110">
                        {item.height > 0 ? `${item.height}` : '0'}
                      </div>

                      {/* Cute Plant Stem Column */}
                      <div
                        className="w-5 sm:w-8 rounded-t-xl transition-all duration-700 relative flex flex-col items-center justify-start overflow-hidden shadow-xs cursor-pointer group-hover:brightness-110"
                        style={{
                          height: `${Math.max(10, heightPercent)}%`,
                          background:
                            item.height > 0
                              ? 'linear-gradient(to top, #16a34a, #22c55e, #86efac)'
                              : '#cbd5e1',
                        }}
                        title={`${activeGroup.name} - Hari ${item.day}: ${item.height} cm (${item.condition})`}
                      >
                        {/* Leaf sprout on top of bar */}
                        {item.height > 0 && (
                          <div className="text-[10px] sm:text-xs -mt-1 animate-bounce">
                            🍃
                          </div>
                        )}
                      </div>

                      {/* Bottom Day Label (Sumbu X) */}
                      <div className="absolute -bottom-8 flex flex-col items-center">
                        <span className="text-[11px] sm:text-xs font-extrabold text-slate-700 font-fun whitespace-nowrap">
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom X-Axis Label */}
            <div className="mt-8 text-center">
              <span className="inline-block bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1 rounded-full text-xs sm:text-sm font-bold">
                🌱 Sumbu X: Hari 1 – Hari 15 (15 Kali Pengamatan {activeGroup.name})
              </span>
            </div>
          </div>

          {/* Educational Insights Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 text-center">
              <span className="text-xs font-bold text-emerald-700 uppercase">Tinggi Hari 1</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-900 font-fun mt-1">
                {firstDayHeight} cm
              </div>
              <span className="text-xs text-slate-500">Awal tumbuh 🌱</span>
            </div>

            <div className="bg-lime-50 border-2 border-lime-200 rounded-2xl p-4 text-center">
              <span className="text-xs font-bold text-lime-800 uppercase">Tinggi Hari 15</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-lime-950 font-fun mt-1">
                {lastDayHeight} cm
              </div>
              <span className="text-xs text-slate-500">Panen subur & segar 🌿</span>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 text-center">
              <span className="text-xs font-bold text-amber-800 uppercase">Pertambahan 15 Hari</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-fun mt-1">
                +{growthDifference} cm
              </div>
              <span className="text-xs text-slate-500">Kerja sama tim hebat! ⭐</span>
            </div>
          </div>

          {/* Quick Jump to Journal Button */}
          <div className="text-center pt-2">
            <button
              onClick={() => {
                sound.playPop();
                onNavigateToJournal();
              }}
              className="inline-flex items-center gap-2 bg-pink-100 hover:bg-pink-200 text-pink-800 border-2 border-pink-300 font-bold px-6 py-2.5 rounded-2xl text-sm transition-all cursor-pointer shadow-2xs"
            >
              <span>✏️ Mau catat hari lain? Buka Jurnal {activeGroup.name}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
