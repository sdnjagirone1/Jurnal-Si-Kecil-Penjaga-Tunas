export type PageId =
  | 'beranda'
  | 'kenalan'
  | 'cara'
  | 'lkpd'
  | 'jurnal'
  | 'ukur'
  | 'amati'
  | 'grafik'
  | 'tantangan'
  | 'bintang';

export interface GroupInfo {
  id: number;
  name: string;
  badge: string;
  themeColor: string;
  accentBg: string;
  members: string[];
}

export interface LkpdStepTask {
  wadahMedia: boolean;
  lubangKecil: boolean;
  letakBiji: boolean;
  tutupMedia: boolean;
  siramSecukupnya: boolean;
  labelNama: boolean;
}

export interface LkpdReflection {
  senang: boolean;
  bekerjaSama: boolean;
  siapMerawat: boolean;
}

export interface LkpdData {
  groupId: number;
  groupName: string;
  members: string;
  tasks: LkpdStepTask;
  drawingDataUrl: string;
  prediction: string;
  reflection: LkpdReflection;
  updatedAt?: string;
}

export interface JournalDay {
  dayNumber: number;
  label: string;
  date: string;
  heightCm: number | string;
  condition: string;
  conditionEmoji: string;
  notes: string;
  hasNewLeaves?: boolean;
  grewTaller?: boolean;
  greenLeaves?: boolean;
  looksFresh?: boolean;
  hasYellowLeaves?: boolean;
  seedNotSprouted?: boolean;
}

export interface ObservationChecklistState {
  hasNewLeaves: boolean;
  grewTaller: boolean;
  greenLeaves: boolean;
  looksFresh: boolean;
  hasYellowLeaves: boolean;
  seedNotSprouted?: boolean;
  dailyNotes: string;
  selectedDay: number;
}

export interface PlantGrowthStage {
  day: number;
  title: string;
  desc: string;
  height: string;
  visualStage: 'seed' | 'sprout' | 'seedling' | 'tall';
}

export const GROUPS_DATA: GroupInfo[] = [
  {
    id: 1,
    name: 'Kelompok 1',
    badge: '🦁',
    themeColor: 'emerald',
    accentBg: 'from-emerald-500 to-green-600',
    members: ['Ghina', 'Fadillah', 'Misbah', 'Anam'],
  },
  {
    id: 2,
    name: 'Kelompok 2',
    badge: '🐬',
    themeColor: 'sky',
    accentBg: 'from-sky-500 to-blue-600',
    members: ['Sayyidah', 'Zaki', 'Nicole', 'Afif', 'Anders'],
  },
  {
    id: 3,
    name: 'Kelompok 3',
    badge: '🦊',
    themeColor: 'amber',
    accentBg: 'from-amber-500 to-orange-600',
    members: ['Faiz', 'Rasya', 'Dhistya', 'Davin', 'Alya'],
  },
  {
    id: 4,
    name: 'Kelompok 4',
    badge: '🐼',
    themeColor: 'purple',
    accentBg: 'from-purple-500 to-indigo-600',
    members: ['Pinga', 'Kenzo', 'Nisa', 'Grisella', 'Danis'],
  },
  {
    id: 5,
    name: 'Kelompok 5',
    badge: '🐨',
    themeColor: 'rose',
    accentBg: 'from-rose-500 to-pink-600',
    members: ['Asyffa', 'Julio', 'Mawa', 'Bastiyan'],
  },
];
