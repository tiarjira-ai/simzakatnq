/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Muzakki, Transaksi, User } from '../types';
import { calculateZakat, formatCurrency, generateTransactionId } from '../data';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Trash2, 
  Edit3, 
  UserPlus, 
  Coins, 
  Calculator, 
  Phone, 
  Home, 
  Users, 
  HelpCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MuzakkiViewProps {
  muzakkis: Muzakki[];
  transaksis: Transaksi[];
  currentUser: User;
  hargaBeras: number;
  onAddMuzakki: (muzakki: Muzakki, transaksi?: Transaksi) => void;
  onUpdateMuzakki: (muzakki: Muzakki) => void;
  onDeleteMuzakki: (id: string) => void;
  onOpenReceipt: (transaksi: Transaksi) => void;
}

export default function MuzakkiView({
  muzakkis,
  transaksis,
  currentUser,
  hargaBeras,
  onAddMuzakki,
  onUpdateMuzakki,
  onDeleteMuzakki,
  onOpenReceipt
}: MuzakkiViewProps) {
  // UI states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRt, setFilterRt] = useState('Semua');

  // Form states
  const [nama, setNama] = useState('');
  const [alamat, setAlamat] = useState('');
  const [rt, setRt] = useState('01');
  const [rw, setRw] = useState('01');
  const [noHp, setNoHp] = useState('');
  const [jumlahJiwa, setJumlahJiwa] = useState(1);
  
  // Quick payment setup state (creates transaction instantly)
  const [buatTransaksiLangsung, setBuatTransaksiLangsung] = useState(true);
  const [jenisBayar, setJenisBayar] = useState<'beras' | 'uang'>('beras');
  const [metodeUang, setMetodeUang] = useState<'Tunai' | 'QRIS' | 'Transfer'>('Tunai');

  // Dynamic calculations
  const calc = calculateZakat(jumlahJiwa, jenisBayar, hargaBeras);

  const resetForm = () => {
    setNama('');
    setAlamat('');
    setRt('01');
    setRw('01');
    setNoHp('');
    setJumlahJiwa(1);
    setJenisBayar('beras');
    setMetodeUang('Tunai');
    setEditingId(null);
  };

  const handleEdit = (muzakki: Muzakki) => {
    setEditingId(muzakki.id);
    setNama(muzakki.nama);
    setAlamat(muzakki.alamat);
    setRt(muzakki.rt);
    setRw(muzakki.rw);
    setNoHp(muzakki.no_hp);
    setJumlahJiwa(muzakki.jumlah_jiwa);
    setBuatTransaksiLangsung(false); // edit won't recreate transaction
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !alamat.trim() || jumlahJiwa < 1) {
      alert('Mohon lengkapi semua field formulir!');
      return;
    }

    if (editingId) {
      // Update
      const updated: Muzakki = {
        id: editingId,
        nama: nama.trim(),
        alamat: alamat.trim(),
        rt,
        rw,
        no_hp: noHp.trim(),
        jumlah_jiwa: jumlahJiwa
      };
      onUpdateMuzakki(updated);
    } else {
      // Create
      const newMuzakkiId = `muz-${Date.now()}`;
      const newMuzakki: Muzakki = {
        id: newMuzakkiId,
        nama: nama.trim(),
        alamat: alamat.trim(),
        rt,
        rw,
        no_hp: noHp.trim(),
        jumlah_jiwa: jumlahJiwa
      };

      let newTransaksi: Transaksi | undefined = undefined;

      if (buatTransaksiLangsung) {
        const txId = generateTransactionId(transaksis);
        newTransaksi = {
          id: txId,
          muzakki_id: newMuzakkiId,
          muzakki_nama: newMuzakki.nama,
          jumlah_jiwa: jumlahJiwa,
          jenis: jenisBayar,
          nominal: calc.nominal,
          beras_liter: calc.berasLiter,
          metode_pembayaran: jenisBayar === 'uang' ? metodeUang : undefined,
          tanggal: new Date().toISOString().split('T')[0],
          petugas: currentUser.nama,
          status: 'Valid'
        };
      }

      onAddMuzakki(newMuzakki, newTransaksi);
    }

    resetForm();
    setShowAddForm(false);
  };

  // Filters & Search
  const filteredMuzakkis = muzakkis.filter(m => {
    const matchSearch = m.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        m.alamat.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        m.no_hp.includes(searchQuery);
    const matchRt = filterRt === 'Semua' || m.rt === filterRt;
    return matchSearch && matchRt;
  });

  return (
    <div className="space-y-6" id="muzakki-view-root">
      {/* Title Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-slate-950 flex items-center gap-2.5 uppercase">
            <Users className="w-6 h-6 text-emerald-600" />
            PENDATAAN MUZAKKI
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Registrasi Kepala Keluarga dan manajemen wajib zakat fitrah.
          </p>
        </div>
        <button
          onClick={() => {
            if (showAddForm) {
              resetForm();
              setShowAddForm(false);
            } else {
              setShowAddForm(true);
            }
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer border border-emerald-700/50"
          id="btn-toggle-add-muzakki"
        >
          {showAddForm ? 'Batal Form' : 'Tambah Muzakki'}
          <Plus className={`w-4 h-4 transition ${showAddForm ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Expandable Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleSubmit}
              className="bg-white p-7 rounded-2xl border-2 border-emerald-600/80 shadow-xs space-y-6"
              id="form-muzakki"
            >
              <h3 className="font-serif font-black text-slate-950 text-base border-b border-gray-100 pb-3.5 flex items-center gap-2 uppercase tracking-wide">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                {editingId ? 'Edit Data Kepala Keluarga' : 'Formulir Wajib Zakat Baru'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Nama Lengkap KK */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Nama Kepala Keluarga *</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Bpk. H. Syamsuddin"
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-semibold focus:bg-white"
                  />
                </div>

                {/* No HP */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">No. WhatsApp / HP</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono font-bold">+62</span>
                    <input
                      type="tel"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      placeholder="812345678"
                      className="w-full bg-slate-50/50 border border-gray-250 rounded-xl pl-12 pr-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-mono font-bold focus:bg-white"
                    />
                  </div>
                </div>

                {/* Jumlah Jiwa */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Jumlah Anggota Keluarga *</label>
                  <div className="flex items-center bg-slate-50/50 border border-gray-250 rounded-xl px-2">
                    <button
                      type="button"
                      disabled={jumlahJiwa <= 1}
                      onClick={() => setJumlahJiwa(prev => prev - 1)}
                      className="w-8 h-8 flex items-center justify-center font-bold text-gray-500 hover:bg-slate-200/50 rounded-lg disabled:opacity-40 transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-black text-slate-900 text-sm">{jumlahJiwa} Orang</span>
                    <button
                      type="button"
                      onClick={() => setJumlahJiwa(prev => prev + 1)}
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
                    placeholder="Contoh: Jl. Poros Pakkanrebete Samping KUA"
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-semibold focus:bg-white"
                  />
                </div>

                {/* RT & RW */}
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
              </div>

              {/* Automatic Calculation & Direct Transaction Option (UX booster) */}
              {!editingId && (
                <div className="bg-[#f4fbf7] p-6 rounded-2xl border border-emerald-150/80 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={buatTransaksiLangsung}
                        onChange={(e) => setBuatTransaksiLangsung(e.target.checked)}
                        className="w-5 h-5 accent-emerald-600 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm font-bold text-emerald-950">Terima dan catat pembayaran langsung saat simpan</span>
                    </label>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md uppercase tracking-wider">TAKIRAN: 3.5 Liter / Jiwa</span>
                  </div>

                  {buatTransaksiLangsung && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-emerald-100/70 items-center"
                    >
                      {/* Payment Choice */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-mono font-bold text-emerald-800 uppercase tracking-widest block">Jenis Pembayaran</label>
                        <div className="flex bg-white border border-gray-200 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setJenisBayar('beras')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              jenisBayar === 'beras' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Beras
                          </button>
                          <button
                            type="button"
                            onClick={() => setJenisBayar('uang')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              jenisBayar === 'uang' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Uang Tunai
                          </button>
                        </div>
                      </div>

                      {/* Payment Method (if cash) */}
                      {jenisBayar === 'uang' ? (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono font-bold text-emerald-800 uppercase tracking-widest block">Metode Penyaluran Kas</label>
                          <select
                            value={metodeUang}
                            onChange={(e) => setMetodeUang(e.target.value as any)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-hidden"
                          >
                            <option value="Tunai">Tunai / Cash</option>
                            <option value="QRIS">QRIS Barcode</option>
                            <option value="Transfer">Transfer Bank</option>
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono font-bold text-emerald-800 uppercase tracking-widest block">Takaran Fitrah</label>
                          <div className="text-xs font-mono font-bold text-slate-700 bg-white border border-gray-200 px-3 py-2.5 rounded-xl uppercase tracking-wider">
                            3.5 Liter per Jiwa
                          </div>
                        </div>
                      )}

                      {/* Display Automatic Calculation */}
                      <div className="bg-white border border-emerald-150 rounded-xl p-3 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="text-[8px] font-mono font-bold text-slate-400 uppercase block tracking-wider">Rincian Bayar</span>
                            <span className="text-[11px] font-bold text-slate-800">{jumlahJiwa} Jiwa Terhitung</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-mono font-black text-emerald-800 block">
                            {jenisBayar === 'beras' 
                              ? `${calc.berasLiter} Ltr Beras` 
                              : formatCurrency(calc.nominal)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Submit / Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
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
                  {editingId ? 'Simpan Perubahan' : 'Daftarkan Muzakki'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Muzakki Directory Filter & Search */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150/70 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kepala keluarga, no hp, alamat..."
              className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 transition font-semibold"
            />
          </div>

          {/* RT filter */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filterRt}
              onChange={(e) => setFilterRt(e.target.value)}
              className="bg-slate-50 border border-gray-250 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-bold focus:outline-hidden focus:border-slate-400 cursor-pointer"
            >
              <option value="Semua">Semua RT</option>
              {['01', '02', '03', '04', '05'].map(num => (
                <option key={num} value={num}>RT {num}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory List Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfcfb] text-slate-500 text-[10px] font-mono font-bold tracking-widest uppercase border-b border-gray-200">
                <th className="py-3.5 px-4">Nama Kepala Keluarga</th>
                <th className="py-3.5 px-4">Kontak (WA)</th>
                <th className="py-3.5 px-4">Alamat Rumah & Wilayah</th>
                <th className="py-3.5 px-4 text-center">Anggota (Jiwa)</th>
                <th className="py-3.5 px-4 text-center">Status Pembayaran</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-sm text-slate-900 font-medium">
              {filteredMuzakkis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-xs font-mono font-bold">
                    TIDAK ADA DATA MUZAKKI YANG SESUAI
                  </td>
                </tr>
              ) : (
                filteredMuzakkis.map(m => {
                  // Find if they have paid transaction
                  const isPaid = transaksis.find(t => t.muzakki_id === m.id);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-4 px-4 font-bold text-slate-900">{m.nama}</td>
                      <td className="py-4 px-4 text-xs font-mono font-semibold text-slate-500">
                        {m.no_hp ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            +62{m.no_hp}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic font-normal">Tidak ada</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="text-slate-900 flex items-center gap-1.5 font-bold">
                          <Home className="w-3.5 h-3.5 text-slate-400" />
                          {m.alamat}
                        </div>
                        <span className="text-slate-400 block font-mono text-[10px] mt-0.5 font-bold">
                          RT {m.rt} / RW {m.rw} - Kel. Pakkanrebete
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center font-black font-mono text-slate-900 text-xs">
                        {m.jumlah_jiwa} Jiwa
                      </td>
                      <td className="py-4 px-4 text-center">
                        {isPaid ? (
                          <button
                            onClick={() => onOpenReceipt(isPaid)}
                            className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[9px] font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-150/70 cursor-pointer transition-all uppercase tracking-wide"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            LUNAS: {isPaid.jenis === 'beras' ? `${isPaid.beras_liter}L Beras` : formatCurrency(isPaid.nominal)}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-900 text-[9px] font-mono font-bold px-3 py-1.5 rounded-lg border border-rose-150/70 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            BELUM BAYAR
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(m)}
                            className="p-2 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                            title="Edit data Muzakki"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteMuzakki(m.id)}
                            className="p-2 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus Muzakki"
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
