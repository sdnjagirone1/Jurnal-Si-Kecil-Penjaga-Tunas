import { useState, useEffect } from 'react';
import { PageId, JournalDay, LkpdData, GROUPS_DATA } from './types';
import { sound } from './utils/audio';
import { Navigation } from './components/Navigation';
import { SectionHero } from './components/SectionHero';
import { SectionAboutKangkung } from './components/SectionAboutKangkung';
import { SectionGuideSteps } from './components/SectionGuideSteps';
import { SectionLkpd } from './components/SectionLkpd';
import { SectionJournal } from './components/SectionJournal';
import { SectionMeasure } from './components/SectionMeasure';
import { SectionObservation } from './components/SectionObservation';
import { SectionGrowthChart } from './components/SectionGrowthChart';
import { SectionQuizThink } from './components/SectionQuizThink';
import { SectionStarProgress } from './components/SectionStarProgress';
import { GoogleSheetModal } from './components/GoogleSheetModal';

// Helper to generate 15 blank observation days
const generateBlankDays = (): JournalDay[] => {
  const today = new Date();
  const days: JournalDay[] = [];
  for (let i = 1; i <= 15; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + (i - 1));
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      dayNumber: i,
      label: `Hari ${i}`,
      date: dateStr,
      heightCm: '',
      condition: '',
      conditionEmoji: '',
      notes: '',
      hasNewLeaves: false,
      grewTaller: false,
      greenLeaves: true,
      looksFresh: true,
      hasYellowLeaves: false,
    });
  }
  return days;
};

// Helper to generate blank LKPD 1 for a group
const generateBlankLkpd = (groupId: number): LkpdData => {
  const g = GROUPS_DATA.find((grp) => grp.id === groupId) || GROUPS_DATA[0];
  return {
    groupId: g.id,
    groupName: g.name,
    members: g.members.join(', '),
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
};

// Realistic sample 15-day kangkung growth progression (starting from seed to mature plant)
const SAMPLE_15_DAYS: JournalDay[] = [
  { dayNumber: 1, label: 'Hari 1', date: '2026-09-22', heightCm: 0.3, condition: 'Sehat', conditionEmoji: '🌱', notes: 'Biji mulai merekah di tanah basah', hasNewLeaves: false, grewTaller: false, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 2, label: 'Hari 2', date: '2026-09-23', heightCm: 0.9, condition: 'Sehat', conditionEmoji: '🌱', notes: 'Muncul tunas putih kecil', hasNewLeaves: false, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 3, label: 'Hari 3', date: '2026-09-24', heightCm: 2.1, condition: 'Segar', conditionEmoji: '☀️', notes: 'Batang kecil mulai tegak', hasNewLeaves: false, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 4, label: 'Hari 4', date: '2026-09-25', heightCm: 3.5, condition: 'Daun hijau', conditionEmoji: '😊', notes: 'Kulit biji terlepas, muncul 2 daun mungil', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 5, label: 'Hari 5', date: '2026-09-26', heightCm: 5.2, condition: 'Segar', conditionEmoji: '☀️', notes: 'Daun melebar dan hijau cerah', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 6, label: 'Hari 6', date: '2026-09-27', heightCm: 7.0, condition: 'Daun bertambah', conditionEmoji: '🍃', notes: 'Batang memanjang, tunas daun baru muncul', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 7, label: 'Hari 7', date: '2026-09-28', heightCm: 9.1, condition: 'Sehat', conditionEmoji: '🌱', notes: 'Memiliki 4 helai daun hijau', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 8, label: 'Hari 8', date: '2026-09-29', heightCm: 11.4, condition: 'Segar', conditionEmoji: '☀️', notes: 'Batang semakin kokoh', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 9, label: 'Hari 9', date: '2026-09-30', heightCm: 13.5, condition: 'Daun hijau', conditionEmoji: '😊', notes: 'Daun kangkung memanjang khas kangkung darat', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 10, label: 'Hari 10', date: '2026-10-01', heightCm: 15.8, condition: 'Daun bertambah', conditionEmoji: '🍃', notes: 'Mulai tumbuh cabang daun ke-6', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 11, label: 'Hari 11', date: '2026-10-02', heightCm: 18.0, condition: 'Sehat', conditionEmoji: '🌱', notes: 'Akar menancap sangat kuat di tanah', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 12, label: 'Hari 12', date: '2026-10-03', heightCm: 20.3, condition: 'Segar', conditionEmoji: '☀️', notes: 'Kangkung tumbuh rimbun dan segar', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 13, label: 'Hari 13', date: '2026-10-04', heightCm: 22.5, condition: 'Daun hijau', conditionEmoji: '😊', notes: 'Batang berongga khas kangkung terlihat jelas', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 14, label: 'Hari 14', date: '2026-10-05', heightCm: 24.8, condition: 'Segar', conditionEmoji: '☀️', notes: 'Daun lebat, tanaman sangat subur', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
  { dayNumber: 15, label: 'Hari 15', date: '2026-10-06', heightCm: 27.0, condition: 'Sehat', conditionEmoji: '🌱', notes: 'Kangkung sudah tinggi dan siap dipanen!', hasNewLeaves: true, grewTaller: true, greenLeaves: true, looksFresh: true, hasYellowLeaves: false },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<PageId>('beranda');
  const [currentGroupId, setCurrentGroupId] = useState<number>(1);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [speechOn, setSpeechOn] = useState<boolean>(true);
  const [bonusStars, setBonusStars] = useState<number>(5);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState<boolean>(false);

  // Group Journals: Record<number, JournalDay[]> stored in localStorage
  const [groupJournals, setGroupJournals] = useState<Record<number, JournalDay[]>>(() => {
    const saved = localStorage.getItem('kangkung_all_group_journals_v5');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed[1]) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    // Default initial for all 5 groups: All blank, no pre-filled data
    const initial: Record<number, JournalDay[]> = {};
    GROUPS_DATA.forEach((g) => {
      initial[g.id] = generateBlankDays();
    });
    return initial;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kangkung_all_group_journals_v5', JSON.stringify(groupJournals));
  }, [groupJournals]);

  // Group LKPD (Lembar Kerja Peserta Didik 1): Record<number, LkpdData> stored in localStorage
  const [groupLkpd, setGroupLkpd] = useState<Record<number, LkpdData>>(() => {
    const saved = localStorage.getItem('kangkung_all_group_lkpd_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed[1]) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    const initial: Record<number, LkpdData> = {};
    GROUPS_DATA.forEach((g) => {
      initial[g.id] = generateBlankLkpd(g.id);
    });
    return initial;
  });

  // Sync LKPD to localStorage
  useEffect(() => {
    localStorage.setItem('kangkung_all_group_lkpd_v2', JSON.stringify(groupLkpd));
  }, [groupLkpd]);

  // Sync sound & speech flags to SoundEngine
  useEffect(() => {
    sound.soundEnabled = soundOn;
  }, [soundOn]);

  useEffect(() => {
    sound.speechEnabled = speechOn;
  }, [speechOn]);

  const activeJournalData = groupJournals[currentGroupId] || generateBlankDays();

  // Compute total stars: filled days across the current active group + bonus stars
  const filledDaysCount = activeJournalData.filter(
    (d) => d.heightCm !== '' && Number(d.heightCm) > 0
  ).length;
  const totalStars = filledDaysCount + bonusStars;

  // Navigation scroll handler
  const handleNavigate = (sectionId: PageId) => {
    setActiveSection(sectionId);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scrollspy to detect active section as user scrolls
  useEffect(() => {
    const sections: PageId[] = [
      'beranda',
      'kenalan',
      'cara',
      'lkpd',
      'jurnal',
      'ukur',
      'amati',
      'grafik',
      'tantangan',
      'bintang',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setActiveSection(entry.target.id as PageId);
          }
        });
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    sections.forEach((sec) => {
      const el = document.getElementById(sec);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Handler: update active group's LKPD
  const handleUpdateGroupLkpd = (groupId: number, data: LkpdData) => {
    setGroupLkpd((prev) => ({
      ...prev,
      [groupId]: data,
    }));
  };

  // Handler: direct update inside the active group's journal table
  const handleUpdateDay = (dayNumber: number, field: keyof JournalDay, value: string | number | boolean) => {
    setGroupJournals((prev) => {
      const currentList = prev[currentGroupId] || generateBlankDays();
      const updatedList = currentList.map((d) =>
        d.dayNumber === dayNumber ? { ...d, [field]: value } : d
      );
      return {
        ...prev,
        [currentGroupId]: updatedList,
      };
    });
  };

  // Handler: synchronizing Section 5 (Simulasi Pengukuran) to active group's journal
  const handleUpdateJournalHeight = (dayNumber: number, heightCm: number) => {
    setGroupJournals((prev) => {
      const currentList = prev[currentGroupId] || generateBlankDays();
      const updatedList = currentList.map((d) =>
        d.dayNumber === dayNumber
          ? {
              ...d,
              heightCm,
              condition: d.condition || 'Sehat',
              conditionEmoji: d.conditionEmoji || '🌱',
            }
          : d
      );
      return {
        ...prev,
        [currentGroupId]: updatedList,
      };
    });
    setBonusStars((prev) => prev + 1);
  };

  // Handler: synchronizing Section 6 (Lembar Pengamatan 15 Hari) to active group's journal
  const handleUpdateJournalObservation = (
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
  ) => {
    setGroupJournals((prev) => {
      const currentList = prev[currentGroupId] || generateBlankDays();
      const updatedList = currentList.map((d) =>
        d.dayNumber === dayNumber
          ? {
              ...d,
              hasNewLeaves: data.hasNewLeaves,
              grewTaller: data.grewTaller,
              greenLeaves: data.greenLeaves,
              looksFresh: data.looksFresh,
              hasYellowLeaves: data.hasYellowLeaves,
              seedNotSprouted: data.seedNotSprouted,
              notes: data.notes,
              condition: data.condition || d.condition || 'Sehat',
              conditionEmoji: data.conditionEmoji || d.conditionEmoji || '🌱',
            }
          : d
      );
      return {
        ...prev,
        [currentGroupId]: updatedList,
      };
    });
    setBonusStars((prev) => prev + 1);
  };

  const handleLoadSample = () => {
    setGroupJournals((prev) => ({
      ...prev,
      [currentGroupId]: SAMPLE_15_DAYS,
    }));
    setBonusStars((prev) => prev + 2);
  };

  const handleResetData = () => {
    setGroupJournals((prev) => ({
      ...prev,
      [currentGroupId]: generateBlankDays(),
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-slate-800">
      {/* Top Canva Site Navigation Bar with Group Switcher */}
      <Navigation
        activeSection={activeSection}
        onNavigate={handleNavigate}
        starsCount={totalStars}
        currentGroupId={currentGroupId}
        onSelectGroup={setCurrentGroupId}
        soundEnabled={soundOn}
        speechEnabled={speechOn}
        onToggleSound={() => setSoundOn(!soundOn)}
        onToggleSpeech={() => setSpeechOn(!speechOn)}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
      />

      {/* Main Continuous Canvas (Canva Site Style) */}
      <main className="flex-1">
        {/* 1. Halaman Pembuka */}
        <SectionHero
          onStart={() => handleNavigate('kenalan')}
          onNavigateToSection={(s) => handleNavigate(s as PageId)}
        />

        {/* 2. Halaman Kenalan Dengan Kangkung */}
        <SectionAboutKangkung />

        {/* 3. Halaman Cara Melakukan Pengamatan */}
        <SectionGuideSteps />

        {/* 3b. Halaman Lembar Kerja Peserta Didik (LKPD 1: Ayo Menanam Kangkung) */}
        <SectionLkpd
          currentGroupId={currentGroupId}
          onSelectGroup={setCurrentGroupId}
          allGroupLkpd={groupLkpd}
          onUpdateGroupLkpd={handleUpdateGroupLkpd}
          onAddStar={() => setBonusStars((prev) => prev + 1)}
          onOpenSheetModal={() => setIsSheetModalOpen(true)}
        />

        {/* 4. Halaman Utama: Buku Jurnal Kelompok (15 Hari) */}
        <SectionJournal
          currentGroupId={currentGroupId}
          onSelectGroup={setCurrentGroupId}
          journalData={activeJournalData}
          onUpdateDay={handleUpdateDay}
          onLoadSample={handleLoadSample}
          onResetData={handleResetData}
          onOpenSheetModal={() => setIsSheetModalOpen(true)}
        />

        {/* 5. Halaman Ukur Tinggi Tanaman (Tersinkron per Kelompok & Hari 1-15) */}
        <SectionMeasure
          currentGroupId={currentGroupId}
          onSelectGroup={setCurrentGroupId}
          journalData={activeJournalData}
          onUpdateJournalHeight={handleUpdateJournalHeight}
        />

        {/* 6. Halaman Ayo Amati! (Lembar Pengamatan 15 Hari Tersinkron per Kelompok) */}
        <SectionObservation
          currentGroupId={currentGroupId}
          onSelectGroup={setCurrentGroupId}
          journalData={activeJournalData}
          onUpdateJournalObservation={handleUpdateJournalObservation}
          onAddStar={() => setBonusStars((prev) => prev + 1)}
        />

        {/* 7. Halaman Grafik Pertumbuhan (15 Hari Tersinkron per Kelompok) */}
        <SectionGrowthChart
          currentGroupId={currentGroupId}
          onSelectGroup={setCurrentGroupId}
          journalData={activeJournalData}
          onNavigateToJournal={() => handleNavigate('jurnal')}
        />

        {/* 8. Halaman Ayo Berpikir (Kuis Refleksi) */}
        <SectionQuizThink
          journalData={activeJournalData}
          onAddStar={() => setBonusStars((prev) => prev + 2)}
        />

        {/* 9. Papan Progres Bintang Pengamatan Siswa (Menggantikan Piagam) */}
        <SectionStarProgress
          currentGroupId={currentGroupId}
          onSelectGroup={setCurrentGroupId}
          allGroupJournals={groupJournals}
          onAddStar={() => setBonusStars((prev) => prev + 1)}
        />
      </main>

      {/* Canva Site Floating Quick Dock on Mobile */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden flex flex-col gap-2 no-print">
        <button
          onClick={() => {
            sound.playPop();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="w-12 h-12 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl font-bold border-2 border-white cursor-pointer active:scale-95"
          title="Kembali ke atas"
        >
          ⬆️
        </button>
      </div>

      {/* Footer with Group List Summary */}
      <footer className="bg-white border-t-2 border-emerald-100 py-8 px-4 text-center text-xs sm:text-sm text-slate-500 no-print">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-emerald-800 font-fun">
            <span>🌱</span>
            <span>Si Kecil Penjaga Tunas • SDN Jagir I/393 Surabaya</span>
            <span>⭐</span>
          </div>
          <p className="text-slate-600 font-medium">
            Media Pembelajaran Interaktif (MPI) Kelas 1 SDN Jagir I/393 Surabaya • Menanam, Mengamati & Mengukur Tanaman Kangkung
          </p>

          {/* Quick List of All 5 Groups in Footer */}
          <div className="flex flex-wrap justify-center gap-2 pt-2 border-t border-slate-100 w-full text-xs">
            {GROUPS_DATA.map((g) => (
              <span key={g.id} className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-slate-700">
                <strong>{g.badge} {g.name}:</strong> {g.members.join(', ')}
              </span>
            ))}
          </div>

          <p className="text-slate-400 text-xs mt-2">
            SDN Jagir 1 • Setiap pengamatan diisi di buku jurnal menghasilkan bintang emas prestasi!
          </p>
        </div>
      </footer>

      {/* Google Sheets Database Integration Modal */}
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        allGroupJournals={groupJournals}
        onApplyImportedData={(imported) => setGroupJournals(imported)}
        allGroupLkpd={groupLkpd}
        onApplyImportedLkpd={(importedLkpd) => setGroupLkpd(importedLkpd)}
      />
    </div>
  );
}
