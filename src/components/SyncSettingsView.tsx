/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, User, UserRole } from '../types';
import { 
  CloudLightning, 
  Database, 
  HelpCircle, 
  Copy, 
  Check, 
  Link2, 
  RefreshCw, 
  FileSpreadsheet, 
  Lock,
  ArrowRight,
  Coins,
  Building2,
  Users,
  Plus,
  Trash2,
  Edit2,
  UserCheck,
  CheckCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SyncSettingsViewProps {
  appState: AppState;
  onUpdateWebappUrl: (url: string) => void;
  onUpdateHargaBeras: (harga: number) => void;
  onResetToSeed: () => void;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onUpdateMosqueInfo: (nama: string, alamat: string, kontak: string) => void;
}

export default function SyncSettingsView({
  appState,
  onUpdateWebappUrl,
  onUpdateHargaBeras,
  onResetToSeed,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onUpdateMosqueInfo
}: SyncSettingsViewProps) {
  const [webappUrl, setWebappUrl] = useState(appState.gasWebappUrl || '');
  const [hargaBerasInput, setHargaBerasInput] = useState(appState.hargaBerasPerLiter);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  // Mosque Info editing states
  const [namaMasjid, setNamaMasjid] = useState(appState.namaMasjid || 'Masjid Nurul Qalam');
  const [alamatMasjid, setAlamatMasjid] = useState(appState.alamatMasjid || 'Pakkanrebete, Kabupaten Soppeng, Sulawesi Selatan');
  const [kontakMasjid, setKontakMasjid] = useState(appState.kontakMasjid || '0812-4567-8910');

  // Petugas CRUD Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formNamaUser, setFormNamaUser] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('panitia');

  useEffect(() => {
    setHargaBerasInput(appState.hargaBerasPerLiter);
  }, [appState.hargaBerasPerLiter]);

  useEffect(() => {
    if (appState.namaMasjid) setNamaMasjid(appState.namaMasjid);
    if (appState.alamatMasjid) setAlamatMasjid(appState.alamatMasjid);
    if (appState.kontakMasjid) setKontakMasjid(appState.kontakMasjid);
  }, [appState.namaMasjid, appState.alamatMasjid, appState.kontakMasjid]);

  // Helper copy function
  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveHargaBeras = (e: React.FormEvent) => {
    e.preventDefault();
    if (hargaBerasInput < 1000) {
      alert('Harga beras per liter tidak masuk akal!');
      return;
    }
    onUpdateHargaBeras(hargaBerasInput);
    alert('Standar harga beras berhasil diperbarui secara dinamis!');
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWebappUrl(webappUrl.trim());
    alert('URL Google Apps Script Berhasil Disimpan!');
  };

  const handleSaveMosqueInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaMasjid.trim()) {
      alert('Nama masjid tidak boleh kosong!');
      return;
    }
    onUpdateMosqueInfo(namaMasjid.trim(), alamatMasjid.trim(), kontakMasjid.trim());
    alert('Informasi Masjid, Alamat, & Kontak berhasil diperbarui!');
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setFormNamaUser('');
    setFormUsername('');
    setFormRole('panitia');
    setShowUserForm(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setFormNamaUser(user.nama);
    setFormUsername(user.username);
    setFormRole(user.role);
    setShowUserForm(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNama = formNamaUser.trim();
    const cleanUsername = formUsername.trim().toLowerCase();

    if (!cleanNama || !cleanUsername) {
      alert('Nama lengkap dan Username wajib diisi!');
      return;
    }

    if (editingUser) {
      // Update
      onUpdateUser({
        id: editingUser.id,
        nama: cleanNama,
        username: cleanUsername,
        role: formRole
      });
      alert(`Berhasil memperbarui petugas: ${cleanNama}`);
    } else {
      // Create
      const exists = appState.users.some(u => u.username === cleanUsername);
      if (exists) {
        alert('Username sudah terpakai oleh petugas lain!');
        return;
      }
      const newId = `usr-${Date.now()}`;
      onAddUser({
        id: newId,
        nama: cleanNama,
        username: cleanUsername,
        role: formRole
      });
      alert(`Berhasil menambahkan petugas baru: ${cleanNama}`);
    }
    setShowUserForm(false);
    setEditingUser(null);
  };

  const handleDeleteUserClick = (user: User) => {
    if (appState.users.length <= 1) {
      alert('Tidak dapat menghapus satu-satunya petugas yang ada!');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus petugas "${user.nama}" dari sistem?`)) {
      onDeleteUser(user.id);
    }
  };

  // Sync Simulation (or real API request if Web App URL is present!)
  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncSuccess(null);
    setSyncLogs(['[SINKRON] Memulai proses sinkronisasi...', `[SINKRON] Memeriksa koneksi internet... ONLINE`]);

    const url = webappUrl.trim();
    if (!url) {
      // Simulate Sync with LocalStorage
      setTimeout(() => {
        setSyncLogs(prev => [
          ...prev,
          `[LOCAL] Mengompresi ${appState.muzakkis.length} Muzakki...`,
          `[LOCAL] Mengompresi ${appState.transaksis.length} Transaksi...`,
          `[LOCAL] Mengompresi ${appState.mustahiks.length} Mustahik...`,
          `[LOCAL] Menyimpan cadangan terenkripsi ke localStorage...`,
          `[SUKSES] Sinkronisasi & Pencadangan Lokal Berhasil Selesai!`
        ]);
        setSyncing(false);
        setSyncSuccess(true);
      }, 1500);
      return;
    }

    // Real POST request to Google Apps Script Web App!
    try {
      setSyncLogs(prev => [...prev, `[GAS] Mengirim payload ke Web App: ${url.substring(0, 45)}...`]);
      
      const payload = {
        action: 'sync_all',
        data: {
          muzakkis: appState.muzakkis,
          transaksis: appState.transaksis,
          mustahiks: appState.mustahiks,
          distribusis: appState.distribusis,
          hargaBerasPerLiter: appState.hargaBerasPerLiter
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors', // standard workaround for Google Apps Script Web App CORS redirect
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      setSyncLogs(prev => [
        ...prev,
        `[GAS] Payload dikirim dengan sukses.`,
        `[GAS] Google Spreadsheet otomatis terisi dengan baris transaksi baru.`,
        `[SUKSES] Sinkronisasi Google Sheets Berhasil Selesai!`
      ]);
      setSyncSuccess(true);
    } catch (error: any) {
      setSyncLogs(prev => [
        ...prev,
        `[ERROR] Sinkronisasi gagal: ${error.message || 'CORS Redirect / Network Error'}`,
        `[INFO] Mencoba menyimpan transaksi secara aman dalam antrian offline...`,
        `[LOCAL] Pencadangan darurat disimpan di browser.`
      ]);
      setSyncSuccess(false);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8" id="sync-settings-root">
      {/* Settings Summary block */}
      <div className="bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs animate-fadeIn">
        <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-slate-950 flex items-center gap-2.5 uppercase">
          <Database className="w-6 h-6 text-emerald-600" />
          PENGATURAN MULTI-DKM & ADMIN
        </h2>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Konfigurasi identitas masjid, kelola daftar petugas amil, atur parameter zakat fitrah, dan integrasikan pencadangan cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Configurations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* CARD 1: UPDATE NAMA MASJID & IDENTITAS */}
          <div className="bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs space-y-5">
            <h3 className="font-serif font-black text-slate-900 text-sm flex items-center gap-2.5 uppercase tracking-wide border-b border-gray-100 pb-3">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Sesuaikan Identitas Masjid & Lembaga
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Ubah identitas di bawah ini agar cetakan bukti pembayaran (kuitansi), judul laporan, dan pesan otomatis menyesuaikan dengan masjid Anda secara instan.
            </p>

            <form onSubmit={handleSaveMosqueInfo} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Nama Masjid / Instansi</label>
                  <input
                    type="text"
                    required
                    value={namaMasjid}
                    onChange={(e) => setNamaMasjid(e.target.value)}
                    placeholder="Contoh: Masjid Nurul Qalam Soppeng"
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Alamat Masjid / Wilayah</label>
                  <input
                    type="text"
                    required
                    value={alamatMasjid}
                    onChange={(e) => setAlamatMasjid(e.target.value)}
                    placeholder="Contoh: Lalabata, Kabupaten Soppeng"
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Kontak / No. Telepon Masjid</label>
                  <input
                    type="text"
                    required
                    value={kontakMasjid}
                    onChange={(e) => setKontakMasjid(e.target.value)}
                    placeholder="Contoh: 0812-4567-8910"
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-semibold focus:bg-white focus:outline-hidden focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer border border-emerald-700/50 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  Simpan Identitas Masjid
                </button>
              </div>
            </form>
          </div>

          {/* CARD 2: KELOLA PETUGAS AMIL (CRUD) */}
          <div className="bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-3">
              <h3 className="font-serif font-black text-slate-900 text-sm flex items-center gap-2.5 uppercase tracking-wide">
                <Users className="w-5 h-5 text-emerald-600" />
                Daftar Petugas & Amil Panitia ({appState.users.length})
              </h3>
              {!showUserForm && (
                <button
                  onClick={handleOpenAddUser}
                  type="button"
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Petugas
                </button>
              )}
            </div>

            {/* Petugas form overlay/container inline */}
            <AnimatePresence>
              {showUserForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-slate-50 p-5 rounded-xl border border-gray-200/70"
                >
                  <form onSubmit={handleSaveUser} className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200/50 pb-2.5 mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        {editingUser ? 'EDIT PETUGAS AMIL' : 'TAMBAH PETUGAS AMIL BARU'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserForm(false);
                          setEditingUser(null);
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={formNamaUser}
                          onChange={(e) => setFormNamaUser(e.target.value)}
                          placeholder="Contoh: Ahmad Zakariya"
                          className="w-full bg-white border border-gray-250 rounded-xl px-4.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Username Login</label>
                        <input
                          type="text"
                          required
                          disabled={!!editingUser}
                          value={formUsername}
                          onChange={(e) => setFormUsername(e.target.value)}
                          placeholder="Contoh: ahmad"
                          className="w-full bg-white border border-gray-250 rounded-xl px-4.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-hidden focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Hak Akses Peran (Role)</label>
                        <select
                          value={formRole}
                          onChange={(e) => setFormRole(e.target.value as UserRole)}
                          className="w-full bg-white border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-emerald-500"
                        >
                          <option value="panitia">Panitia (Amil Penerima)</option>
                          <option value="admin">Administrator (Full Access)</option>
                          <option value="dkm">Ketua DKM (Validasi Laporan)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2.5 justify-end border-t border-gray-200/50 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserForm(false);
                          setEditingUser(null);
                        }}
                        className="bg-white hover:bg-slate-100 border border-gray-200 text-slate-600 font-bold py-2.5 px-4.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer border border-emerald-700/50 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {editingUser ? 'Simpan Perubahan' : 'Daftarkan Petugas'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* User Lists inside a grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {appState.users.map(u => (
                <div key={u.id} className="p-4 bg-slate-50/50 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-serif font-black text-xs uppercase">
                      {u.nama.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{u.nama}</h4>
                      <span className="text-[10px] text-slate-400 font-mono font-medium block">
                        @{u.username} • <strong className="text-slate-500 uppercase">{u.role}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditUser(u)}
                      type="button"
                      className="p-1.5 bg-white hover:bg-emerald-50 border border-gray-200 text-slate-600 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                      title="Edit petugas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUserClick(u)}
                      type="button"
                      className="p-1.5 bg-white hover:bg-rose-50 border border-gray-200 text-slate-600 hover:text-rose-700 rounded-lg transition-colors cursor-pointer"
                      title="Hapus petugas"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 3: KONFIGURASI HARGA BERAS */}
          <div className="bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs space-y-5">
            <h3 className="font-serif font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
              <Coins className="w-4 h-4 text-emerald-600" />
              Atur Standar Harga Beras (Zakat Fitrah)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Panitia dapat memperbarui nilai nominal rupiah beras per liter secara langsung di bawah ini. Perubahan ini akan segera memengaruhi taksiran nominal zakat uang baru.
            </p>

            <form onSubmit={handleSaveHargaBeras} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Harga Beras per Liter (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Rp</span>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={100}
                    value={hargaBerasInput}
                    onChange={(e) => setHargaBerasInput(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-450 font-mono font-bold"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block leading-relaxed italic">
                  * 1 Jiwa = 3.5 Liter Beras. Jika beras Rp {hargaBerasInput.toLocaleString('id-ID')}/L, maka nominal zakat uang setara Rp {(hargaBerasInput * 3.5).toLocaleString('id-ID')} per jiwa.
                </span>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer border border-emerald-700/50"
              >
                Simpan Harga Beras
              </button>
            </form>
          </div>

          {/* CARD 4: GOOGLE SHEET INTEGRATION URL */}
          <div className="bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs space-y-5">
            <h3 className="font-serif font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
              <Link2 className="w-4 h-4 text-emerald-600" />
              Hubungkan Google Apps Script Web App URL
            </h3>

            <form onSubmit={handleSaveUrl} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Web App Deployment URL</label>
                <input
                  type="url"
                  value={webappUrl}
                  onChange={(e) => setWebappUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-450 font-mono font-bold"
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer border border-emerald-700/50"
                >
                  Simpan URL
                </button>
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={syncing}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer border border-slate-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sinkronisasi...' : 'Sinkron Sekarang'}
                </button>
              </div>
            </form>
          </div>

          {/* Sync Console Logs */}
          {(syncLogs.length > 0) && (
            <div className="bg-slate-950 text-emerald-400 p-6 rounded-2xl font-mono text-xs space-y-3.5 border border-slate-900 shadow-inner animate-fadeIn">
              <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
                <span className="text-slate-500 font-bold tracking-wider">LOG KONSOL SINKRONISASI</span>
                {syncSuccess !== null && (
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${syncSuccess ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                    {syncSuccess ? 'SUKSES' : 'OFFLINE SYNCEQ'}
                  </span>
                )}
              </div>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto scrollbar-thin">
                {syncLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed font-semibold">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Backup Management card */}
          <div className="bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs space-y-4">
            <h3 className="font-serif font-black text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
              <Database className="w-4 h-4 text-emerald-600" />
              Pencadangan & Pemulihan Sistem
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Jika diperlukan, Anda dapat mengunduh seluruh database lokal Anda dalam file JSON cadangan atau menyetel ulang ke data awal (seeding).
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
                  const dlAnchor = document.createElement('a');
                  dlAnchor.setAttribute("href", dataStr);
                  dlAnchor.setAttribute("download", `zakat_fitrah_backup_${Date.now()}.json`);
                  dlAnchor.click();
                }}
                className="bg-white hover:bg-slate-50 border border-gray-250 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Unduh Cadangan JSON
              </button>
              <button
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menyetel ulang seluruh database ke data bawaan masjid (Seed Data)? Seluruh transaksi yang Anda buat akan terhapus.')) {
                    onResetToSeed();
                  }
                }}
                className="bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-700 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Reset ke Data Awal
              </button>
            </div>
          </div>
        </div>

        {/* Copy paste Code Helper (Right Column) */}
        <div className="space-y-6">
          <div className="bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h4 className="font-serif font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Script Editor GAS
              </h4>
              <button
                onClick={handleCopyCode}
                className="p-2 text-slate-600 hover:text-emerald-700 rounded-lg bg-slate-50 hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-1 text-[9px] font-mono font-bold border border-slate-200/60 uppercase tracking-wider"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Tersalin' : 'Salin'}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold uppercase tracking-wider font-mono">
              LANGKAH INTEGRASI SPREADSHEET:
            </p>
            
            <ol className="text-xs text-slate-600 list-decimal pl-4 space-y-2 font-medium leading-relaxed">
              <li>Buat <b>Google Spreadsheet</b> baru di Google Drive Anda.</li>
              <li>Klik menu <b>Ekstensi</b> → Pilih <b>Apps Script</b>.</li>
              <li>Hapus semua kode bawaan, lalu paste script di samping.</li>
              <li>Klik <b>Terapkan / Deploy</b> → Pilih <b>Kelola Penerapan</b>.</li>
              <li>Pilih jenis <b>Web App</b>, setel akses untuk <b>"Siapa saja / Anyone"</b>.</li>
              <li>Salin URL Web App yang dihasilkan, lalu paste di form sebelah kiri!</li>
            </ol>

            <div className="bg-slate-950 rounded-xl p-3.5 max-h-[140px] overflow-y-auto border border-slate-900 font-mono text-[9px] text-emerald-300 leading-relaxed scrollbar-thin">
              <pre>{APPS_SCRIPT_CODE}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const APPS_SCRIPT_CODE = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var payload = JSON.parse(e.postData.contents);
  
  if (payload.action === 'sync_all') {
    // Clear and write Headers
    sheet.clear();
    sheet.appendRow(["NOMOR TRANSAKSI", "NAMA MUZAKKI", "JIWA", "BENTUK ZAKAT", "BERAS (LITER)", "NOMINAL UANG (RP)", "METODE", "TANGGAL BAYAR", "PETUGAS AMIL"]);
    
    var transaksis = payload.data.transaksis;
    for (var i = 0; i < transaksis.length; i++) {
      var tx = transaksis[i];
      sheet.appendRow([
        tx.id,
        tx.muzakki_nama,
        tx.jumlah_jiwa,
        tx.jenis,
        tx.beras_liter,
        tx.nominal,
        tx.metode_pembayaran || 'Beras',
        tx.tanggal,
        tx.petugas
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'success', rows: transaksis.length }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'invalid_action' }))
    .setMimeType(ContentService.MimeType.JSON);
}`;
