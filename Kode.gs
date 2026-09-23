/**
 * =====================================================================
 * 🌱 KODE.GS: DATABASE GOOGLE SHEETS
 * MEDIA PEMBELAJARAN INTERAKTIF KELAS 1 SDN JAGIR I/393 SURABAYA
 * "SI KECIL PENJAGA TUNAS" (JURNAL 15 HARI & LKPD 1)
 * =====================================================================
 * 
 * PANDUAN PEMASANGAN (HANYA 3 MENIT):
 * 1. Buka Google Spreadsheet baru (di https://sheets.new)
 * 2. Beri nama spreadsheet: "Database Jurnal Kangkung SDN Jagir 1"
 * 3. Klik menu: Ekstensi (Extensions) > Apps Script
 * 4. Hapus semua kode yang ada di Apps Script, lalu SALIN & TEMPEL (PASTE) seluruh kode ini.
 * 5. Klik icon Disket 💾 (Simpan).
 * 6. Klik tombol biru "Terapkan" (Deploy) > "Penerapan baru" (New deployment).
 * 7. Pilih jenis: "Aplikasi Web" (Web app).
 * 8. Isi konfigurasi berikut:
 *    - Deskripsi: API Jurnal Kangkung 15 Hari
 *    - Jalankan sebagai (Execute as): Saya (email Anda)
 *    - Yang memiliki akses (Who has access): Siapa saja (Anyone) -> [PENTING!]
 * 9. Klik "Terapkan" (Deploy) lalu berikan izin akses (Review Permissions -> Lanjutan/Advanced -> Buka/Go to Project).
 * 10. Salin "URL Aplikasi Web" (Web App URL) yang berakhiran `/exec`.
 * 11. Masukkan URL tersebut ke aplikasi Jurnal Kangkung pada tombol "☁️ Google Sheet".
 * =====================================================================
 */

// Nama Sheet untuk tabel database utama
const SHEET_NAME = 'Jurnal_15_Hari';
const SHEET_STARS = 'Bintang_Siswa';
const SHEET_LKPD = 'LKPD_1_Menanam';

/**
 * Daftar Kelompok & Anggota (Sesuai Data Kelas 1 SDN Jagir 1)
 */
const DATA_KELOMPOK = {
  1: { nama: 'Kelompok 1', badge: '🦁', anggota: 'Ghina, Fadillah, Misbah, Anam' },
  2: { nama: 'Kelompok 2', badge: '🐬', anggota: 'Sayyidah, Zaki, Nicole, Afif, Anders' },
  3: { nama: 'Kelompok 3', badge: '🦊', anggota: 'Faiz, Rasya, Dhistya, Davin, Alya' },
  4: { nama: 'Kelompok 4', badge: '🐼', anggota: 'Pinga, Kenzo, Nisa, Grisella, Danis' },
  5: { nama: 'Kelompok 5', badge: '🐨', anggota: 'Asyffa, Julio, Mawa, Bastiyan' }
};

/**
 * Header Kolom Tabel Jurnal
 */
const HEADERS_JURNAL = [
  'Timestamp',
  'Kelompok_ID',
  'Nama_Kelompok',
  'Hari_Ke',
  'Tanggal',
  'Tinggi_cm',
  'Kondisi',
  'Emoji',
  'Catatan_Pengamatan',
  'Daun_Baru',
  'Bertambah_Tinggi',
  'Daun_Hijau',
  'Segar',
  'Daun_Kuning',
  'Anggota_Kelompok',
  'Status'
];

/**
 * Header Kolom Tabel LKPD 1: Ayo Menanam Kangkung (Hari Pertama)
 */
const HEADERS_LKPD = [
  'Timestamp',
  'Kelompok_ID',
  'Nama_Kelompok',
  'Anggota_Kelompok',
  'Tugas1_Wadah_Media',
  'Tugas1_Lubang_Kecil',
  'Tugas1_Letak_Biji',
  'Tugas1_Tutup_Media',
  'Tugas1_Siram_Secukupnya',
  'Tugas1_Label_Nama',
  'Total_Langkah_Selesai',
  'Tugas3_Prediksi_Siswa',
  'Tugas4_Senang',
  'Tugas4_Bekerja_Sama',
  'Tugas4_Siap_Merawat',
  'Status_LKPD',
  'Keterangan_Gambar'
];

/**
 * Inisialisasi Sheet otomatis jika belum ada
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Hapus sheet default jika kosong
    const sheets = ss.getSheets();
    if (sheets.length > 1 && sheets[0].getName() === 'Sheet1') {
      try { ss.deleteSheet(sheets[0]); } catch (e) {}
    }
    
    // Tulis Header Kolom
    sheet.appendRow(HEADERS_JURNAL);
    
    // Format Header agar rapi dan ramah anak
    const headerRange = sheet.getRange(1, 1, 1, HEADERS_JURNAL.length);
    headerRange.setBackground('#10b981'); // Emerald green
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    
    // Atur lebar kolom otomatis
    for (let c = 1; c <= HEADERS_JURNAL.length; c++) {
      sheet.autoResizeColumn(c);
    }
  }
  return sheet;
}

/**
 * Handle HTTP GET Requests
 * Bisa untuk tes koneksi, membaca data (getAll, getGroup), atau menyimpan data via GET query
 */
function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || 'ping';

    // 1. Tes Koneksi / Info API
    if (action === 'ping' || action === 'status') {
      return jsonResponse({
        status: 'success',
        message: '🌱 API Google Sheet Jurnal Kangkung SDN Jagir 1 Aktif & Terhubung!',
        timestamp: new Date().toISOString(),
        totalKelompok: 5,
        totalHari: 15
      });
    }

    // 2. Ambil Semua Data Jurnal
    if (action === 'getAll') {
      const allData = readAllJournalData();
      return jsonResponse({
        status: 'success',
        data: allData
      });
    }

    // 3. Ambil Data Kelompok Tertentu
    if (action === 'getGroup') {
      const groupId = parseInt(params.groupId, 10) || 1;
      const allData = readAllJournalData();
      const groupData = allData[groupId] || [];
      return jsonResponse({
        status: 'success',
        groupId: groupId,
        data: groupData
      });
    }

    // 4. Sinkronisasi via GET parameter (Fallback aman jika POST terhalang CORS di browser)
    if (action === 'syncGroup' && params.data) {
      const payload = JSON.parse(params.data);
      const res = saveGroupJournal(payload.groupId, payload.days);
      return jsonResponse(res);
    }

    if (action === 'syncAll' && params.data) {
      const payload = JSON.parse(params.data);
      const res = saveAllGroups(payload);
      return jsonResponse(res);
    }

    // 5. Sinkronisasi LKPD via GET
    if (action === 'syncLkpd' && params.data) {
      const payload = JSON.parse(params.data);
      const res = saveGroupLkpd(payload.groupId, payload.lkpdData || payload);
      return jsonResponse(res);
    }

    if (action === 'syncAllLkpd' && params.data) {
      const payload = JSON.parse(params.data);
      const res = saveAllLkpd(payload);
      return jsonResponse(res);
    }

    // 6. Ambil Data LKPD
    if (action === 'getAllLkpd') {
      const lkpdData = readAllLkpdData();
      return jsonResponse({
        status: 'success',
        data: lkpdData
      });
    }

    return jsonResponse({
      status: 'success',
      message: 'Layanan Database Jurnal Kangkung siap menerima data.'
    });

  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Handle HTTP POST Requests (Menerima JSON body)
 */
function doPost(e) {
  try {
    let payload;
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    } else if (e && e.parameter && e.parameter.data) {
      payload = JSON.parse(e.parameter.data);
    } else {
      throw new Error('Tidak ada data payload yang diterima.');
    }

    const action = payload.action || 'syncGroup';

    if (action === 'syncGroup') {
      const groupId = parseInt(payload.groupId, 10);
      const days = payload.days || [];
      const result = saveGroupJournal(groupId, days);
      return jsonResponse(result);
    }

    if (action === 'syncAll') {
      const allData = payload.data || {};
      const result = saveAllGroups(allData);
      return jsonResponse(result);
    }

    if (action === 'syncLkpd') {
      const groupId = parseInt(payload.groupId, 10);
      const lkpdData = payload.lkpdData || payload.data || {};
      const result = saveGroupLkpd(groupId, lkpdData);
      return jsonResponse(result);
    }

    if (action === 'syncAllLkpd') {
      const allLkpd = payload.data || {};
      const result = saveAllLkpd(allLkpd);
      return jsonResponse(result);
    }

    return jsonResponse({
      status: 'error',
      message: 'Action tidak dikenali: ' + action
    });

  } catch (error) {
    return jsonResponse({
      status: 'error',
      message: error.toString()
    });
  }
}

/**
 * Simpan data pengamatan 15 hari untuk 1 kelompok
 */
function saveGroupJournal(groupId, days) {
  const sheet = getOrCreateSheet();
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    const groupInfo = DATA_KELOMPOK[groupId] || { nama: 'Kelompok ' + groupId, anggota: '-' };
    const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    // Baca data yang sudah ada untuk memperbarui atau menambah
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Map untuk mencari baris berdasarkan "KelompokID_HariKe"
    const rowMap = {};
    for (let r = 1; r < values.length; r++) {
      const rowGroupId = values[r][1];
      const rowDay = values[r][3];
      if (rowGroupId && rowDay) {
        rowMap[rowGroupId + '_' + rowDay] = r + 1; // 1-indexed baris sheet
      }
    }

    days.forEach(function (day) {
      const dayNum = day.dayNumber;
      const key = groupId + '_' + dayNum;
      
      const height = (day.heightCm !== '' && !isNaN(day.heightCm)) ? Number(day.heightCm) : '';
      const condition = day.condition || '';
      const emoji = day.conditionEmoji || '';
      const notes = day.notes || '';
      const dateVal = day.date || '';
      const daunBaru = day.hasNewLeaves ? 'YA' : 'TIDAK';
      const bertambahTinggi = day.grewTaller ? 'YA' : 'TIDAK';
      const daunHijau = day.greenLeaves ? 'YA' : 'TIDAK';
      const segar = day.looksFresh ? 'YA' : 'TIDAK';
      const daunKuning = day.hasYellowLeaves ? 'YA' : 'TIDAK';
      const status = height !== '' ? 'Lengkap ⭐' : 'Belum diisi';

      const rowData = [
        nowStr,
        groupId,
        groupInfo.nama,
        dayNum,
        dateVal,
        height,
        condition,
        emoji,
        notes,
        daunBaru,
        bertambahTinggi,
        daunHijau,
        segar,
        daunKuning,
        groupInfo.anggota,
        status
      ];

      if (rowMap[key]) {
        // Update baris yang sudah ada
        const targetRow = rowMap[key];
        sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
      } else {
        // Tambahkan baris baru
        sheet.appendRow(rowData);
      }
    });

    return {
      status: 'success',
      message: 'Berhasil menyimpan jurnal 15 hari untuk ' + groupInfo.nama + '!',
      groupId: groupId,
      updatedAt: nowStr
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Simpan data pengamatan dari semua 5 kelompok sekaligus
 */
function saveAllGroups(allData) {
  let count = 0;
  for (let gId = 1; gId <= 5; gId++) {
    if (allData[gId] && Array.isArray(allData[gId])) {
      saveGroupJournal(gId, allData[gId]);
      count++;
    }
  }
  return {
    status: 'success',
    message: 'Berhasil menyinkronkan seluruh jurnal dari ' + count + ' kelompok ke Google Sheet!',
    timestamp: new Date().toISOString()
  };
}

/**
 * Baca seluruh data jurnal dari Sheet menjadi format JSON
 */
function readAllJournalData() {
  const sheet = getOrCreateSheet();
  const values = sheet.getDataRange().getValues();
  const result = { 1: [], 2: [], 3: [], 4: [], 5: [] };

  // Mulai dari baris 2 (melewati header)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const gId = parseInt(row[1], 10);
    const dayNum = parseInt(row[3], 10);

    if (gId >= 1 && gId <= 5 && dayNum >= 1 && dayNum <= 15) {
      const heightVal = row[5];
      result[gId].push({
        dayNumber: dayNum,
        label: 'Hari ' + dayNum,
        date: row[4] ? String(row[4]).split('T')[0] : '',
        heightCm: heightVal !== '' && !isNaN(heightVal) ? Number(heightVal) : '',
        condition: String(row[6] || ''),
        conditionEmoji: String(row[7] || ''),
        notes: String(row[8] || ''),
        hasNewLeaves: row[9] === 'YA',
        grewTaller: row[10] === 'YA',
        greenLeaves: row[11] === 'YA',
        looksFresh: row[12] === 'YA',
        hasYellowLeaves: row[13] === 'YA'
      });
    }
  }

  // Pastikan tiap kelompok memiliki 15 entri terurut
  for (let g = 1; g <= 5; g++) {
    result[g].sort(function (a, b) {
      return a.dayNumber - b.dayNumber;
    });
  }

  return result;
}

/**
 * Inisialisasi Sheet LKPD 1 jika belum ada
 */
function getOrCreateLkpdSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_LKPD);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_LKPD);
    sheet.appendRow(HEADERS_LKPD);
    
    // Format Header agar rapi
    const headerRange = sheet.getRange(1, 1, 1, HEADERS_LKPD.length);
    headerRange.setBackground('#059669'); // Emerald 600
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    
    for (let c = 1; c <= HEADERS_LKPD.length; c++) {
      sheet.autoResizeColumn(c);
    }
  }
  return sheet;
}

/**
 * Simpan data LKPD 1 untuk 1 kelompok
 */
function saveGroupLkpd(groupId, lkpd) {
  const sheet = getOrCreateLkpdSheet();
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    const groupInfo = DATA_KELOMPOK[groupId] || { nama: 'Kelompok ' + groupId, anggota: '-' };
    const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
    const tasks = (lkpd && lkpd.tasks) ? lkpd.tasks : {};
    const ref = (lkpd && lkpd.reflection) ? lkpd.reflection : {};

    const t1 = tasks.wadahMedia ? '✓ YA' : 'TIDAK';
    const t2 = tasks.lubangKecil ? '✓ YA' : 'TIDAK';
    const t3 = tasks.letakBiji ? '✓ YA' : 'TIDAK';
    const t4 = tasks.tutupMedia ? '✓ YA' : 'TIDAK';
    const t5 = tasks.siramSecukupnya ? '✓ YA' : 'TIDAK';
    const t6 = tasks.labelNama ? '✓ YA' : 'TIDAK';

    let totalDone = 0;
    if (tasks.wadahMedia) totalDone++;
    if (tasks.lubangKecil) totalDone++;
    if (tasks.letakBiji) totalDone++;
    if (tasks.tutupMedia) totalDone++;
    if (tasks.siramSecukupnya) totalDone++;
    if (tasks.labelNama) totalDone++;

    const totalStr = totalDone + ' / 6 Langkah';
    const prediksi = (lkpd && lkpd.prediction) ? lkpd.prediction : '';
    const refSenang = ref.senang ? '✓ YA' : 'TIDAK';
    const refBekerja = ref.bekerjaSama ? '✓ YA' : 'TIDAK';
    const refMerawat = ref.siapMerawat ? '✓ YA' : 'TIDAK';
    const status = totalDone === 6 && prediksi ? 'Selesai Lengkap ⭐' : 'Sedang Dikerjakan';
    const keteranganGambar = (lkpd && lkpd.drawingDataUrl && lkpd.drawingDataUrl.length > 50)
      ? 'Ada Gambar Siswa 🎨'
      : 'Belum Ada Gambar';
    const anggota = (lkpd && lkpd.members) ? lkpd.members : groupInfo.anggota;

    const rowData = [
      nowStr,
      groupId,
      (lkpd && lkpd.groupName) ? lkpd.groupName : groupInfo.nama,
      anggota,
      t1,
      t2,
      t3,
      t4,
      t5,
      t6,
      totalStr,
      prediksi,
      refSenang,
      refBekerja,
      refMerawat,
      status,
      keteranganGambar
    ];

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    let foundRow = -1;

    for (let r = 1; r < values.length; r++) {
      if (parseInt(values[r][1], 10) === groupId) {
        foundRow = r + 1;
        break;
      }
    }

    if (foundRow > 0) {
      sheet.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }

    return {
      status: 'success',
      message: 'Berhasil menyimpan data LKPD 1 untuk ' + ((lkpd && lkpd.groupName) ? lkpd.groupName : groupInfo.nama) + '!',
      groupId: groupId,
      updatedAt: nowStr
    };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Simpan data LKPD dari seluruh kelompok
 */
function saveAllLkpd(allLkpd) {
  let count = 0;
  for (let gId = 1; gId <= 5; gId++) {
    if (allLkpd[gId]) {
      saveGroupLkpd(gId, allLkpd[gId]);
      count++;
    }
  }
  return {
    status: 'success',
    message: 'Berhasil menyimpan LKPD 1 dari ' + count + ' kelompok ke Google Sheet!',
    timestamp: new Date().toISOString()
  };
}

/**
 * Baca seluruh data LKPD dari Sheet
 */
function readAllLkpdData() {
  const sheet = getOrCreateLkpdSheet();
  const values = sheet.getDataRange().getValues();
  const result = {};

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const gId = parseInt(row[1], 10);
    if (gId >= 1 && gId <= 5) {
      result[gId] = {
        updatedAt: row[0],
        groupId: gId,
        groupName: String(row[2] || ''),
        members: String(row[3] || ''),
        tasks: {
          wadahMedia: String(row[4]).includes('YA'),
          lubangKecil: String(row[5]).includes('YA'),
          letakBiji: String(row[6]).includes('YA'),
          tutupMedia: String(row[7]).includes('YA'),
          siramSecukupnya: String(row[8]).includes('YA'),
          labelNama: String(row[9]).includes('YA'),
        },
        prediction: String(row[11] || ''),
        reflection: {
          senang: String(row[12]).includes('YA'),
          bekerjaSama: String(row[13]).includes('YA'),
          siapMerawat: String(row[14]).includes('YA'),
        },
        status: String(row[15] || '')
      };
    }
  }

  return result;
}

/**
 * Format respon JSON standar dengan header CORS
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Fungsi uji coba internal (bisa dijalankan langsung di editor Apps Script)
 */
function testScriptSetup() {
  const sheet = getOrCreateSheet();
  Logger.log('Sheet berhasil dicek: ' + sheet.getName());
  
  // Test simpan hari 1 untuk kelompok 1
  const testDays = [{
    dayNumber: 1,
    date: '2026-09-22',
    heightCm: 0.5,
    condition: 'Sehat',
    conditionEmoji: '🌱',
    notes: 'Tes penanaman biji kangkung',
    hasNewLeaves: false,
    grewTaller: true,
    greenLeaves: true,
    looksFresh: true,
    hasYellowLeaves: false
  }];
  
  const res = saveGroupJournal(1, testDays);
  Logger.log('Hasil Test: ' + JSON.stringify(res));
}
