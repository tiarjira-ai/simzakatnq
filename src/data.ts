/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppState, User, Muzakki, Transaksi, Mustahik, Distribusi } from './types';

export const SEED_USERS: User[] = [
  { id: 'usr-1', nama: 'Andi Pratama', username: 'admin', role: 'admin' },
  { id: 'usr-2', nama: 'Siti Rahma', username: 'panitia', role: 'panitia' },
  { id: 'usr-3', nama: 'H. Andi Ahmad (DKM)', username: 'ketua', role: 'dkm' }
];

export const SEED_MUZAKKIS: Muzakki[] = [
  { id: 'muz-1', nama: 'Bpk. H. Syamsuddin', alamat: 'Jl. Poros Pakkanrebete No. 12', rt: '01', rw: '02', no_hp: '081234567890', jumlah_jiwa: 4 },
  { id: 'muz-2', nama: 'Ibu Hjh. Aminah', alamat: 'Jl. Andi Merdeka Gg. 3', rt: '02', rw: '02', no_hp: '082345678901', jumlah_jiwa: 3 },
  { id: 'muz-3', nama: 'Bpk. Rusli Wahyudi', alamat: 'Jl. Melati Samping Masjid', rt: '01', rw: '01', no_hp: '085234567892', jumlah_jiwa: 5 },
  { id: 'muz-4', nama: 'Bpk. Kamaruddin', alamat: 'Jl. Pemuda No. 45', rt: '03', rw: '01', no_hp: '087843219087', jumlah_jiwa: 2 },
  { id: 'muz-5', nama: 'Ibu Nurhayati', alamat: 'Jl. Cendrawasih No. 8', rt: '02', rw: '01', no_hp: '081198765432', jumlah_jiwa: 6 }
];

export const SEED_TRANSAKSIS: Transaksi[] = [
  {
    id: 'TX-2026-0001',
    muzakki_id: 'muz-1',
    muzakki_nama: 'Bpk. H. Syamsuddin',
    jumlah_jiwa: 4,
    jenis: 'beras',
    nominal: 0,
    beras_liter: 14, // 4 * 3.5
    infaq: 20000,
    tanggal: '2026-07-14',
    petugas: 'Siti Rahma',
    status: 'Valid'
  },
  {
    id: 'TX-2026-0002',
    muzakki_id: 'muz-2',
    muzakki_nama: 'Ibu Hjh. Aminah',
    jumlah_jiwa: 3,
    jenis: 'uang',
    nominal: 126000, // 3 * 3.5 * 12000
    beras_liter: 10.5,
    infaq: 10000,
    metode_pembayaran: 'Tunai',
    tanggal: '2026-07-15',
    petugas: 'Siti Rahma',
    status: 'Valid'
  },
  {
    id: 'TX-2026-0003',
    muzakki_id: 'muz-3',
    muzakki_nama: 'Bpk. Rusli Wahyudi',
    jumlah_jiwa: 5,
    jenis: 'uang',
    nominal: 210000, // 5 * 3.5 * 12000
    beras_liter: 17.5,
    infaq: 50000,
    metode_pembayaran: 'QRIS',
    tanggal: '2026-07-16',
    petugas: 'Andi Pratama',
    status: 'Valid'
  },
  {
    id: 'TX-2026-0004',
    muzakki_id: 'muz-4',
    muzakki_nama: 'Bpk. Kamaruddin',
    jumlah_jiwa: 2,
    jenis: 'beras',
    nominal: 0,
    beras_liter: 7, // 2 * 3.5
    infaq: 0,
    tanggal: '2026-07-16',
    petugas: 'Siti Rahma',
    status: 'Valid'
  }
];

export const SEED_MUSTAHIKS: Mustahik[] = [
  { id: 'mus-1', nama: 'Daeng Naba', alamat: 'Samping Sawah RT 03 Pakkanrebete', rt: '03', rw: '01', kategori: 'Fakir', jumlah_anggota_keluarga: 5, status_verifikasi: 'Terverifikasi' },
  { id: 'mus-2', nama: 'Ibu Sitti Mariam', alamat: 'Belakang Pasar Pakkanrebete', rt: '01', rw: '02', kategori: 'Miskin', jumlah_anggota_keluarga: 4, status_verifikasi: 'Terverifikasi' },
  { id: 'mus-3', nama: 'Pak Herman Tato', alamat: 'Jl. Veteran No. 15', rt: '02', rw: '01', kategori: 'Miskin', jumlah_anggota_keluarga: 6, status_verifikasi: 'Terverifikasi' },
  { id: 'mus-4', nama: 'Ustadz Mansur', alamat: 'Perumahan Guru Agama', rt: '01', rw: '01', kategori: 'Amil', jumlah_anggota_keluarga: 3, status_verifikasi: 'Terverifikasi' },
  { id: 'mus-5', nama: 'Sdr. Yusuf (Mualaf Baru)', alamat: 'Jl. Merak No. 4', rt: '02', rw: '02', kategori: 'Muallaf', jumlah_anggota_keluarga: 1, status_verifikasi: 'Terverifikasi' },
  { id: 'mus-6', nama: 'Nenek Ramlah', alamat: 'Gubuk RT 03 RW 02', rt: '03', rw: '02', kategori: 'Fakir', jumlah_anggota_keluarga: 2, status_verifikasi: 'Belum Terverifikasi' }
];

export const SEED_DISTRIBUSIS: Distribusi[] = [
  {
    id: 'DS-2026-0001',
    mustahik_id: 'mus-1',
    mustahik_nama: 'Daeng Naba',
    kategori: 'Fakir',
    beras_liter: 15,
    uang: 100000,
    tanggal: '2026-07-16',
    petugas: 'Andi Pratama',
    keterangan: 'Distribusi pokok ramadhan fakir'
  },
  {
    id: 'DS-2026-0002',
    mustahik_id: 'mus-2',
    mustahik_nama: 'Ibu Sitti Mariam',
    kategori: 'Miskin',
    beras_liter: 10,
    uang: 75000,
    tanggal: '2026-07-16',
    petugas: 'Siti Rahma',
    keterangan: 'Penyaluran zakat miskin'
  }
];

export const DEFAULT_STATE: AppState = {
  users: SEED_USERS,
  muzakkis: SEED_MUZAKKIS,
  transaksis: SEED_TRANSAKSIS,
  mustahiks: SEED_MUSTAHIKS,
  distribusis: SEED_DISTRIBUSIS,
  hargaBerasPerLiter: 12000,
  gasWebappUrl: '',
  namaMasjid: 'Masjid Nurul Qalam',
  alamatMasjid: 'Pakkanrebete, Kabupaten Soppeng, Sulawesi Selatan'
};

const LOCAL_STORAGE_KEY = 'zakat_fitrah_app_state';

export function loadState(): AppState {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all fields are present
      return {
        ...DEFAULT_STATE,
        ...parsed
      };
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return DEFAULT_STATE;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function generateTransactionId(existing: Transaksi[]): string {
  const year = new Date().getFullYear();
  const prefix = `TX-${year}-`;
  
  // Find highest serial number
  let maxSerial = 0;
  existing.forEach(tx => {
    if (tx.id.startsWith(prefix)) {
      const parts = tx.id.split('-');
      const serial = parseInt(parts[2], 10);
      if (!isNaN(serial) && serial > maxSerial) {
        maxSerial = serial;
      }
    }
  });
  
  const nextSerial = String(maxSerial + 1).padStart(4, '0');
  return `${prefix}${nextSerial}`;
}

export function generateDistributionId(existing: Distribusi[]): string {
  const year = new Date().getFullYear();
  const prefix = `DS-${year}-`;
  
  // Find highest serial number
  let maxSerial = 0;
  existing.forEach(ds => {
    if (ds.id.startsWith(prefix)) {
      const parts = ds.id.split('-');
      const serial = parseInt(parts[2], 10);
      if (!isNaN(serial) && serial > maxSerial) {
        maxSerial = serial;
      }
    }
  });
  
  const nextSerial = String(maxSerial + 1).padStart(4, '0');
  return `${prefix}${nextSerial}`;
}

export function calculateZakat(jumlahJiwa: number, jenis: 'beras' | 'uang', hargaBeras: number) {
  const berasLiter = jumlahJiwa * 3.5;
  const nominal = jenis === 'uang' ? berasLiter * hargaBeras : 0;
  return {
    berasLiter,
    nominal
  };
}
