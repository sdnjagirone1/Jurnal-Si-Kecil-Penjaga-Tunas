import { JournalDay, GROUPS_DATA, LkpdData } from '../types';
import { normalizeDateToYMD } from './sheetService';

/**
 * Generate 15 default blank observation days for a group.
 */
export const generateBlankDays = (): JournalDay[] => {
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

/**
 * Ensures that a group's journal always contains all 15 days (day 1 to 15).
 * If the input is undefined, null, empty array [], or has missing days,
 * it merges existing data with default 15 days so no table ever appears blank.
 */
export const ensure15Days = (days?: JournalDay[] | null): JournalDay[] => {
  const blank = generateBlankDays();
  if (!days || !Array.isArray(days) || days.length === 0) {
    return blank;
  }

  // Index existing entries by dayNumber (1 to 15)
  const mapByDay: Record<number, JournalDay> = {};
  days.forEach((d, idx) => {
    if (!d) return;
    const num = typeof d.dayNumber === 'number' && d.dayNumber >= 1 && d.dayNumber <= 15
      ? d.dayNumber
      : idx + 1 <= 15
      ? idx + 1
      : null;
    if (num !== null) {
      mapByDay[num] = d;
    }
  });

  return blank.map((blankDay) => {
    const found = mapByDay[blankDay.dayNumber];
    if (found) {
      let cleanHeight: number | string = found.heightCm;
      if (typeof cleanHeight === 'string') {
        const trimmed = cleanHeight.trim().replace(',', '.');
        const parsedNum = parseFloat(trimmed);
        cleanHeight = !isNaN(parsedNum) ? parsedNum : trimmed;
      }
      return {
        ...blankDay,
        ...found,
        dayNumber: blankDay.dayNumber,
        label: found.label || blankDay.label,
        date: normalizeDateToYMD(found.date) || blankDay.date,
        heightCm: cleanHeight,
        condition: found.condition ?? '',
        conditionEmoji: found.conditionEmoji ?? '',
        notes: found.notes ?? '',
        hasNewLeaves: Boolean(found.hasNewLeaves),
        grewTaller: Boolean(found.grewTaller),
        greenLeaves: found.greenLeaves !== false,
        looksFresh: found.looksFresh !== false,
        hasYellowLeaves: Boolean(found.hasYellowLeaves),
      };
    }
    return blankDay;
  });
};

/**
 * Generate blank LKPD 1 for a group
 */
export const generateBlankLkpd = (groupId: number): LkpdData => {
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
