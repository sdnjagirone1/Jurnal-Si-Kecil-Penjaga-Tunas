import { JournalDay, LkpdData } from '../types';

const STORAGE_KEY_URL = 'kangkung_gas_webapp_url';

/**
 * Normalisasi nilai tanggal dari Google Sheets / Apps Script / browser menjadi format
 * standar 'YYYY-MM-DD' yang valid untuk input HTML5 <input type="date">.
 */
export function normalizeDateToYMD(rawDate: unknown): string {
  if (rawDate === null || rawDate === undefined || rawDate === '') return '';

  // 1. Jika serial date angka dari spreadsheet atau timestamp
  if (typeof rawDate === 'number' && !isNaN(rawDate)) {
    if (rawDate > 1000 && rawDate < 100000) {
      // Serial date Excel/Google Sheets (hari sejak 1899-12-30)
      const utcDays = Math.floor(rawDate - 25569);
      const d = new Date(utcDays * 86400 * 1000);
      if (!isNaN(d.getTime())) {
        const y = d.getUTCFullYear();
        const m = String(d.getUTCMonth() + 1).padStart(2, '0');
        const day = String(d.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    } else if (rawDate >= 1000000000) {
      const ms = rawDate < 10000000000 ? rawDate * 1000 : rawDate;
      const d = new Date(ms);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    }
  }

  const str = String(rawDate).trim();
  if (!str) return '';

  // 2. Format standar ISO: YYYY-MM-DD (e.g. "2026-09-22" atau "2026-09-22T08:00:00...")
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const y = isoMatch[1];
    const m = isoMatch[2].padStart(2, '0');
    const d = isoMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 3. Format umum Indonesia/Spreadsheet: DD/MM/YYYY atau DD-MM-YYYY (e.g. "22/09/2026")
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // 4. Format slashed: YYYY/MM/DD (e.g. "2026/09/22")
  const ymdMatch = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 5. String tanggal dengan nama bulan (termasuk yang terpotong split('T')[0] seperti "Tue Sep 22 2026 00:00:00 GM")
  const monthMap: Record<string, string> = {
    jan: '01', januari: '01', january: '01',
    feb: '02', februari: '02', february: '02',
    mar: '03', maret: '03', march: '03',
    apr: '04', april: '04',
    mei: '05', may: '05',
    jun: '06', juni: '06', june: '06',
    jul: '07', juli: '07', july: '07',
    agu: '08', agustus: '08', aug: '08', august: '08',
    sep: '09', september: '09',
    okt: '10', oktober: '10', oct: '10', october: '10',
    nop: '11', nov: '11', november: '11',
    des: '12', desember: '12', dec: '12', december: '12',
  };

  const engMatch = str.match(/(?:[A-Za-z]{3,}\s+)?([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})/);
  if (engMatch) {
    const mKey = engMatch[1].toLowerCase().slice(0, 3);
    const m = monthMap[mKey];
    if (m) {
      const d = engMatch[2].padStart(2, '0');
      const y = engMatch[3];
      return `${y}-${m}-${d}`;
    }
  }

  const dmyTextMatch = str.match(/(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/);
  if (dmyTextMatch) {
    const mKey = dmyTextMatch[2].toLowerCase().slice(0, 3);
    const m = monthMap[mKey];
    if (m) {
      const d = dmyTextMatch[1].padStart(2, '0');
      const y = dmyTextMatch[3];
      return `${y}-${m}-${d}`;
    }
  }

  // 6. Fallback konstruktor Date bawaan
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      const d = String(parsed.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  } catch {
    // abaikan jika parsing gagal
  }

  return '';
}

function cleanJournalDays(days: JournalDay[]): JournalDay[] {
  return days.map((d) => {
    let cleanHeight: number | string = d.heightCm;
    if (typeof cleanHeight === 'string') {
      const trimmed = cleanHeight.trim().replace(',', '.');
      const num = parseFloat(trimmed);
      cleanHeight = !isNaN(num) ? num : trimmed;
    }
    return {
      ...d,
      date: normalizeDateToYMD(d.date),
      heightCm: cleanHeight,
    };
  });
}

export const sheetService = {
  // Get configured Web App URL from localStorage
  getWebAppUrl(): string {
    return localStorage.getItem(STORAGE_KEY_URL) || '';
  },

  // Save Web App URL
  setWebAppUrl(url: string) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
  },

  // Check if Web App URL is set
  isConfigured(): boolean {
    const url = this.getWebAppUrl();
    return Boolean(url && url.startsWith('https://script.google.com/'));
  },

  // Test connection to Google Apps Script Web App
  async testConnection(customUrl?: string): Promise<{ success: boolean; message: string }> {
    const url = (customUrl || this.getWebAppUrl()).trim();
    if (!url) {
      return { success: false, message: 'URL Google Apps Script belum dimasukkan.' };
    }
    if (!url.startsWith('https://script.google.com/')) {
      return {
        success: false,
        message: 'Format URL tidak valid. Pastikan dimulai dengan https://script.google.com/.../exec',
      };
    }

    try {
      const pingUrl = `${url}${url.includes('?') ? '&' : '?'}action=ping&_t=${Date.now()}`;
      const response = await fetch(pingUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data.status === 'success') {
        return {
          success: true,
          message: data.message || 'Berhasil terhubung dengan Google Sheets!',
        };
      }
      return {
        success: false,
        message: data.message || 'Respon dari Google Sheets tidak sesuai format.',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal terhubung (${errorMsg}). Pastikan deployment Apps Script diset: "Who has access: Anyone".`,
      };
    }
  },

  // Sync a single day observation to Google Sheets
  async syncDay(groupId: number, day: JournalDay): Promise<{ success: boolean; message: string }> {
    const url = this.getWebAppUrl();
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Google Apps Script belum dikonfigurasi.',
      };
    }

    const cleanDay = cleanJournalDays([day])[0];
    const payload = {
      action: 'syncDay',
      groupId,
      day: cleanDay,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const resJson = await response.json();
      return {
        success: resJson.status === 'success',
        message: resJson.message || `Hari ke-${day.dayNumber} berhasil disimpan ke Google Sheets!`,
      };
    } catch {
      try {
        const fallbackUrl = `${url}${url.includes('?') ? '&' : '?'}action=syncDay&data=${encodeURIComponent(
          JSON.stringify(payload)
        )}&_t=${Date.now()}`;
        const fallbackRes = await fetch(fallbackUrl, { method: 'GET' });
        const resJson = await fallbackRes.json();
        return {
          success: resJson.status === 'success',
          message: resJson.message || `Hari ke-${day.dayNumber} berhasil disimpan ke Google Sheets!`,
        };
      } catch (fallbackErr: unknown) {
        const errStr = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        return {
          success: false,
          message: `Gagal mengirim ke Google Sheets: ${errStr}`,
        };
      }
    }
  },

  // Sync one group's 15-day journal to Google Sheets
  async syncGroup(groupId: number, days: JournalDay[]): Promise<{ success: boolean; message: string }> {
    const url = this.getWebAppUrl();
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Google Apps Script belum dikonfigurasi. Silakan masukkan Web App URL terlebih dahulu.',
      };
    }

    const payload = {
      action: 'syncGroup',
      groupId,
      days: cleanJournalDays(days),
    };

    try {
      // First attempt: POST with text/plain to avoid strict CORS preflight
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const resJson = await response.json();
      return {
        success: resJson.status === 'success',
        message: resJson.message || 'Data berhasil dikirim ke Google Sheets!',
      };
    } catch {
      // Fallback: GET with encoded payload for strict school proxy/CORS environments
      try {
        const fallbackUrl = `${url}${url.includes('?') ? '&' : '?'}action=syncGroup&data=${encodeURIComponent(
          JSON.stringify(payload)
        )}&_t=${Date.now()}`;
        const fallbackRes = await fetch(fallbackUrl, { method: 'GET' });
        const resJson = await fallbackRes.json();
        return {
          success: resJson.status === 'success',
          message: resJson.message || 'Data berhasil dikirim ke Google Sheets!',
        };
      } catch (fallbackErr: unknown) {
        const errStr = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        return {
          success: false,
          message: `Gagal mengirim ke Google Sheets: ${errStr}. Cek izin "Anyone" pada Web App.`,
        };
      }
    }
  },

  // Sync all groups (Kelompok 1 to 5) to Google Sheets
  async syncAllGroups(allJournals: Record<number, JournalDay[]>): Promise<{ success: boolean; message: string }> {
    const url = this.getWebAppUrl();
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Google Apps Script belum dikonfigurasi. Buka menu Google Sheet untuk mengaturnya.',
      };
    }

    const cleanedAll: Record<number, JournalDay[]> = {};
    Object.keys(allJournals).forEach((k) => {
      const gId = Number(k);
      cleanedAll[gId] = cleanJournalDays(allJournals[gId] || []);
    });

    const payload = {
      action: 'syncAll',
      data: cleanedAll,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();
      return {
        success: resJson.status === 'success',
        message: resJson.message || 'Seluruh data 5 kelompok berhasil disimpan di Google Sheets!',
      };
    } catch {
      // Fallback via GET
      try {
        const fallbackUrl = `${url}${url.includes('?') ? '&' : '?'}action=syncAll&data=${encodeURIComponent(
          JSON.stringify(allJournals)
        )}&_t=${Date.now()}`;
        const fallbackRes = await fetch(fallbackUrl, { method: 'GET' });
        const resJson = await fallbackRes.json();
        return {
          success: resJson.status === 'success',
          message: resJson.message || 'Seluruh data berhasil disimpan di Google Sheets!',
        };
      } catch (err: unknown) {
        const errStr = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          message: `Gagal sinkronisasi: ${errStr}`,
        };
      }
    }
  },

  // Read all group journals from Google Sheets
  async fetchAllGroups(): Promise<{ success: boolean; data?: Record<number, JournalDay[]>; message?: string }> {
    const url = this.getWebAppUrl();
    if (!this.isConfigured()) {
      return { success: false, message: 'URL Google Apps Script belum diatur.' };
    }

    try {
      const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}action=getAll&_t=${Date.now()}`;
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.status === 'success' && resJson.data) {
        const rawMap = resJson.data as Record<string, JournalDay[]>;
        const normalizedData: Record<number, JournalDay[]> = {};
        for (let g = 1; g <= 5; g++) {
          const list = rawMap[g] || (rawMap as Record<number, JournalDay[]>)[g] || [];
          const dayMap: Record<number, JournalDay> = {};
          if (Array.isArray(list)) {
            list.forEach((day, idx) => {
              if (day) {
                const dayNum = day.dayNumber || idx + 1;
                dayMap[dayNum] = day;
              }
            });
          }

          const full15: JournalDay[] = [];
          for (let d = 1; d <= 15; d++) {
            const day = dayMap[d];
            if (day) {
              let cleanHeight: number | string = day.heightCm;
              if (typeof cleanHeight === 'string') {
                const trimmed = cleanHeight.trim().replace(',', '.');
                const num = parseFloat(trimmed);
                cleanHeight = !isNaN(num) ? num : trimmed;
              }
              full15.push({
                ...day,
                dayNumber: d,
                label: day.label || `Hari ${d}`,
                date: normalizeDateToYMD(day.date),
                heightCm: cleanHeight,
                condition: day.condition || '',
                conditionEmoji: day.conditionEmoji || '',
                notes: day.notes || '',
                hasNewLeaves: Boolean(day.hasNewLeaves),
                grewTaller: Boolean(day.grewTaller),
                greenLeaves: day.greenLeaves !== false,
                looksFresh: day.looksFresh !== false,
                hasYellowLeaves: Boolean(day.hasYellowLeaves),
              });
            } else {
              full15.push({
                dayNumber: d,
                label: `Hari ${d}`,
                date: '',
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
          }
          normalizedData[g] = full15;
        }
        return {
          success: true,
          data: normalizedData,
          message: 'Berhasil mengunduh data jurnal dari Google Sheets!',
        };
      }
      return {
        success: false,
        message: resJson.message || 'Data kosong atau format respon tidak sesuai.',
      };
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal mengambil data dari Google Sheets: ${errStr}`,
      };
    }
  },

  // Sync one group's LKPD 1 to Google Sheets
  async syncLkpd(groupId: number, lkpdData: LkpdData): Promise<{ success: boolean; message: string }> {
    const url = this.getWebAppUrl();
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Google Apps Script belum dikonfigurasi. Silakan atur URL Web App terlebih dahulu.',
      };
    }

    const payload = {
      action: 'syncLkpd',
      groupId,
      lkpdData,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const resJson = await response.json();
      return {
        success: resJson.status === 'success',
        message: resJson.message || `LKPD 1 untuk ${lkpdData.groupName} berhasil disimpan ke Google Sheets!`,
      };
    } catch {
      // Fallback via GET parameter
      try {
        const fallbackUrl = `${url}${url.includes('?') ? '&' : '?'}action=syncLkpd&data=${encodeURIComponent(
          JSON.stringify(payload)
        )}&_t=${Date.now()}`;
        const fallbackRes = await fetch(fallbackUrl, { method: 'GET' });
        const resJson = await fallbackRes.json();
        return {
          success: resJson.status === 'success',
          message: resJson.message || `LKPD 1 untuk ${lkpdData.groupName} berhasil disimpan ke Google Sheets!`,
        };
      } catch (fallbackErr: unknown) {
        const errStr = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        return {
          success: false,
          message: `Gagal mengirim LKPD ke Google Sheets: ${errStr}`,
        };
      }
    }
  },

  // Sync all groups' LKPD 1 to Google Sheets
  async syncAllLkpd(allLkpd: Record<number, LkpdData>): Promise<{ success: boolean; message: string }> {
    const url = this.getWebAppUrl();
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Google Apps Script belum dikonfigurasi. Silakan atur URL Web App terlebih dahulu.',
      };
    }

    const payload = {
      action: 'syncAllLkpd',
      data: allLkpd,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      const resJson = await response.json();
      return {
        success: resJson.status === 'success',
        message: resJson.message || 'Seluruh LKPD kelompok berhasil disimpan ke Google Sheets!',
      };
    } catch {
      try {
        const fallbackUrl = `${url}${url.includes('?') ? '&' : '?'}action=syncAllLkpd&data=${encodeURIComponent(
          JSON.stringify(allLkpd)
        )}&_t=${Date.now()}`;
        const fallbackRes = await fetch(fallbackUrl, { method: 'GET' });
        const resJson = await fallbackRes.json();
        return {
          success: resJson.status === 'success',
          message: resJson.message || 'Seluruh LKPD berhasil disimpan ke Google Sheets!',
        };
      } catch (err: unknown) {
        const errStr = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          message: `Gagal sinkronisasi LKPD: ${errStr}`,
        };
      }
    }
  },

  // Read all group LKPDs from Google Sheets
  async fetchAllLkpd(): Promise<{ success: boolean; data?: Record<number, LkpdData>; message?: string }> {
    const url = this.getWebAppUrl();
    if (!this.isConfigured()) {
      return { success: false, message: 'URL Google Apps Script belum diatur.' };
    }

    try {
      const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}action=getAllLkpd&_t=${Date.now()}`;
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const resJson = await response.json();
      if (resJson.status === 'success' && resJson.data) {
        return {
          success: true,
          data: resJson.data,
          message: 'Berhasil mengunduh data LKPD dari Google Sheets!',
        };
      }
      return {
        success: false,
        message: resJson.message || 'Data LKPD kosong atau format respon tidak sesuai.',
      };
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal mengambil data LKPD dari Google Sheets: ${errStr}`,
      };
    }
  },
};
