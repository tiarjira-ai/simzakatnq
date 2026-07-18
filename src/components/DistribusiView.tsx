/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Distribusi, Mustahik, User, Transaksi } from '../types';
import { formatCurrency, generateDistributionId } from '../data';
import { 
  Package, 
  Coins, 
  PlusCircle, 
  Trash2, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Gift,
  Search,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DistribusiViewProps {
  distribusis: Distribusi[];
  mustahiks: Mustahik[];
  transaksis: Transaksi[];
  currentUser: User;
  onAddDistribusi: (ds: Distribusi) => void;
  onUpdateDistribusi: (ds: Distribusi) => void;
  onDeleteDistribusi: (id: string) => void;
}

export default function DistribusiView({
  distribusis,
  mustahiks,
  transaksis,
  currentUser,
  onAddDistribusi,
  onUpdateDistribusi,
  onDeleteDistribusi
}: DistribusiViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [mustahikId, setMustahikId] = useState('');
  const [berasLiter, setBerasLiter] = useState<number>(0);
  const [uang, setUang] = useState<number>(0);
  const [keterangan, setKeterangan] = useState('');

  // Stock calculations
  const totalBerasDiterima = transaksis
    .filter(t => t.jenis === 'beras' && t.status === 'Valid')
    .reduce((acc, t) => acc + t.beras_liter, 0);

  const totalUangDiterima = transaksis
    .filter(t => t.jenis === 'uang' && t.status === 'Valid')
    .reduce((acc, t) => acc + t.nominal, 0);

  // When editing, exclude the currently being edited distribution from total distributed calculation
  // so the stock checks don't block the update!
  const totalBerasDisalurkan = distribusis
    .filter(d => d.id !== editingId)
    .reduce((acc, d) => acc + d.beras_liter, 0);

  const totalUangDisalurkan = distribusis
    .filter(d => d.id !== editingId)
    .reduce((acc, d) => acc + d.uang, 0);

  const sisaBeras = Math.max(0, totalBerasDiterima - totalBerasDisalurkan);
  const sisaUang = Math.max(0, totalUangDiterima - totalUangDisalurkan);

  // Filter only verified Mustahik for safety
  const verifiedMustahiks = mustahiks.filter(m => m.status_verifikasi === 'Terverifikasi');

  const selectedMustahik = mustahiks.find(m => m.id === mustahikId);

  const resetForm = () => {
    setMustahikId('');
    setBerasLiter(0);
    setUang(0);
    setKeterangan('');
    setEditingId(null);
  };

  const handleEdit = (ds: Distribusi) => {
    setEditingId(ds.id);
    setMustahikId(ds.mustahik_id);
    setBerasLiter(ds.beras_liter);
    setUang(ds.uang);
    setKeterangan(ds.keterangan || '');
    setShowForm(true);
  };

  // Validations
  const exceedsBeras = berasLiter > sisaBeras;
  const exceedsUang = uang > sisaUang;
  const isInvalid = exceedsBeras || exceedsUang || (berasLiter <= 0 && uang <= 0) || !mustahikId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mustahikId) {
      alert('Pilih mustahik penerima terlebih dahulu!');
      return;
    }

    if (exceedsBeras) {
      alert('Pengeluaran beras melebihi stok yang tersedia di gudang!');
      return;
    }

    if (exceedsUang) {
      alert('Penyaluran dana tunai melebihi saldo kas yang tersedia!');
      return;
    }

    if (berasLiter <= 0 && uang <= 0) {
      alert('Masukkan jumlah beras atau uang yang ingin disalurkan!');
      return;
    }

    if (editingId) {
      const original = distribusis.find(d => d.id === editingId);
      const updatedDs: Distribusi = {
        id: editingId,
        mustahik_id: mustahikId,
        mustahik_nama: selectedMustahik!.nama,
        kategori: selectedMustahik!.kategori,
        beras_liter: berasLiter,
        uang: uang,
        tanggal: original?.tanggal || new Date().toISOString().split('T')[0],
        petugas: original?.petugas || currentUser.nama,
        keterangan: keterangan.trim() || 'Penyaluran zakat fitrah resmi'
      };
      onUpdateDistribusi(updatedDs);
      alert('Pencatatan distribusi zakat berhasil diperbarui!');
    } else {
      const dsId = generateDistributionId(distribusis);
      const newDs: Distribusi = {
        id: dsId,
        mustahik_id: mustahikId,
        mustahik_nama: selectedMustahik!.nama,
        kategori: selectedMustahik!.kategori,
        beras_liter: berasLiter,
        uang: uang,
        tanggal: new Date().toISOString().split('T')[0],
        petugas: currentUser.nama,
        keterangan: keterangan.trim() || 'Penyaluran zakat fitrah resmi'
      };
      onAddDistribusi(newDs);
    }

    resetForm();
    setShowForm(false);
  };

  // Filter lists
  const filteredDs = distribusis.filter(d => 
    d.mustahik_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="distribusi-view-root">
      {/* Stock Cards Info Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Beras Stock Info */}
        <div className="bg-emerald-50 border border-emerald-150/80 p-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-widest block">Stok Beras Tersedia</span>
            <span className="text-3xl font-mono font-black text-emerald-950 tracking-tight block">
              {sisaBeras} <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Liter</span>
            </span>
            <span className="text-[11px] text-emerald-800 block font-mono font-bold uppercase tracking-wider">Total Masuk: {totalBerasDiterima}L</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-emerald-700 border border-emerald-150">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Uang Stock Info */}
        <div className="bg-blue-50 border border-blue-150/80 p-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-widest block">Saldo Kas Uang Tersedia</span>
            <span className="text-2xl font-mono font-black text-blue-950 tracking-tight block">
              {formatCurrency(sisaUang)}
            </span>
            <span className="text-[11px] text-blue-800 block font-mono font-bold uppercase tracking-wider">Total Masuk: {formatCurrency(totalUangDiterima)}</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-blue-700 border border-blue-150">
            <Coins className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Header and Toggle Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-slate-950 flex items-center gap-2.5 uppercase">
            <Gift className="w-6 h-6 text-emerald-600" />
            PENYALURAN & DISTRIBUSI ZAKAT
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Pencatatan distribusi beras dan dana zakat langsung ke tangan Mustahik.
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
          disabled={!editingId && verifiedMustahiks.length === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer border border-emerald-700/50"
          id="btn-toggle-add-distribusi"
        >
          {showForm ? 'Batal Form' : editingId ? 'Edit Distribusi' : 'Salurkan Zakat'}
          <PlusCircle className={`w-4 h-4 transition ${showForm ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Distribution Form */}
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
              id="form-distribusi"
            >
              <h3 className="font-serif font-black text-slate-950 text-base border-b border-gray-100 pb-3.5 flex items-center gap-2 uppercase tracking-wide">
                <Gift className="w-5 h-5 text-emerald-600" />
                {editingId ? 'Edit Catatan Penyaluran Zakat Fitrah' : 'Formulir Penyaluran Zakat Fitrah Baru'}
              </h3>

              {/* Warnings on stock depletion */}
              {(exceedsBeras || exceedsUang) && (
                <div className="p-4 bg-rose-50 border border-rose-150/70 text-rose-950 text-xs rounded-xl flex items-start gap-2.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono font-black uppercase block tracking-wider text-rose-800">PERINGATAN: MELEBIHI BATAS STOK</span>
                    {exceedsBeras && <div className="mt-1 font-medium">- Jumlah pengeluaran beras ({berasLiter} L) melebihi persediaan gudang ({sisaBeras} L).</div>}
                    {exceedsUang && <div className="mt-1 font-medium">- Nominal pengeluaran uang ({formatCurrency(uang)}) melebihi kas tersedia ({formatCurrency(sisaUang)}).</div>}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Select Mustahik */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Mustahik Penerima (Hanya yang Terverifikasi) *</label>
                  <select
                    required
                    value={mustahikId}
                    onChange={(e) => setMustahikId(e.target.value)}
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-bold focus:bg-white"
                  >
                    <option value="">-- Pilih Mustahik yang berhak menerima --</option>
                    {verifiedMustahiks.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nama} ({m.kategori} - Tanggungan: {m.jumlah_anggota_keluarga} Jiwa)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto categories */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Golongan Asnaf Terdeteksi</label>
                  <div className="bg-slate-100 border border-gray-200 px-4 py-3 rounded-xl text-xs font-mono font-black text-slate-800 uppercase tracking-wider">
                    {selectedMustahik ? selectedMustahik.kategori : 'PILIH PENERIMA...'}
                  </div>
                </div>

                {/* Amount Rice */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Pemberian Beras (Liter)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={berasLiter || ''}
                      onChange={(e) => setBerasLiter(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="0"
                      className={`w-full bg-slate-50/50 border rounded-xl pl-4 pr-12 py-2.5 text-sm text-slate-900 focus:outline-hidden font-bold font-mono focus:bg-white ${
                        exceedsBeras ? 'border-rose-300 focus:border-rose-500' : 'border-gray-250 focus:border-emerald-500'
                      }`}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">Ltr</span>
                  </div>
                </div>

                {/* Amount Money */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Pemberian Uang (Rupiah)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">Rp</span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={uang || ''}
                      onChange={(e) => setUang(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="0"
                      className={`w-full bg-slate-50/50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-hidden font-bold font-mono focus:bg-white ${
                        exceedsUang ? 'border-rose-300 focus:border-rose-500' : 'border-gray-250 focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Keterangan */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Keterangan Penyaluran</label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder="Contoh: Bantuan pokok asnaf fakir"
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-semibold focus:bg-white"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
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
                  disabled={isInvalid}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer flex items-center gap-2 border border-emerald-700/50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {editingId ? 'Simpan Perubahan' : 'Salurkan Zakat'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Distributions history log */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150/70 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h4 className="font-serif font-black text-slate-950 text-base uppercase tracking-wide self-start sm:self-auto">Riwayat Penyaluran Zakat</h4>
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari penerima, asnaf, kode..."
              className="w-full bg-slate-50 border border-gray-250 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 font-semibold"
            />
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfcfb] text-slate-500 text-[10px] font-mono font-bold tracking-widest uppercase border-b border-gray-200">
                <th className="py-3.5 px-4">No. Penyaluran</th>
                <th className="py-3.5 px-4">Nama Penerima</th>
                <th className="py-3.5 px-4">Kategori (Asnaf)</th>
                <th className="py-3.5 px-4">Penyaluran Beras</th>
                <th className="py-3.5 px-4">Penyaluran Uang</th>
                <th className="py-3.5 px-4">Tanggal & Amil</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-sm text-slate-900 font-medium">
              {filteredDs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-xs font-mono font-bold">
                    BELUM ADA RIWAYAT PENYALURAN ZAKAT
                  </td>
                </tr>
              ) : (
                filteredDs.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-4 font-mono text-xs font-black text-slate-900">{d.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">{d.mustahik_nama}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex text-[9px] font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-150/70 uppercase tracking-wide">
                        {d.kategori}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-black text-emerald-800 text-xs">
                      {d.beras_liter > 0 ? `${d.beras_liter} Liter` : '-'}
                    </td>
                    <td className="py-4 px-4 font-mono font-black text-blue-800 text-xs">
                      {d.uang > 0 ? formatCurrency(d.uang) : '-'}
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-900 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {d.tanggal}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono font-bold mt-1 uppercase tracking-wider">
                        Amil: <span className="text-slate-600">{d.petugas}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEdit(d)}
                          className="p-2 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          title="Edit Penyaluran"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteDistribusi(d.id)}
                          className="p-2 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Penyaluran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
