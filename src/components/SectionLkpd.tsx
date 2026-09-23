import React, { useState, useRef, useEffect } from 'react';
import { LkpdData, LkpdStepTask, LkpdReflection, GROUPS_DATA } from '../types';
import { sound } from '../utils/audio';
import { sheetService } from '../utils/sheetService';
import confetti from 'canvas-confetti';

interface SectionLkpdProps {
  currentGroupId: number;
  onSelectGroup: (groupId: number) => void;
  allGroupLkpd: Record<number, LkpdData>;
  onUpdateGroupLkpd: (groupId: number, data: LkpdData) => void;
  onAddStar: () => void;
  onOpenSheetModal: () => void;
}

const PREDICTION_SUGGESTIONS = [
  '🌱 Mulai berkecambah dan berakar di tanah',
  '🍃 Tumbuh tunas daun hijau pertama',
  '📏 Batangnya mulai tegak dan meninggi',
  '🌰 Kulit biji merekah dan terlepas',
  '☀️ Tumbuh segar mencari sinar matahari',
];

export const SectionLkpd: React.FC<SectionLkpdProps> = ({
  currentGroupId,
  onSelectGroup,
  allGroupLkpd,
  onUpdateGroupLkpd,
  onAddStar,
  onOpenSheetModal,
}) => {
  const currentGroup = GROUPS_DATA.find((g) => g.id === currentGroupId) || GROUPS_DATA[0];
  const lkpdData = allGroupLkpd[currentGroupId] || {
    groupId: currentGroupId,
    groupName: currentGroup.name,
    members: currentGroup.members.join(', '),
    tasks: {
      wadahMedia: false,
      lubangKecil: false,
      letakBiji: false,
      tutupMedia: false,
      siramSecukupnya: false,
      labelNama: false,
    },
    drawingDataUrl: '',
    prediction: '',
    reflection: {
      senang: false,
      bekerjaSama: false,
      siapMerawat: false,
    },
  };

  // Drawing canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState<string>('#8B5A2B'); // Default tanah
  const [brushSize, setBrushSize] = useState<number>(8);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<{
    type: 'idle' | 'saving' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  // Init canvas with saved drawing or clear white
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset history when switching groups
    setHistory([]);

    if (lkpdData.drawingDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([snapshot]);
      };
      img.src = lkpdData.drawingDataUrl;
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([snapshot]);
    }
  }, [currentGroupId]);

  // Helpers to update active group's LKPD
  const updateData = (partial: Partial<LkpdData>) => {
    const updated: LkpdData = {
      ...lkpdData,
      ...partial,
      updatedAt: new Date().toISOString(),
    };
    onUpdateGroupLkpd(currentGroupId, updated);
  };

  const toggleTask = (taskKey: keyof LkpdStepTask) => {
    sound.playPop();
    const newTasks = {
      ...lkpdData.tasks,
      [taskKey]: !lkpdData.tasks[taskKey],
    };
    updateData({ tasks: newTasks });

    // Check if all 6 completed
    const completedCount = Object.values(newTasks).filter(Boolean).length;
    if (completedCount === 6) {
      sound.playStar();
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  };

  const toggleReflection = (refKey: keyof LkpdReflection) => {
    sound.playPop();
    const newRef = {
      ...lkpdData.reflection,
      [refKey]: !lkpdData.reflection[refKey],
    };
    updateData({ reflection: newRef });
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? '#FFFFFF' : brushColor;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save snapshot to history
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), snapshot]);

    // Save to LKPD data
    const dataUrl = canvas.toDataURL('image/png');
    updateData({ drawingDataUrl: dataUrl });
  };

  const handleClearCanvas = () => {
    sound.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([snapshot]);
    updateData({ drawingDataUrl: '' });
  };

  const handleUndoCanvas = () => {
    sound.playPop();
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop();
    const previous = newHistory[newHistory.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setHistory(newHistory);
      updateData({ drawingDataUrl: canvas.toDataURL('image/png') });
    }
  };

  const addStamp = (emoji: string) => {
    sound.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = '56px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Random position in canvas
    const x = Math.floor(Math.random() * (canvas.width - 120)) + 60;
    const y = Math.floor(Math.random() * (canvas.height - 120)) + 60;
    ctx.fillText(emoji, x, y);

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-10), snapshot]);
    updateData({ drawingDataUrl: canvas.toDataURL('image/png') });
  };

  // Sync to Google Sheet
  const handleSaveToSheet = async () => {
    sound.playPop();
    if (!sheetService.isConfigured()) {
      onOpenSheetModal();
      return;
    }

    setSyncStatus({ type: 'saving', message: 'Sedang menyimpan ke Google Sheet...' });
    const res = await sheetService.syncLkpd(currentGroupId, lkpdData);

    if (res.success) {
      sound.playStar();
      setSyncStatus({ type: 'success', message: `✅ ${res.message}` });
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.7 },
      });
      setTimeout(() => {
        setSyncStatus({ type: 'idle', message: '' });
      }, 4000);
    } else {
      setSyncStatus({ type: 'error', message: `❌ ${res.message}` });
    }
  };

  const handlePrint = () => {
    sound.playPop();
    window.print();
  };

  // Completion calculation
  const totalStepsDone = Object.values(lkpdData.tasks).filter(Boolean).length;
  const isAllComplete =
    totalStepsDone === 6 &&
    Boolean(lkpdData.prediction.trim()) &&
    (lkpdData.reflection.senang || lkpdData.reflection.bekerjaSama || lkpdData.reflection.siapMerawat);

  return (
    <section id="lkpd" className="py-8 sm:py-12 px-3 sm:px-6 bg-emerald-50/50">
      <div className="max-w-4xl mx-auto">
        {/* Navigation & Group Switcher for LKPD */}
        <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border-2 border-emerald-200 shadow-xs no-print">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <h2 className="text-xl sm:text-2xl font-black text-emerald-900 font-fun">
                Lembar Kerja Peserta Didik (LKPD 1)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Pilih kelompok di bawah untuk mengisi dan melihat LKPD masing-masing kelompok!
            </p>
          </div>

          {/* Group Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {GROUPS_DATA.map((group) => {
              const grpData = allGroupLkpd[group.id];
              const grpDone = grpData ? Object.values(grpData.tasks).filter(Boolean).length : 0;
              const isSelected = currentGroupId === group.id;

              return (
                <button
                  key={group.id}
                  onClick={() => {
                    sound.playPop();
                    onSelectGroup(group.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300 scale-105'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <span>{group.badge}</span>
                  <span>{group.name}</span>
                  {grpDone === 6 && <span className="text-xs">⭐</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Bar (Print, Save to Sheet, Audio) */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5 no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.speak(
                  'Lembar Kerja Peserta Didik satu. Ayo Menanam Kangkung! Kokurikuler Kelas 1 SD Hari Pertama. Hari ini kita menanam, merawat, dan belajar dari alam!'
                );
              }}
              className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-3.5 py-2 rounded-2xl text-xs sm:text-sm border border-amber-300 transition-all cursor-pointer"
            >
              <span>🔊</span>
              <span>Dengarkan Petunjuk</span>
            </button>

            <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              Kelompok Aktif: <strong>{currentGroup.badge} {currentGroup.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-2 rounded-2xl text-xs sm:text-sm border border-slate-300 transition-all cursor-pointer"
              title="Cetak format kertas A4"
            >
              <span>🖨️</span>
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={handleSaveToSheet}
              disabled={syncStatus.type === 'saving'}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <span>{syncStatus.type === 'saving' ? '⏳' : '☁️'}</span>
              <span>{syncStatus.type === 'saving' ? 'Menyimpan...' : 'Simpan ke Google Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Sync notification toast */}
        {syncStatus.message && (
          <div
            className={`mb-4 p-3.5 rounded-2xl font-bold text-xs sm:text-sm text-center border-2 animate-fadeIn no-print ${
              syncStatus.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                : syncStatus.type === 'error'
                ? 'bg-rose-100 text-rose-900 border-rose-400'
                : 'bg-sky-100 text-sky-900 border-sky-400'
            }`}
          >
            {syncStatus.message}
          </div>
        )}

        {/* THE OFFICIAL LKPD SHEET CONTAINER (Styled to mirror the physical worksheet) */}
        <div className="bg-white rounded-3xl p-5 sm:p-9 border-2 border-emerald-300 shadow-xl print:border-none print:shadow-none print:p-0 print:m-0 text-slate-800">
          
          {/* HEADER SECTION (Matching exact PDF structure) */}
          <div className="border-b-2 border-emerald-200 pb-5 mb-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* School Emblem & Name */}
              <div className="flex items-center gap-3 bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200">
                <div className="w-14 h-14 rounded-2xl bg-white border-2 border-emerald-400 flex items-center justify-center shadow-xs">
                  <span className="text-3xl">🏫</span>
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-900 tracking-wider">
                    SDN JAGIR I/393
                  </div>
                  <div className="text-xs font-bold text-emerald-700">
                    SURABAYA
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    Kec. Wonokromo, Kota Surabaya
                  </div>
                </div>
              </div>

              {/* Title & Tagline Banner */}
              <div className="text-center sm:text-right flex-1">
                <div className="inline-block bg-emerald-100 text-emerald-900 px-4 py-1.5 rounded-full font-black text-base sm:text-xl font-fun tracking-wide border border-emerald-300">
                  LKPD 1 : AYO MENANAM KANGKUNG
                </div>
                <div className="text-xs sm:text-sm font-bold text-emerald-800 mt-1 flex items-center justify-center sm:justify-end gap-1.5">
                  <span>Kokurikuler Kelas 1 SD • Hari Pertama</span>
                  <span>🌱</span>
                </div>
                <div className="text-xs italic text-slate-600 mt-1">
                  “Hari ini kita menanam, merawat, dan belajar dari alam.”
                </div>
              </div>
            </div>

            {/* IDENTITY TABLE: NAMA KELOMPOK & ANGGOTA KELOMPOK */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3 bg-emerald-50/60 p-4 rounded-2xl border-2 border-emerald-300">
              {/* Nama Kelompok */}
              <div className="md:col-span-4 flex flex-col justify-center">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <span>🏷️</span>
                  <span>NAMA KELOMPOK</span>
                </label>
                <div className="bg-white rounded-xl p-2.5 border-2 border-emerald-300 flex items-center gap-2">
                  <span className="text-2xl">{currentGroup.badge}</span>
                  <input
                    type="text"
                    value={lkpdData.groupName}
                    onChange={(e) => updateData({ groupName: e.target.value })}
                    className="w-full font-black text-emerald-900 text-base focus:outline-none"
                    placeholder="Nama Kelompok..."
                  />
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold mt-1">
                  Kelompok {currentGroup.id} SDN Jagir 1
                </span>
              </div>

              {/* Anggota Kelompok */}
              <div className="md:col-span-8">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>👥</span>
                    <span>ANGGOTA KELOMPOK</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    (Bisa diedit/ditambah nama siswa)
                  </span>
                </label>
                <textarea
                  rows={2}
                  value={lkpdData.members}
                  onChange={(e) => updateData({ members: e.target.value })}
                  className="w-full bg-white rounded-xl p-2.5 border-2 border-emerald-300 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  placeholder="Nama anggota kelompok (misal: Ghina, Fadillah, Misbah, Anam)..."
                />
              </div>
            </div>
          </div>

          {/* TUGAS 1. AYO LAKUKAN LANGKAH MENANAM KANGKUNG! */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <h3 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2 font-fun">
                <span className="text-xl">🌱</span>
                <span>TUGAS 1. Ayo lakukan langkah menanam kangkung!</span>
              </h3>
              <div className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl text-xs font-bold border border-emerald-300">
                {totalStepsDone} dari 6 Langkah Selesai {totalStepsDone === 6 ? '🎉 Hebat!' : ''}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mb-3 italic">
              Beri tanda centang (✓) pada kotak setelah kelompokmu melakukan langkah berikut:
            </p>

            {/* Checklist Table */}
            <div className="border-2 border-emerald-300 rounded-2xl overflow-hidden bg-white">
              <div className="bg-emerald-600 text-white font-black text-xs sm:text-sm px-4 py-2.5 grid grid-cols-12 items-center">
                <span className="col-span-10 sm:col-span-11 tracking-wider uppercase">
                  LANGKAH YANG DILAKUKAN
                </span>
                <span className="col-span-2 sm:col-span-1 text-center text-base">✓</span>
              </div>

              <div className="divide-y divide-emerald-100">
                {[
                  {
                    key: 'wadahMedia' as keyof LkpdStepTask,
                    num: '1',
                    text: 'Menyiapkan wadah dan media tanam',
                    desc: 'Siapkan pot atau polybag dan isi dengan tanah gembur bercampur pupuk kompos.',
                    icon: '🪴',
                  },
                  {
                    key: 'lubangKecil' as keyof LkpdStepTask,
                    num: '2',
                    text: 'Membuat lubang kecil',
                    desc: 'Gunakan jari atau ranting kecil untuk membuat lubang sedalam 1 sentimeter.',
                    icon: '👇',
                  },
                  {
                    key: 'letakBiji' as keyof LkpdStepTask,
                    num: '3',
                    text: 'Meletakkan biji kangkung',
                    desc: 'Masukkan 2 sampai 3 butir biji kangkung ke dalam setiap lubang.',
                    icon: '🌰',
                  },
                  {
                    key: 'tutupMedia' as keyof LkpdStepTask,
                    num: '4',
                    text: 'Menutup biji dengan media tipis',
                    desc: 'Tutup kembali biji dengan lapisan tanah yang tipis secara lembut.',
                    icon: '🌱',
                  },
                  {
                    key: 'siramSecukupnya' as keyof LkpdStepTask,
                    num: '5',
                    text: 'Menyiram secukupnya',
                    desc: 'Percikkan air bersih secara merata agar tanah lembap, jangan tergenang air.',
                    icon: '💧',
                  },
                  {
                    key: 'labelNama' as keyof LkpdStepTask,
                    num: '6',
                    text: 'Memberi label nama kelompok',
                    desc: 'Tulis nama kelompokmu pada stiker atau stik nama lalu tancapkan di pot.',
                    icon: '🏷️',
                  },
                ].map((item) => {
                  const isChecked = lkpdData.tasks[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleTask(item.key)}
                      className={`grid grid-cols-12 items-center px-4 py-3 cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-50/80' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="col-span-10 sm:col-span-11 flex items-start gap-3">
                        <span className="text-xl p-1 bg-white rounded-lg border border-emerald-200 shrink-0">
                          {item.icon}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800 text-sm sm:text-base">
                            {item.num}. {item.text}
                          </div>
                          <div className="text-xs text-slate-500 font-medium mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex justify-center">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-lg transition-all border-2 ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                              : 'bg-white border-slate-300 text-transparent hover:border-emerald-400'
                          }`}
                        >
                          ✓
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TUGAS 2. GAMBARLAH KONDISI TANAMAN PADA HARI PERTAMA */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
              <h3 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2 font-fun">
                <span className="text-xl">🌿</span>
                <span>TUGAS 2. Gambarlah kondisi tanaman pada hari pertama.</span>
              </h3>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                🎨 Gambarku boleh diberi warna!
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3 italic">
              Gambarlah pot, tanah, dan letak biji kangkung yang kelompokmu tanam hari ini:
            </p>

            {/* Drawing Canvas Controls */}
            <div className="bg-slate-50 border-2 border-emerald-200 rounded-3xl p-3 sm:p-4 mb-3 no-print">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                {/* Color Palette */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-600">Warna:</span>
                  {[
                    { color: '#8B5A2B', label: 'Tanah', icon: '🟤' },
                    { color: '#3E2723', label: 'Biji', icon: '🌰' },
                    { color: '#16A34A', label: 'Hijau Daun', icon: '🟢' },
                    { color: '#EAB308', label: 'Kuning Sinar', icon: '🟡' },
                    { color: '#0284C7', label: 'Biru Air', icon: '🔵' },
                    { color: '#DC2626', label: 'Merah Pot', icon: '🔴' },
                    { color: '#000000', label: 'Hitam', icon: '⚫' },
                  ].map((c) => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setBrushColor(c.color);
                        setIsEraser(false);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all cursor-pointer ${
                        brushColor === c.color && !isEraser
                          ? 'ring-3 ring-emerald-500 scale-110 border-white'
                          : 'border-slate-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.label}
                    />
                  ))}
                </div>

                {/* Brush Sizes */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Ukuran:</span>
                  {[
                    { size: 4, label: 'Kecil' },
                    { size: 8, label: 'Sedang' },
                    { size: 16, label: 'Tebal' },
                  ].map((s) => (
                    <button
                      key={s.size}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setBrushSize(s.size);
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        brushSize === s.size
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Tools: Eraser, Undo, Clear */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playPop();
                      setIsEraser(!isEraser);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                      isEraser
                        ? 'bg-rose-500 text-white ring-2 ring-rose-300'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🧹</span>
                    <span>Penghapus</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUndoCanvas}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 cursor-pointer"
                    title="Batal langkah terakhir"
                  >
                    ↩️
                  </button>

                  <button
                    type="button"
                    onClick={handleClearCanvas}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 cursor-pointer"
                    title="Hapus bersih kanvas"
                  >
                    🗑️ Bersihkan
                  </button>
                </div>
              </div>

              {/* Quick Stickers */}
              <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 text-xs">
                <span className="font-bold text-slate-500">Stempel Cepat:</span>
                {[
                  { emoji: '🌰', label: 'Biji' },
                  { emoji: '🪴', label: 'Pot' },
                  { emoji: '💧', label: 'Air' },
                  { emoji: '☀️', label: 'Matahari' },
                  { emoji: '🌱', label: 'Tunas' },
                ].map((st) => (
                  <button
                    key={st.label}
                    type="button"
                    onClick={() => addStamp(st.emoji)}
                    className="bg-white hover:bg-emerald-50 border border-slate-200 px-2 py-1 rounded-lg text-sm transition-all cursor-pointer"
                    title={`Tempel ${st.label}`}
                  >
                    {st.emoji} {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Box */}
            <div className="border-3 border-dashed border-emerald-300 rounded-3xl overflow-hidden bg-white shadow-inner flex flex-col items-center justify-center p-2 relative">
              <canvas
                ref={canvasRef}
                width={700}
                height={320}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full max-w-full h-auto bg-white rounded-2xl cursor-crosshair touch-none"
                style={{ maxHeight: '360px', aspectRatio: '700/320' }}
              />
              <div className="w-full text-center text-xs text-slate-400 font-medium py-1.5">
                {lkpdData.drawingDataUrl ? '✨ Gambarku tersimpan di lembar kerja kelompok!' : 'Sentuh atau klik untuk mulai menggambar'}
              </div>
            </div>
          </div>

          {/* TUGAS 3. PREDIKSIKU */}
          <div className="mb-8">
            <h3 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2 font-fun mb-1">
              <span className="text-xl">🔎</span>
              <span>TUGAS 3. Prediksiku:</span>
            </h3>
            <p className="text-xs sm:text-sm font-bold text-emerald-900 mb-2">
              Setelah beberapa hari, biji kangkung akan …
            </p>

            {/* Quick Suggestions for Grade 1 Students */}
            <div className="flex flex-wrap gap-1.5 mb-2.5 no-print">
              <span className="text-xs font-semibold text-slate-500 self-center">Pilihan ide:</span>
              {PREDICTION_SUGGESTIONS.map((pred) => (
                <button
                  key={pred}
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    updateData({ prediction: pred });
                  }}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition-all cursor-pointer"
                >
                  {pred}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={lkpdData.prediction}
              onChange={(e) => updateData({ prediction: e.target.value })}
              className="w-full bg-emerald-50/40 rounded-2xl p-4 border-2 border-emerald-300 font-bold text-slate-800 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder:text-slate-400"
              placeholder="Tuliskan prediksimu di sini (misal: Biji kangkung akan mulai berkecambah, mengeluarkan akar kecil, dan tumbuh daun hijau)..."
            />
          </div>

          {/* TUGAS 4. AKU DAN KELOMPOKKU HARI INI */}
          <div className="mb-8">
            <h3 className="text-base sm:text-lg font-black text-emerald-950 flex items-center gap-2 font-fun mb-2">
              <span className="text-xl">💚</span>
              <span>TUGAS 4. Aku dan kelompokku hari ini …</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  key: 'senang' as keyof LkpdReflection,
                  emoji: '😊',
                  title: 'Senang',
                  desc: 'Gembira bisa belajar menanam bersama!',
                  color: 'amber',
                },
                {
                  key: 'bekerjaSama' as keyof LkpdReflection,
                  emoji: '🤝',
                  title: 'Bekerja sama',
                  desc: 'Saling membantu dan kompak bersama teman!',
                  color: 'sky',
                },
                {
                  key: 'siapMerawat' as keyof LkpdReflection,
                  emoji: '🌱',
                  title: 'Siap merawat',
                  desc: 'Akan menyiram dan mengamati setiap hari!',
                  color: 'emerald',
                },
              ].map((item) => {
                const isSelected = lkpdData.reflection[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleReflection(item.key)}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-100 border-emerald-500 shadow-sm ring-2 ring-emerald-300'
                        : 'bg-white border-slate-200 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-base transition-colors border-2 ${
                        isSelected ? 'bg-emerald-600 border-emerald-700 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </div>
                    <span className="text-3xl">{item.emoji}</span>
                    <div>
                      <div className="font-bold text-slate-800 text-sm sm:text-base">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LKPD FOOTER (Exact copy from PDF) */}
          <div className="pt-4 border-t-2 border-emerald-200 text-center text-xs font-bold text-slate-600">
            Kokurikuler Kelas 1 • Hari 1 Menanam Kangkung • SDN Jagir I/393 Surabaya
          </div>
        </div>

        {/* BOTTOM COMPLETION & REWARD BAR */}
        <div className="mt-6 bg-white p-5 rounded-3xl border-2 border-emerald-300 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⭐</span>
            <div>
              <div className="font-black text-emerald-900 text-sm sm:text-base">
                {isAllComplete ? 'Luar Biasa! LKPD Kelompok Telah Lengkap!' : 'Ayo Selesaikan Semua Tugas LKPD!'}
              </div>
              <div className="text-xs text-slate-600">
                Langkah tanam: {totalStepsDone}/6 • Prediksi: {lkpdData.prediction ? 'Ada ✓' : 'Belum'} • Sikap kelompok: {Object.values(lkpdData.reflection).filter(Boolean).length}/3
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playStar();
                onAddStar();
                confetti({
                  particleCount: 50,
                  spread: 80,
                  origin: { y: 0.6 },
                });
              }}
              className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>🌟</span>
              <span>Klaim Bintang Prestasi</span>
            </button>

            <button
              onClick={handleSaveToSheet}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>☁️</span>
              <span>Simpan ke Database</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
