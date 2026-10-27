import React, { useState } from 'react';
import { JournalDay, GROUPS_DATA, GroupInfo } from '../types';
import { sound } from '../utils/audio';
import { normalizeDateToYMD } from '../utils/sheetService';
import { ensure15Days } from '../utils/journalUtils';

interface PrintJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGroupId: number;
  journalData: JournalDay[];
  allGroupJournals?: Record<number, JournalDay[]>;
  onSelectGroup?: (groupId: number) => void;
}

export const PrintJournalModal: React.FC<PrintJournalModalProps> = ({
  isOpen,
  onClose,
  currentGroupId,
  journalData,
  allGroupJournals,
  onSelectGroup,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<number>(currentGroupId);
  const [printMode, setPrintMode] = useState<'filled' | 'blank'>('filled');

  if (!isOpen) return null;

  // Active group data
  const targetGroupId = selectedGroupId || currentGroupId;
  const activeGroup: GroupInfo =
    GROUPS_DATA.find((g) => g.id === targetGroupId) || GROUPS_DATA[0];

  // If allGroupJournals is provided, retrieve target group's journal data, otherwise use journalData
  const rawGroupData =
    allGroupJournals && allGroupJournals[targetGroupId] && allGroupJournals[targetGroupId].length > 0
      ? allGroupJournals[targetGroupId]
      : journalData;
  const activeJournalData: JournalDay[] = ensure15Days(rawGroupData);

  const handlePrint = () => {
    sound.playStar();
    window.print();
  };

  const handleGroupTab = (groupId: number) => {
    sound.playPop();
    setSelectedGroupId(groupId);
    if (onSelectGroup) {
      onSelectGroup(groupId);
    }
  };

  // Helper format date for printing (dd/mm/yyyy)
  const formatPrintDate = (rawDate: string): string => {
    if (!rawDate) return '-';
    const ymd = normalizeDateToYMD(rawDate);
    if (ymd && ymd.includes('-')) {
      const parts = ymd.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
    return rawDate;
  };

  // Calculate statistics for the journal
  const heights = activeJournalData
    .map((d) => (d.heightCm !== '' ? Number(d.heightCm) : null))
    .filter((h): h is number => h !== null && !isNaN(h));
  const firstHeight = heights.length > 0 ? heights[0] : 0;
  const lastHeight = heights.length > 0 ? heights[heights.length - 1] : 0;
  const totalGrowth =
    heights.length > 1 ? Math.max(0, parseFloat((lastHeight - firstHeight).toFixed(1))) : 0;

  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <>
      {/* SCREEN PREVIEW MODAL (Hidden during print) */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print">
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border-4 border-emerald-400 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-inner">
                🖨️
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold font-fun">
                  Cetak Lembar Jurnal Pengamatan Kangkung
                </h3>
                <p className="text-xs text-emerald-100 font-medium">
                  SDN Jagir I/393 Surabaya • Si Kecil Penjaga Tunas (Kelas 1)
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playPop();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-lg transition-transform active:scale-95 cursor-pointer"
              title="Tutup"
            >
              ✕
            </button>
          </div>

          {/* Controls Bar: Group Selector & Mode Options */}
          <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-3">
            {/* Group Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-emerald-900 mr-1 flex items-center gap-1">
                <span>👥</span>
                <span>Pilih:</span>
              </span>
              {GROUPS_DATA.map((grp) => {
                const isSelected = grp.id === targetGroupId;
                return (
                  <button
                    key={grp.id}
                    onClick={() => handleGroupTab(grp.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 border ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                        : 'bg-white hover:bg-emerald-100 text-slate-700 border-emerald-200'
                    }`}
                  >
                    <span>{grp.badge}</span>
                    <span>{grp.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Print Mode Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Mode:</span>
              <div className="inline-flex rounded-xl bg-white p-1 border border-emerald-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPrintMode('filled')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    printMode === 'filled'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  📝 Isi Saat Ini
                </button>
                <button
                  type="button"
                  onClick={() => setPrintMode('blank')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    printMode === 'blank'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-emerald-700'
                  }`}
                  title="Format lembar kosong untuk ditulis tangan oleh siswa"
                >
                  📄 Lembar Kosong (Tulis Tangan)
                </button>
              </div>
            </div>
          </div>

          {/* Paper Preview Area (Interactive Scrollable Sheet) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/80">
            <div className="bg-white max-w-[210mm] mx-auto p-6 sm:p-8 rounded-xl shadow-lg border border-slate-300 text-slate-900 font-sans text-xs sm:text-sm">
              {/* KOP / OFFICIAL DOCUMENT HEADER */}
              <div className="border-b-4 border-double border-slate-800 pb-3 mb-4 text-center">
                <div className="flex items-center justify-between mb-1">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center text-2xl font-bold text-emerald-800">
                    🌱
                  </div>
                  <div className="flex-1 px-2 text-center">
                    <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700">
                      Pemerintah Kota Surabaya • Dinas Pendidikan
                    </h4>
                    <h2 className="text-base sm:text-xl font-extrabold uppercase text-slate-900 tracking-wide font-fun">
                      SDN JAGIR I / 393 SURABAYA
                    </h2>
                    <p className="text-[11px] text-slate-600">
                      Jl. Jagir Sidomukti No. 1, Kec. Wonokromo, Kota Surabaya, Jawa Timur 60244
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-2xl font-bold text-amber-700">
                    ⭐
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-300">
                  <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-emerald-900">
                    LEMBAR JURNAL PENGAMATAN PERTUMBUHAN KANGKUNG (15 HARI)
                  </h3>
                  <p className="text-[11px] text-slate-600 italic">
                    Media Pembelajaran Interaktif (MPI) Kelas 1: Si Kecil Penjaga Tunas
                  </p>
                </div>
              </div>

              {/* GROUP IDENTIFICATION BOX */}
              <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-3 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <strong className="w-24 text-slate-700">Kelompok:</strong>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {activeGroup.badge} {activeGroup.name} (Kelas 1)
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <strong className="w-24 text-slate-700 shrink-0">Anggota:</strong>
                    <span className="font-semibold text-slate-800">
                      {activeGroup.members.map((m, idx) => `${idx + 1}. ${m}`).join(', ')}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <strong className="w-28 text-slate-700">Objek Amati:</strong>
                    <span className="font-semibold text-slate-800">Tanaman Kangkung Darat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <strong className="w-28 text-slate-700">Wadah/Media:</strong>
                    <span className="font-semibold text-slate-800">Pot / Polybag (Tanah & Kompos)</span>
                  </div>
                </div>
              </div>

              {/* 15-DAY OBSERVATION TABLE */}
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border-2 border-slate-800 text-[11px] sm:text-xs">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 border-b-2 border-slate-800 text-center font-bold">
                      <th className="border border-slate-600 p-1.5 w-12">Hari</th>
                      <th className="border border-slate-600 p-1.5 w-24">Tanggal</th>
                      <th className="border border-slate-600 p-1.5 w-20">Tinggi (cm)</th>
                      <th className="border border-slate-600 p-1.5">Kondisi & Catatan Pengamatan</th>
                      <th className="border border-slate-600 p-1.5 w-16">Tunas / Daun</th>
                      <th className="border border-slate-600 p-1.5 w-16">Paraf Ortu / Guru</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeJournalData.map((row) => {
                      const isBlank = printMode === 'blank';
                      const formattedDate = isBlank ? '' : formatPrintDate(row.date);
                      const heightVal = isBlank ? '' : row.heightCm !== '' ? `${row.heightCm} cm` : '-';
                      const conditionVal = isBlank
                        ? ''
                        : row.condition
                        ? `${row.conditionEmoji ? row.conditionEmoji + ' ' : ''}${row.condition}`
                        : '-';
                      const leafCheck = isBlank ? '☐' : row.hasNewLeaves ? '☑ Ada' : '☐ -';

                      return (
                        <tr key={row.dayNumber} className="border-b border-slate-400 text-slate-800">
                          <td className="border border-slate-400 p-1 text-center font-bold bg-slate-50">
                            Ke-{row.dayNumber}
                          </td>
                          <td className="border border-slate-400 p-1 text-center font-medium">
                            {formattedDate}
                          </td>
                          <td className="border border-slate-400 p-1 text-center font-extrabold text-slate-900">
                            {heightVal}
                          </td>
                          <td className="border border-slate-400 p-1 px-2 font-medium">
                            {conditionVal}
                          </td>
                          <td className="border border-slate-400 p-1 text-center text-slate-700">
                            {leafCheck}
                          </td>
                          <td className="border border-slate-400 p-1 text-center text-slate-400">
                            {/* Empty space for physical sign */}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* SUMMARY STATS & REFLECTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 border-2 border-slate-300 rounded-xl p-3 bg-slate-50 text-xs">
                <div>
                  <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                    <span>📊</span>
                    <span>Ringkasan Pengamatan:</span>
                  </h5>
                  <ul className="space-y-0.5 text-slate-700">
                    <li>
                      • Tinggi Awal (Hari 1): <strong>{firstHeight} cm</strong>
                    </li>
                    <li>
                      • Tinggi Akhir (Hari 15): <strong>{lastHeight} cm</strong>
                    </li>
                    <li>
                      • Total Pertambahan: <strong>{totalGrowth} cm</strong>
                    </li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                    <span>💡</span>
                    <span>Refleksi Peneliti Cilik:</span>
                  </h5>
                  <p className="text-slate-600 italic text-[11px] leading-relaxed">
                    "Kangkung dapat tumbuh subur dan hijau apabila disiram air secukupnya, diberi tanah subur, serta mendapatkan sinar matahari setiap hari."
                  </p>
                </div>
              </div>

              {/* OFFICIAL SIGNATURE SECTION */}
              <div className="pt-2 text-xs">
                <div className="text-right text-slate-700 mb-4">
                  Surabaya, {currentDateStr}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-slate-800">
                  <div>
                    <p className="font-bold mb-12">Ketua / Perwakilan Kelompok,</p>
                    <div className="border-b border-slate-700 w-32 mx-auto"></div>
                    <p className="font-extrabold mt-1 text-[11px]">
                      ( {activeGroup.members[0] || 'Nama Siswa'} )
                    </p>
                  </div>

                  <div>
                    <p className="font-bold mb-12">Orang Tua / Wali Siswa,</p>
                    <div className="border-b border-slate-700 w-32 mx-auto"></div>
                    <p className="font-extrabold mt-1 text-[11px]">( ................................ )</p>
                  </div>

                  <div>
                    <p className="font-bold mb-12">Guru Pembimbing Kelas 1,</p>
                    <div className="border-b border-slate-700 w-32 mx-auto"></div>
                    <p className="font-extrabold mt-1 text-[11px]">SDN Jagir I/393 Surabaya</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Bar */}
          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              💡 Tips: Pilih <em>"Save as PDF"</em> atau printer sekolah untuk mencetak kertas ukuran A4.
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onClose();
                }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs sm:text-sm cursor-pointer transition-colors"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 font-fun"
              >
                <span>🖨️</span>
                <span>Cetak Sekarang / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED PRINT DOM CONTAINER (Visible ONLY when printing via @media print) */}
      <div id="print-journal-sheet" className="hidden print:block print:w-full print:p-0 text-black bg-white">
        {/* KOP / OFFICIAL DOCUMENT HEADER */}
        <div className="border-b-4 border-double border-black pb-2 mb-3 text-center">
          <div className="flex items-center justify-between mb-1">
            <div className="w-12 h-12 flex items-center justify-center text-3xl font-bold">
              🌱
            </div>
            <div className="flex-1 px-2 text-center">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-black">
                Pemerintah Kota Surabaya • Dinas Pendidikan
              </h4>
              <h2 className="text-lg font-black uppercase text-black tracking-wide">
                SDN JAGIR I / 393 SURABAYA
              </h2>
              <p className="text-[10px] text-black">
                Jl. Jagir Sidomukti No. 1, Kec. Wonokromo, Kota Surabaya, Jawa Timur 60244
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center text-3xl font-bold">
              ⭐
            </div>
          </div>

          <div className="mt-1 pt-1.5 border-t border-black">
            <h3 className="text-sm font-black uppercase tracking-wide text-black">
              LEMBAR JURNAL PENGAMATAN PERTUMBUHAN KANGKUNG (15 HARI)
            </h3>
            <p className="text-[10px] text-black italic">
              Media Pembelajaran Interaktif (MPI) Kelas 1 • Si Kecil Penjaga Tunas
            </p>
          </div>
        </div>

        {/* GROUP IDENTIFICATION BOX */}
        <div className="border-2 border-black rounded-lg p-2.5 mb-3 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <strong className="w-20">Kelompok:</strong>
              <span className="font-black text-black">
                {activeGroup.badge} {activeGroup.name} (Kelas 1)
              </span>
            </div>
            <div className="flex items-start gap-1">
              <strong className="w-20 shrink-0">Anggota:</strong>
              <span className="font-semibold text-black">
                {activeGroup.members.map((m, idx) => `${idx + 1}. ${m}`).join(', ')}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <strong className="w-24">Objek Amati:</strong>
              <span>Tanaman Kangkung Darat</span>
            </div>
            <div className="flex items-center gap-1">
              <strong className="w-24">Media Tanam:</strong>
              <span>Pot / Polybag (Tanah & Kompos)</span>
            </div>
          </div>
        </div>

        {/* 15-DAY OBSERVATION TABLE */}
        <table className="w-full border-collapse border-2 border-black text-[10px] mb-3">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black text-center font-bold">
              <th className="border border-black p-1 w-10">Hari</th>
              <th className="border border-black p-1 w-20">Tanggal</th>
              <th className="border border-black p-1 w-16">Tinggi (cm)</th>
              <th className="border border-black p-1">Kondisi & Catatan Pengamatan</th>
              <th className="border border-black p-1 w-14">Tunas/Daun</th>
              <th className="border border-black p-1 w-16">Paraf</th>
            </tr>
          </thead>
          <tbody>
            {activeJournalData.map((row) => {
              const isBlank = printMode === 'blank';
              const formattedDate = isBlank ? '' : formatPrintDate(row.date);
              const heightVal = isBlank ? '' : row.heightCm !== '' ? `${row.heightCm} cm` : '-';
              const conditionVal = isBlank
                ? ''
                : row.condition
                ? `${row.conditionEmoji ? row.conditionEmoji + ' ' : ''}${row.condition}`
                : '-';
              const leafCheck = isBlank ? '☐' : row.hasNewLeaves ? '☑ Ada' : '☐ -';

              return (
                <tr key={row.dayNumber} className="border-b border-black text-black">
                  <td className="border border-black p-1 text-center font-bold">
                    Ke-{row.dayNumber}
                  </td>
                  <td className="border border-black p-1 text-center font-medium">
                    {formattedDate}
                  </td>
                  <td className="border border-black p-1 text-center font-bold">
                    {heightVal}
                  </td>
                  <td className="border border-black p-1 px-1.5 font-medium">
                    {conditionVal}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {leafCheck}
                  </td>
                  <td className="border border-black p-1 text-center">
                    {/* Paraf box */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* SUMMARY STATS & REFLECTION */}
        <div className="grid grid-cols-2 gap-2 mb-4 border border-black rounded-lg p-2 text-[10px]">
          <div>
            <strong className="block mb-0.5">Ringkasan Pertumbuhan Kangkung:</strong>
            <p>• Hari Ke-1: {firstHeight} cm | Hari Ke-15: {lastHeight} cm</p>
            <p>• Total Pertambahan Tinggi: <strong>{totalGrowth} cm</strong></p>
          </div>
          <div>
            <strong className="block mb-0.5">Refleksi Pengamatan:</strong>
            <p className="italic">
              "Kangkung dapat tumbuh subur dan hijau apabila disiram air secukupnya, tanah subur, serta sinar matahari cukup."
            </p>
          </div>
        </div>

        {/* OFFICIAL SIGNATURE SECTION */}
        <div className="pt-2 text-[10px]">
          <div className="text-right mb-3">
            Surabaya, {currentDateStr}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="font-bold mb-10">Ketua / Siswa Kelompok,</p>
              <div className="border-b border-black w-28 mx-auto"></div>
              <p className="font-bold mt-1 text-[9px]">( {activeGroup.members[0] || 'Nama Siswa'} )</p>
            </div>

            <div>
              <p className="font-bold mb-10">Orang Tua / Wali Siswa,</p>
              <div className="border-b border-black w-28 mx-auto"></div>
              <p className="font-bold mt-1 text-[9px]">( ................................ )</p>
            </div>

            <div>
              <p className="font-bold mb-10">Guru Pembimbing Kelas 1,</p>
              <div className="border-b border-black w-28 mx-auto"></div>
              <p className="font-bold mt-1 text-[9px]">SDN Jagir I/393 Surabaya</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
