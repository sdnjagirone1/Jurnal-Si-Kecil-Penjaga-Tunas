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
 * Fungsi bantu: Parsing tinggi tanaman yang aman (angka, string desimal titik/koma "2,5" atau "2.5 cm")
 */
function parsePlantHeight(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number') {
    return isNaN(val) ? '' : val;
  }
  var str = String(val).trim();
  if (str === '') return '';
  // Bersihkan satuan teks seperti "cm" atau "CM"
  str = str.replace(/cm$/i, '').trim();
  // Ganti koma ke titik (format desimal khas Indonesia, misal "2,5" -> "2.5")
  str = str.replace(',', '.');
  var num = parseFloat(str);
  return !isNaN(num) ? num : '';
}

/**
 * Fungsi bantu: Ekstrak nilai tinggi tanaman dari berbagai variasi nama properti
 */
function extractDayHeight(day) {
  if (!day) return '';
  var candidates = [day.heightCm, day.height, day.tinggi, day.tinggiCm, day.tinggi_cm, day.height_cm];
  for (var i = 0; i < candidates.length; i++) {
    var val = candidates[i];
    if (val !== undefined && val !== null && val !== '') {
      var parsed = parsePlantHeight(val);
      if (parsed !== '') return parsed;
    }
  }
  return '';
}

/**
 * Fungsi bantu: Ekstrak angka murni untuk ID Kelompok dan Hari Ke (misal "Kelompok 1" -> 1, "Hari 5" -> 5)
 */
function extractDigits(val) {
  if (val === null || val === undefined) return '';
  var clean = String(val).replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : '';
}

/**
 * Format Header Kolom Sheet agar rapi dan mudah dibaca
 */
function formatHeaderRow(sheet, numCols, bgColor) {
  try {
    const headerRange = sheet.getRange(1, 1, 1, numCols);
    headerRange.setBackground(bgColor || '#10b981');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    for (let c = 1; c <= numCols; c++) {
      sheet.autoResizeColumn(c);
    }
  } catch (e) {
    Logger.log('Format header: ' + e);
  }
}

/**
 * Peta posisi kolom header dinamis
 */
function getHeaderColumnMap(sheet) {
  try {
    const lastCol = Math.max(sheet.getLastColumn(), HEADERS_JURNAL.length);
    if (lastCol === 0) return null;
    const firstRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const map = {};
    for (let c = 0; c < firstRow.length; c++) {
      const key = String(firstRow[c] || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (key) {
        map[key] = c + 1; // 1-indexed column
      }
    }
    return map;
  } catch (e) {
    return null;
  }
}

/**
 * Inisialisasi Sheet otomatis jika belum ada
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    const sheets = ss.getSheets();
    // Jika hanya ada Sheet1 default yang masih kosong, ubah namanya jadi Jurnal_15_Hari
    if (sheets.length === 1 && sheets[0].getLastRow() <= 1 && sheets[0].getName().toLowerCase().includes('sheet')) {
      sheet = sheets[0];
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  // Pastikan baris header ada
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS_JURNAL);
    formatHeaderRow(sheet, HEADERS_JURNAL.length, '#10b981');
  } else {
    // Cek apakah baris 1 kosong
    const lastCol = Math.max(sheet.getLastColumn(), 1);
    const row1 = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const isRow1Empty = row1.every(function(cell) { return String(cell).trim() === ''; });
    if (isRow1Empty) {
      sheet.getRange(1, 1, 1, HEADERS_JURNAL.length).setValues([HEADERS_JURNAL]);
      formatHeaderRow(sheet, HEADERS_JURNAL.length, '#10b981');
    }
  }

  return sheet;
}

/**
 * Handle HTTP GET Requests
 * Tes koneksi, membaca data (getAll, getGroup), atau menyimpan data via GET query
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

    // 4. Sinkronisasi via GET parameter (Fallback aman browser/CORS)
    if (action === 'syncDay' && params.data) {
      const payload = JSON.parse(params.data);
      const res = saveGroupJournal(payload.groupId, [payload.day || payload.dayData || payload]);
      return jsonResponse(res);
    }

    if (action === 'syncGroup' && params.data) {
      const payload = JSON.parse(params.data);
      const res = saveGroupJournal(payload.groupId, payload.days || [payload.day]);
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

    if (action === 'syncDay') {
      const groupId = parseInt(payload.groupId, 10);
      const day = payload.day || payload.dayData || {};
      const result = saveGroupJournal(groupId, [day]);
      return jsonResponse(result);
    }

    if (action === 'syncGroup') {
      const groupId = parseInt(payload.groupId, 10);
      const days = payload.days || (payload.day ? [payload.day] : []);
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
 * Simpan data pengamatan 15 hari untuk 1 kelompok (atau single day)
 * Menjamin tinggi tanaman tercatat akurat baik format angka maupun desimal koma/titik.
 */
function saveGroupJournal(groupId, days) {
  const sheet = getOrCreateSheet();
  const lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    const groupInfo = DATA_KELOMPOK[groupId] || { nama: 'Kelompok ' + groupId, anggota: '-' };
    const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const colMap = getHeaderColumnMap(sheet);
    
    // Temukan index kolom kunci jika ada
    const colKelompokIdx = (colMap && (colMap['kelompokid'] || colMap['idkelompok'] || colMap['kelompok'])) ? (colMap['kelompokid'] || colMap['idkelompok'] || colMap['kelompok']) - 1 : 1;
    const colHariIdx = (colMap && (colMap['harike'] || colMap['hari'])) ? (colMap['harike'] || colMap['hari']) - 1 : 3;

    // Map untuk mencari baris berdasarkan "KelompokID_HariKe" dengan ekstraksi angka yang toleran
    const rowMap = {};
    for (let r = 1; r < values.length; r++) {
      const rawG = values[r][colKelompokIdx];
      const rawH = values[r][colHariIdx];
      const normG = extractDigits(rawG);
      const normH = extractDigits(rawH);
      if (normG && normH) {
        rowMap[normG + '_' + normH] = r + 1; // 1-indexed baris sheet
      }
    }

    const dayList = Array.isArray(days) ? days : Object.keys(days || {}).map(function(k) { return days[k]; });

    dayList.forEach(function (day) {
      const dayNum = extractDigits(day.dayNumber) || 1;
      const key = groupId + '_' + dayNum;
      
      // Ambil tinggi kangkung dengan fungsi parsePlantHeight yang toleran koma dan teks
      const height = extractDayHeight(day);
      const condition = day.condition || '';
      const emoji = day.conditionEmoji || '';
      const notes = day.notes || '';
      const dateVal = day.date || '';
      const daunBaru = day.hasNewLeaves ? 'YA' : 'TIDAK';
      const bertambahTinggi = day.grewTaller ? 'YA' : 'TIDAK';
      const daunHijau = day.greenLeaves ? 'YA' : 'TIDAK';
      const segar = day.looksFresh ? 'YA' : 'TIDAK';
      const daunKuning = day.hasYellowLeaves ? 'YA' : 'TIDAK';
      const status = height !== '' ? 'Lengkap ⭐ (' + height + ' cm)' : (condition ? 'Tercatat' : 'Belum diisi');

      const fieldValues = {
        'timestamp': nowStr,
        'kelompokid': groupId,
        'namakelompok': groupInfo.nama,
        'harike': dayNum,
        'tanggal': dateVal,
        'tinggicm': height,
        'kondisi': condition,
        'emoji': emoji,
        'catatanpengamatan': notes,
        'daunbaru': daunBaru,
        'bertambahtinggi': bertambahTinggi,
        'daunhijau': daunHijau,
        'segar': segar,
        'daunkuning': daunKuning,
        'anggotakelompok': groupInfo.anggota,
        'status': status
      };

      // Buat array baris sesuai kolom spreadsheet yang ada
      let rowData;
      if (colMap && Object.keys(colMap).length >= 5) {
        const numCols = Math.max(sheet.getLastColumn(), HEADERS_JURNAL.length);
        rowData = new Array(numCols).fill('');
        
        // Isikan nilai default dari array standar
        const defaultArr = [
          nowStr, groupId, groupInfo.nama, dayNum, dateVal, height,
          condition, emoji, notes, daunBaru, bertambahTinggi, daunHijau,
          segar, daunKuning, groupInfo.anggota, status
        ];
        for (let i = 0; i < defaultArr.length && i < numCols; i++) {
          rowData[i] = defaultArr[i];
        }

        // Terapkan kolom yang terpetakan secara spesifik
        if (colMap['tinggicm']) rowData[colMap['tinggicm'] - 1] = height;
        else if (colMap['tinggi']) rowData[colMap['tinggi'] - 1] = height;
        else if (colMap['heightcm']) rowData[colMap['heightcm'] - 1] = height;

        if (colMap['kelompokid']) rowData[colMap['kelompokid'] - 1] = groupId;
        if (colMap['namakelompok']) rowData[colMap['namakelompok'] - 1] = groupInfo.nama;
        if (colMap['harike']) rowData[colMap['harike'] - 1] = dayNum;
        if (colMap['tanggal']) rowData[colMap['tanggal'] - 1] = dateVal;
        if (colMap['kondisi']) rowData[colMap['kondisi'] - 1] = condition;
        if (colMap['emoji']) rowData[colMap['emoji'] - 1] = emoji;
        if (colMap['catatanpengamatan']) rowData[colMap['catatanpengamatan'] - 1] = notes;
        if (colMap['status']) rowData[colMap['status'] - 1] = status;
      } else {
        rowData = [
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
      }

      if (rowMap[key]) {
        // Update baris yang sudah ada
        const targetRow = rowMap[key];
        sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
      } else {
        // Tambahkan baris baru
        sheet.appendRow(rowData);
        rowMap[key] = sheet.getLastRow();
      }
    });

    return {
      status: 'success',
      message: 'Berhasil menyimpan jurnal pengamatan ' + groupInfo.nama + '! (Tinggi tanaman tercatat ke Google Sheets)',
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
  const colMap = getHeaderColumnMap(sheet);
  const result = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  const dayMaps = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} };

  const colKelompokIdx = (colMap && (colMap['kelompokid'] || colMap['idkelompok'] || colMap['kelompok'])) ? (colMap['kelompokid'] || colMap['idkelompok'] || colMap['kelompok']) - 1 : 1;
  const colHariIdx = (colMap && (colMap['harike'] || colMap['hari'])) ? (colMap['harike'] || colMap['hari']) - 1 : 3;
  const colTinggiIdx = (colMap && (colMap['tinggicm'] || colMap['tinggi'] || colMap['heightcm'])) ? (colMap['tinggicm'] || colMap['tinggi'] || colMap['heightcm']) - 1 : 5;
  const colTglIdx = (colMap && (colMap['tanggal'] || colMap['tgl'] || colMap['date'])) ? (colMap['tanggal'] || colMap['tgl'] || colMap['date']) - 1 : 4;
  const colKondisiIdx = (colMap && colMap['kondisi']) ? colMap['kondisi'] - 1 : 6;
  const colEmojiIdx = (colMap && colMap['emoji']) ? colMap['emoji'] - 1 : 7;
  const colCatatanIdx = (colMap && (colMap['catatanpengamatan'] || colMap['catatan'])) ? (colMap['catatanpengamatan'] || colMap['catatan']) - 1 : 8;
  const colDaunBaruIdx = (colMap && colMap['daunbaru']) ? colMap['daunbaru'] - 1 : 9;
  const colTinggiBaruIdx = (colMap && colMap['bertambahtinggi']) ? colMap['bertambahtinggi'] - 1 : 10;
  const colDaunHijauIdx = (colMap && colMap['daunhijau']) ? colMap['daunhijau'] - 1 : 11;
  const colSegarIdx = (colMap && colMap['segar']) ? colMap['segar'] - 1 : 12;
  const colKuningIdx = (colMap && colMap['daunkuning']) ? colMap['daunkuning'] - 1 : 13;

  // Mulai dari baris 2 (melewati header)
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const gId = extractDigits(row[colKelompokIdx]);
    const dayNum = extractDigits(row[colHariIdx]);

    if (gId >= 1 && gId <= 5 && dayNum >= 1 && dayNum <= 15) {
      const heightVal = parsePlantHeight(row[colTinggiIdx]);
      const dateVal = row[colTglIdx];

      dayMaps[gId][dayNum] = {
        dayNumber: dayNum,
        label: 'Hari ' + dayNum,
        date: dateVal ? String(dateVal).split('T')[0] : '',
        heightCm: heightVal,
        condition: String(row[colKondisiIdx] || ''),
        conditionEmoji: String(row[colEmojiIdx] || ''),
        notes: String(row[colCatatanIdx] || ''),
        hasNewLeaves: row[colDaunBaruIdx] === 'YA',
        grewTaller: row[colTinggiBaruIdx] === 'YA',
        greenLeaves: row[colDaunHijauIdx] === 'YA',
        looksFresh: row[colSegarIdx] === 'YA',
        hasYellowLeaves: row[colKuningIdx] === 'YA'
      };
    }
  }

  // Bentuk array terurut 15 hari untuk tiap kelompok
  for (let g = 1; g <= 5; g++) {
    for (let d = 1; d <= 15; d++) {
      if (dayMaps[g][d]) {
        result[g].push(dayMaps[g][d]);
      } else {
        result[g].push({
          dayNumber: d,
          label: 'Hari ' + d,
          date: '',
          heightCm: '',
          condition: '',
          conditionEmoji: '',
          notes: '',
          hasNewLeaves: false,
          grewTaller: false,
          greenLeaves: false,
          looksFresh: false,
          hasYellowLeaves: false
        });
      }
    }
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
