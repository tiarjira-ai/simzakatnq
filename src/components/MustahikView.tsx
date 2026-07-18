/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mustahik, MustahikKategori, User } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  MapPin, 
  UserCheck, 
  Clock, 
  HeartHandshake,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MustahikViewProps {
  mustahiks: Mustahik[];
  currentUser: User;
  onAddMustahik: (mustahik: Mustahik) => void;
  onUpdateMustahik: (mustahik: Mustahik) => void;
  onDeleteMustahik: (id: string) => void;
  onToggleVerifikasi: (id: string) => void;
}

export default function MustahikView({
  mustahiks,
  currentUser,
  onAddMustahik,
  onUpdateMustahik,
  onDeleteMustahik,
  onToggleVerifikasi
}: MustahikViewProps) {
  // UI states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');

  // Form states
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [rt, setRt] = useState('01');
  const [rw, setRw] = useState('01');
  const [kategori, setKategori] = useState<MustahikKategori>('Fakir');
  const [jumlahKeluarga, setJumlahKeluarga] = useState(1);
  const [statusVerif, setStatusVerif] = useState<'Terverifikasi' | 'Belum Terverifikasi'>('Terverifikasi');

  const resetForm = () => {
    setNama('');
    setAlamat('');
    setRt('01');
    setRw('01');
    setKategori('Fakir');
    setJumlahKeluarga(1);
    setStatusVerif('Terverifikasi');
    setEditingId(null);
  };

  const handleEdit = (m: Mustahik) => {
    setEditingId(m.id);
    setNama(m.nama);
    setAlamat(m.alamat);
    setRt(m.rt);
    setRw(m.rw);
    setKategori(m.kategori);
    setJumlahKeluarga(m.jumlah_anggota_keluarga);
    setStatusVerif(m.status_verifikasi);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !alamat.trim() || jumlahKeluarga < 1) {
      alert('Mohon lengkapi seluruh kolom formulir Mustahik!');
      return;
    }

    if (editingId) {
      const updated: Mustahik = {
        id: editingId,
        nama: nama.trim(),
        alamat: alamat.trim(),
        rt,
        rw,
        kategori,
        jumlah_anggota_keluarga: jumlahKeluarga,
        status_verifikasi: statusVerif
      };
      onUpdateMustahik(updated);
    } else {
      const newMustahik: Mustahik = {
        id: `mus-${Date.now()}`,
        nama: nama.trim(),
        alamat: alamat.trim(),
        rt,
        rw,
        kategori,
        jumlah_anggota_keluarga: jumlahKeluarga,
        status_verifikasi: statusVerif
      };
      onAddMustahik(newMustahik);
    }

    resetForm();
    setShowForm(false);
  };

  // Filter & Search logic
  const filteredMustahiks = mustahiks.filter(m => {
    const matchesSearch = m.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.alamat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = filterKategori === 'Semua' || m.kategori === filterKategori;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6" id="mustahik-view-root">
      {/* Title header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-slate-950 flex items-center gap-2.5 uppercase">
            <HeartHandshake className="w-6 h-6 text-emerald-600" />
            PENDATAAN MUSTAHIK
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Daftar penerima zakat fitrah terdaftar berdasarkan asnaf (golongan penerima).
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              resetForm();
              setShowForm(false);
            } else {
              setShowForm(true);
            }
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer border border-emerald-700/50"
          id="btn-toggle-add-mustahik"
        >
          {showForm ? 'Batal Form' : 'Tambah Mustahik'}
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Form Card */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleSubmit}
              className="bg-white p-7 rounded-2xl border-2 border-emerald-600/80 shadow-xs space-y-6"
              id="form-mustahik"
            >
              <h3 className="font-serif font-black text-slate-950 text-base border-b border-gray-100 pb-3.5 flex items-center gap-2 uppercase tracking-wide">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                {editingId ? 'Edit Data Mustahik Penerima' : 'Pendaftaran Penerima Baru (Mustahik)'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Nama Mustahik */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Nama Penerima / Mustahik *</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Pak Daeng Naba"
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-semibold focus:bg-white"
                  />
                </div>

                {/* Kategori Asnaf */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Kategori Golongan (Asnaf) *</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as MustahikKategori)}
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-bold focus:bg-white"
                  >
                    <option value="Fakir">Fakir (Sangat Butuh)</option>
                    <option value="Miskin">Miskin (Kekurangan)</option>
                    <option value="Amil">Amil (Panitia Zakat)</option>
                    <option value="Muallaf">Muallaf (Baru Masuk Islam)</option>
                    <option value="Gharim">Gharim (Terlilit Hutang)</option>
                    <option value="Fisabilillah">Fisabilillah (Pejuang Agama)</option>
                    <option value="Ibnu Sabil">Ibnu Sabil (Musafir Habis Bekal)</option>
                  </select>
                </div>

                {/* Jumlah Anggota Keluarga */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Jumlah Tanggungan Keluarga *</label>
                  <div className="flex items-center bg-slate-50/50 border border-gray-250 rounded-xl px-2">
                    <button
                      type="button"
                      disabled={jumlahKeluarga <= 1}
                      onClick={() => setJumlahKeluarga(prev => prev - 1)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:bg-slate-200/50 rounded-lg disabled:opacity-40 transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-black text-slate-900 text-sm">{jumlahKeluarga} Jiwa</span>
                    <button
                      type="button"
                      onClick={() => setJumlahKeluarga(prev => prev + 1)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:bg-slate-200/50 rounded-lg transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Alamat */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Alamat Rumah Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                    placeholder="Contoh: Gubuk Samping Sawah RT 03"
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-semibold focus:bg-white"
                  />
                </div>

                {/* RT / RW */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">RT</label>
                    <select
                      value={rt}
                      onChange={(e) => setRt(e.target.value)}
                      className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-bold focus:bg-white"
                    >
                      {['01', '02', '03', '04', '05'].map(num => (
                        <option key={num} value={num}>RT {num}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">RW</label>
                    <select
                      value={rw}
                      onChange={(e) => setRw(e.target.value)}
                      className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-bold focus:bg-white"
                    >
                      {['01', '02', '03'].map(num => (
                        <option key={num} value={num}>RW {num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Status Survei / Verifikasi</label>
                  <div className="flex bg-slate-50 border border-gray-200 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setStatusVerif('Terverifikasi')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusVerif === 'Terverifikasi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Terverifikasi
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatusVerif('Belum Terverifikasi')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        statusVerif === 'Belum Terverifikasi' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Tunda Verif
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit / Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer flex items-center gap-2 border border-emerald-700/50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingId ? 'Simpan Perubahan' : 'Daftarkan Mustahik'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mustahik list & filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150/70 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari penerima atau alamat..."
              className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 transition font-semibold"
            />
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-bold focus:outline-hidden focus:border-slate-400 cursor-pointer"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Fakir">Fakir</option>
              <option value="Miskin">Miskin</option>
              <option value="Amil">Amil</option>
              <option value="Muallaf">Muallaf</option>
              <option value="Gharim">Gharim</option>
              <option value="Fisabilillah">Fisabilillah</option>
              <option value="Ibnu Sabil">Ibnu Sabil</option>
            </select>
          </div>
        </div>

        {/* Directory List Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfcfb] text-slate-500 text-[10px] font-mono font-bold tracking-widest uppercase border-b border-gray-200">
                <th className="py-3.5 px-4">Nama Penerima (Mustahik)</th>
                <th className="py-3.5 px-4">Kategori (Asnaf)</th>
                <th className="py-3.5 px-4">Alamat Rumah</th>
                <th className="py-3.5 px-4 text-center">Tanggungan Jiwa</th>
                <th className="py-3.5 px-4 text-center">Verifikasi</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-sm text-slate-900 font-medium">
              {filteredMustahiks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-xs font-mono font-bold">
                    TIDAK ADA DATA MUSTAHIK YANG SESUAI
                  </td>
                </tr>
              ) : (
                filteredMustahiks.map(m => {
                  let badgeColor = 'bg-slate-100 text-slate-800';
                  if (m.kategori === 'Fakir') badgeColor = 'bg-rose-50 text-rose-800 border-rose-100';
                  if (m.kategori === 'Miskin') badgeColor = 'bg-amber-50 text-amber-800 border-amber-100';
                  if (m.kategori === 'Amil') badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-100';
                  if (m.kategori === 'Muallaf') badgeColor = 'bg-purple-50 text-purple-800 border-purple-100';

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-4 px-4 font-bold text-slate-900">{m.nama}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center text-[9px] font-mono font-bold px-2.5 py-1 rounded-md border ${badgeColor} uppercase tracking-wide`}>
                          {m.kategori}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="text-slate-900 flex items-center gap-1.5 font-bold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {m.alamat}
                        </div>
                        <span className="text-slate-400 block font-mono text-[10px] mt-0.5 font-bold">
                          RT {m.rt} / RW {m.rw} - Kel. Pakkanrebete
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-black font-mono text-slate-900 text-xs">
                        {m.jumlah_anggota_keluarga} Orang
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => onToggleVerifikasi(m.id)}
                          className={`inline-flex items-center gap-1 text-[9px] font-mono font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all uppercase tracking-wide ${
                            m.status_verifikasi === 'Terverifikasi'
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-150/70'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-150/70'
                          }`}
                        >
                          {m.status_verifikasi === 'Terverifikasi' ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                              VALID
                            </>
                          ) : (
                            <>
                              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                              SURVEI
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(m)}
                            className="p-2 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Edit data Mustahik"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteMustahik(m.id)}
                            className="p-2 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Mustahik"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
