/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'panitia' | 'dkm';

export interface User {
  id: string;
  nama: string;
  username: string;
  role: UserRole;
}

export interface Muzakki {
  id: string;
  nama: string; // Nama Kepala Keluarga
  alamat: string;
  rt: string;
  rw: string;
  no_hp: string;
  jumlah_jiwa: number;
}

export interface Transaksi {
  id: string; // Nomor Transaksi (e.g. TX-2026-0001)
  muzakki_id: string;
  muzakki_nama: string; // Denormalized for convenience
  jumlah_jiwa: number;
  jenis: 'beras' | 'uang' | 'campuran';
  nominal: number; // 0 if beras
  beras_liter: number; // 3.5 * jumlah_jiwa
  infaq?: number; // Infaq Sukarela / Sedekah (Rp)
  metode_pembayaran?: 'Tunai' | 'QRIS' | 'Transfer';
  bukti_pembayaran?: string; // Base64 or mock image url
  tanggal: string; // YYYY-MM-DD
  petugas: string;
  status: 'Valid' | 'Tertunda';
}

export type MustahikKategori = 'Fakir' | 'Miskin' | 'Amil' | 'Muallaf' | 'Gharim' | 'Fisabilillah' | 'Ibnu Sabil';

export interface Mustahik {
  id: string;
  nama: string;
  alamat: string;
  rt: string;
  rw: string;
  kategori: MustahikKategori;
  jumlah_anggota_keluarga: number;
  status_verifikasi: 'Terverifikasi' | 'Belum Terverifikasi';
}

export interface Distribusi {
  id: string; // Nomor Distribusi (e.g. DS-2026-0001)
  mustahik_id: string;
  mustahik_nama: string; // Denormalized for convenience
  kategori: MustahikKategori;
  beras_liter: number;
  uang: number;
  tanggal: string;
  petugas: string;
  keterangan: string;
}

export interface AppState {
  users: User[];
  muzakkis: Muzakki[];
  transaksis: Transaksi[];
  mustahiks: Mustahik[];
  distribusis: Distribusi[];
  hargaBerasPerLiter: number; // Default: Rp 12.000
  gasWebappUrl: string; // Google Apps Script Web App URL for sync
  namaMasjid?: string;
  alamatMasjid?: string;
  kontakMasjid?: string;
}
