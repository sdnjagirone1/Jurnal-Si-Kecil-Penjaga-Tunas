import { JournalDay, LkpdData } from '../types';

const STORAGE_KEY_URL = 'kangkung_gas_webapp_url';

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
      days,
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

    const payload = {
      action: 'syncAll',
      data: allJournals,
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
        return {
          success: true,
          data: resJson.data,
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
