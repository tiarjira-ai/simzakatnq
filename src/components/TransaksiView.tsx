/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaksi, Muzakki, User } from '../types';
import { calculateZakat, formatCurrency, generateTransactionId } from '../data';
import { 
  Coins, 
  Package, 
  Search, 
  Plus, 
  Printer, 
  CheckCircle, 
  PlusCircle, 
  Image, 
  Trash2, 
  CheckSquare, 
  Calendar,
  Smartphone,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransaksiViewProps {
  transaksis: Transaksi[];
  muzakkis: Muzakki[];
  currentUser: User;
  hargaBeras: number;
  onAddTransaksi: (tx: Transaksi) => void;
  onUpdateTransaksi: (tx: Transaksi) => void;
  onDeleteTransaksi: (id: string) => void;
  onOpenReceipt: (tx: Transaksi) => void;
}

export default function TransaksiView({
  transaksis,
  muzakkis,
  currentUser,
  hargaBeras,
  onAddTransaksi,
  onUpdateTransaksi,
  onDeleteTransaksi,
  onOpenReceipt
}: TransaksiViewProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'semua' | 'beras' | 'uang'>('semua');
  const [showAddTxForm, setShowAddTxForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [selectedMuzakkiId, setSelectedMuzakkiId] = useState('');
  const [jenis, setJenis] = useState<'beras' | 'uang' | 'campuran'>('beras');
  const [jumlahJiwaBeras, setJumlahJiwaBeras] = useState<number>(1);
  const [metode, setMetode] = useState<'Tunai' | 'QRIS' | 'Transfer'>('Tunai');
  const [buktiBayar, setBuktiBayar] = useState<string>(''); // Simulated receipt proof
  const [isUploading, setIsUploading] = useState(false);
  const [infaq, setInfaq] = useState<number>(0);

  // Filter out Muzakkis who already have an active transaction, but keep the current edited Muzakki visible!
  const paidMuzakkiIds = new Set(transaksis.map(t => t.muzakki_id));
  const unpaidMuzakkis = muzakkis.filter(m => !paidMuzakkiIds.has(m.id) || (editingId && m.id === transaksis.find(t => t.id === editingId)?.muzakki_id));

  const selectedMuzakki = muzakkis.find(m => m.id === selectedMuzakkiId);
  const jumlahJiwa = selectedMuzakki ? selectedMuzakki.jumlah_jiwa : 1;

  // Dynamic calculations for campuran
  const calc = React.useMemo(() => {
    if (jenis === 'beras') {
      return {
        berasLiter: jumlahJiwa * 3.5,
        nominal: 0
      };
    } else if (jenis === 'uang') {
      return {
        berasLiter: jumlahJiwa * 3.5,
        nominal: jumlahJiwa * 3.5 * hargaBeras
      };
    } else {
      // campuran
      const cappedBerasJiwa = Math.min(jumlahJiwaBeras, jumlahJiwa);
      const berasLiter = cappedBerasJiwa * 3.5;
      const nominal = (jumlahJiwa - cappedBerasJiwa) * 3.5 * hargaBeras;
      return {
        berasLiter,
        nominal
      };
    }
  }, [jenis, jumlahJiwa, jumlahJiwaBeras, hargaBeras]);

  const resetForm = () => {
    setSelectedMuzakkiId('');
    setJenis('beras');
    setJumlahJiwaBeras(1);
    setMetode('Tunai');
    setBuktiBayar('');
    setInfaq(0);
    setEditingId(null);
  };

  const handleEdit = (t: Transaksi) => {
    setEditingId(t.id);
    setSelectedMuzakkiId(t.muzakki_id);
    setJenis(t.jenis);
    setMetode(t.metode_pembayaran || 'Tunai');
    setBuktiBayar(t.bukti_pembayaran || '');
    setInfaq(t.infaq || 0);
    if (t.jenis === 'campuran') {
      setJumlahJiwaBeras(Math.round(t.beras_liter / 3.5));
    } else {
      setJumlahJiwaBeras(Math.round(t.jumlah_jiwa / 2));
    }
    setShowAddTxForm(true);
  };

  // Simulated File Upload for QRIS/Transfer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBuktiBayar(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMuzakkiId) {
      alert('Mohon pilih Kepala Keluarga (Muzakki) terlebih dahulu!');
      return;
    }

    const isMoneyInvolved = jenis === 'uang' || (jenis === 'campuran' && calc.nominal > 0) || (infaq > 0);

    if (editingId) {
      const existing = transaksis.find(t => t.id === editingId);
      const updatedTx: Transaksi = {
        id: editingId,
        muzakki_id: selectedMuzakkiId,
        muzakki_nama: selectedMuzakki!.nama,
        jumlah_jiwa: jumlahJiwa,
        jenis,
        nominal: calc.nominal,
        beras_liter: calc.berasLiter,
        infaq,
        metode_pembayaran: isMoneyInvolved ? metode : undefined,
        bukti_pembayaran: isMoneyInvolved && metode !== 'Tunai' ? (buktiBayar || existing?.bukti_pembayaran || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=200&auto=format&fit=crop') : undefined,
        tanggal: existing?.tanggal || new Date().toISOString().split('T')[0],
        petugas: existing?.petugas || currentUser.nama,
        status: existing?.status || 'Valid'
      };
      onUpdateTransaksi(updatedTx);
      alert('Transaksi pembayaran berhasil diperbarui!');
    } else {
      const txId = generateTransactionId(transaksis);
      const newTx: Transaksi = {
        id: txId,
        muzakki_id: selectedMuzakkiId,
        muzakki_nama: selectedMuzakki!.nama,
        jumlah_jiwa: jumlahJiwa,
        jenis,
        nominal: calc.nominal,
        beras_liter: calc.berasLiter,
        infaq,
        metode_pembayaran: isMoneyInvolved ? metode : undefined,
        bukti_pembayaran: isMoneyInvolved && metode !== 'Tunai' ? (buktiBayar || 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=200&auto=format&fit=crop') : undefined,
        tanggal: new Date().toISOString().split('T')[0],
        petugas: currentUser.nama,
        status: 'Valid'
      };
      onAddTransaksi(newTx);
    }

    resetForm();
    setShowAddTxForm(false);
  };

  // Filter Transactions
  const filteredTx = transaksis.filter(t => {
    const matchesSearch = t.muzakki_nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.petugas.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'beras') return matchesSearch && (t.jenis === 'beras' || t.jenis === 'campuran');
    if (activeTab === 'uang') return matchesSearch && (t.jenis === 'uang' || t.jenis === 'campuran');
    return matchesSearch;
  });

  return (
    <div className="space-y-6" id="transaksi-view-root">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-slate-950 flex items-center gap-2.5 uppercase">
            <Coins className="w-6 h-6 text-emerald-600" />
            PENERIMAAN ZAKAT FITRAH
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Kelola transaksi masuk zakat berupa beras (3.5 L/jiwa) atau uang tunai/digital.
          </p>
        </div>
        <button
          onClick={() => {
            if (showAddTxForm) {
              resetForm();
              setShowAddTxForm(false);
            } else {
              setShowAddTxForm(true);
            }
          }}
          disabled={!editingId && unpaidMuzakkis.length === 0}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer border border-emerald-700/50"
          id="btn-toggle-add-transaksi"
        >
          {showAddTxForm ? 'Batal Form' : editingId ? 'Edit Transaksi' : 'Input Pembayaran'}
          <Plus className={`w-4 h-4 transition ${showAddTxForm ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {/* Add Transaction Form */}
      <AnimatePresence>
        {showAddTxForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form 
              onSubmit={handleSubmit}
              className="bg-white p-7 rounded-2xl border-2 border-emerald-600/80 shadow-xs space-y-6"
              id="form-transaksi"
            >
              <h3 className="font-serif font-black text-slate-950 text-base border-b border-gray-100 pb-3.5 flex items-center gap-2.5 uppercase tracking-wide">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                {editingId ? 'Edit Rincian Transaksi Pembayaran' : 'Input Transaksi Pembayaran Zakat Baru'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Select Muzakki */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Pilih Kepala Keluarga (Muzakki) *</label>
                  <select
                    required
                    value={selectedMuzakkiId}
                    onChange={(e) => setSelectedMuzakkiId(e.target.value)}
                    className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-bold focus:bg-white"
                  >
                    <option value="">-- Pilih Kepala Keluarga yang belum membayar --</option>
                    {unpaidMuzakkis.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nama} (RT {m.rt}/RW {m.rw} - {m.jumlah_jiwa} Jiwa)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jenis Pembayaran */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Bentuk Zakat Fitrah *</label>
                  <div className="flex bg-slate-50 border border-gray-200 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setJenis('beras')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        jenis === 'beras' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Beras
                    </button>
                    <button
                      type="button"
                      onClick={() => setJenis('uang')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        jenis === 'uang' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Uang
                    </button>
                    <button
                      type="button"
                      onClick={() => setJenis('campuran')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        jenis === 'campuran' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Campuran
                    </button>
                  </div>
                </div>

                {/* Conditional Fields for Campuran Split */}
                {jenis === 'campuran' && selectedMuzakki && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Pembagian Jiwa Beras/Uang *</label>
                    <select
                      value={jumlahJiwaBeras}
                      onChange={(e) => setJumlahJiwaBeras(Number(e.target.value))}
                      className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-bold focus:bg-white"
                    >
                      {Array.from({ length: jumlahJiwa + 1 }, (_, i) => i).map(num => (
                        <option key={num} value={num}>
                          {num === 0 
                            ? `0 Jiwa Beras / ${jumlahJiwa} Jiwa Uang` 
                            : num === jumlahJiwa 
                              ? `${num} Jiwa Beras / 0 Jiwa Uang` 
                              : `${num} Jiwa Beras / ${jumlahJiwa - num} Jiwa Uang`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Infaq Sukarela Field (Always show so users can contribute) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Infaq Sukarela / Sedekah (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">Rp</span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={infaq || ''}
                      onChange={(e) => setInfaq(parseInt(e.target.value, 10) || 0)}
                      placeholder="Contoh: 10000"
                      className="w-full bg-slate-50/50 border border-gray-250 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-500 font-mono font-bold focus:bg-white"
                    />
                  </div>
                </div>

                {/* Conditional Fields for Cash */}
                {(jenis === 'uang' || (jenis === 'campuran' && calc.nominal > 0) || (infaq > 0)) && (
                  <>
                    {/* Payment Method */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Metode Pembayaran *</label>
                      <select
                        value={metode}
                        onChange={(e) => setMetode(e.target.value as any)}
                        className="w-full bg-slate-50/50 border border-gray-250 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-hidden focus:border-emerald-500 transition-all font-bold focus:bg-white"
                      >
                        <option value="Tunai">Tunai / Cash</option>
                        <option value="QRIS">QRIS Barcode</option>
                        <option value="Transfer">Transfer Bank</option>
                      </select>
                    </div>

                    {/* Proof Upload (Only for QRIS or Transfer) */}
                    {metode !== 'Tunai' && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Bukti Transfer / Scan QRIS *</label>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 bg-slate-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-100 transition-all cursor-pointer font-bold border-dashed">
                            <Image className="w-4 h-4 text-emerald-600" />
                            {buktiBayar ? 'Ganti File Bukti' : 'Unggah Bukti Transaksi'}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                          {isUploading ? (
                            <span className="text-xs text-slate-400 font-mono">Sedang mengunggah...</span>
                          ) : buktiBayar ? (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                              <span className="text-xs text-slate-500 font-bold truncate max-w-[200px]">Bukti termuat</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">Gunakan simulasi otomatis jika tidak melampirkan berkas.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Automatic calculation preview */}
              {selectedMuzakki && (
                <div className="bg-[#f4fbf7] p-5 rounded-2xl border border-emerald-150/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="font-serif font-bold text-emerald-950 text-sm uppercase tracking-wide">Review Kalkulasi Otomatis</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Keluarga: <span className="font-bold text-slate-800">{selectedMuzakki.nama}</span> | Jiwa: <span className="font-bold text-slate-800">{jumlahJiwa} Orang</span>
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase tracking-widest">Kewajiban Pembayaran:</span>
                    <span className="text-2xl font-mono font-black text-emerald-800 block mt-0.5 text-right">
                      {jenis === 'beras' 
                        ? `${calc.berasLiter} Ltr Beras` 
                        : jenis === 'uang' 
                          ? formatCurrency(calc.nominal)
                          : `${calc.berasLiter} L Beras + ${formatCurrency(calc.nominal)}`}
                      {infaq > 0 && ` + Infaq: ${formatCurrency(infaq)}`}
                    </span>
                    {infaq > 0 && (
                      <span className="text-[10px] text-emerald-700 font-bold block mt-1 font-mono">
                        Total Uang Terbayar: {formatCurrency(calc.nominal + infaq)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddTxForm(false);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer flex items-center gap-2 border border-emerald-700/50"
                >
                  <CheckSquare className="w-4 h-4" />
                  {editingId ? 'Simpan Perubahan' : 'Konfirmasi Pembayaran'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tables and Tab selector */}
      <div className="bg-white p-6 rounded-2xl border border-gray-150/70 shadow-xs space-y-5">
        {/* Header tabs + Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('semua')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'semua' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua ({transaksis.length})
            </button>
            <button
              onClick={() => setActiveTab('beras')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'beras' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              Beras ({transaksis.filter(t => t.jenis === 'beras' || t.jenis === 'campuran').length})
            </button>
            <button
              onClick={() => setActiveTab('uang')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'uang' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-blue-600" />
              Uang ({transaksis.filter(t => t.jenis === 'uang' || t.jenis === 'campuran').length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi, amil, muzakki..."
              className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 font-semibold"
            />
          </div>
        </div>

        {/* Transactions list table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#fcfcfb] text-slate-500 text-[10px] font-mono font-bold tracking-widest uppercase border-b border-gray-200">
                <th className="py-3.5 px-4">No. Transaksi</th>
                <th className="py-3.5 px-4">Nama Muzakki</th>
                <th className="py-3.5 px-4 text-center">Jiwa</th>
                <th className="py-3.5 px-4">Detail Pembayaran</th>
                <th className="py-3.5 px-4">Tanggal & Amil</th>
                <th className="py-3.5 px-4 text-center">Status / Bukti</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-sm text-slate-900 font-medium">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-xs font-mono font-bold">
                    TIDAK ADA DATA TRANSAKSI
                  </td>
                </tr>
              ) : (
                filteredTx.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-4 font-mono text-xs font-black text-slate-900">{t.id}</td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{t.muzakki_nama}</div>
                    </td>
                    <td className="py-4 px-4 text-center font-black font-mono text-xs text-slate-900">
                      {t.jumlah_jiwa} Jiwa
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <div className="space-y-1.5">
                        {t.jenis === 'beras' ? (
                          <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-150 inline-flex items-center gap-1.5 uppercase">
                            <Package className="w-3.5 h-3.5" />
                            {t.beras_liter} Liter Beras
                          </span>
                        ) : t.jenis === 'uang' ? (
                          <div className="space-y-1">
                            <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-150 inline-flex items-center gap-1.5 uppercase">
                              <Coins className="w-3.5 h-3.5" />
                              {formatCurrency(t.nominal)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase tracking-wider">
                              VIA: <span className="text-slate-600">{t.metode_pembayaran}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono font-bold text-emerald-950 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 inline-flex items-center gap-1 uppercase w-fit">
                                <Package className="w-3 h-3 text-emerald-600" />
                                {t.beras_liter} L Beras
                              </span>
                              <span className="font-mono font-bold text-blue-950 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 inline-flex items-center gap-1 uppercase w-fit">
                                <Coins className="w-3 h-3 text-blue-600" />
                                {formatCurrency(t.nominal)}
                              </span>
                            </div>
                            {t.metode_pembayaran && (
                              <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase tracking-wider">
                                VIA: <span className="text-slate-600">{t.metode_pembayaran}</span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Infaq Display */}
                        {t.infaq && t.infaq > 0 ? (
                          <div className="mt-1.5">
                            <span className="font-mono font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-150 inline-flex items-center gap-1 uppercase text-[10px] w-fit">
                              <span className="text-amber-600">💖</span> Infaq: {formatCurrency(t.infaq)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <div className="flex items-center gap-1 text-slate-900 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {t.tanggal}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-mono font-bold mt-1 uppercase tracking-wider">
                        Amil: <span className="text-slate-600">{t.petugas}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center text-xs">
                      <div className="flex flex-col items-center gap-1.5 justify-center">
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-150">
                          {t.status.toUpperCase()}
                        </span>
                        {t.bukti_pembayaran && (
                          <button
                            onClick={() => {
                              const win = window.open();
                              if (win) {
                                win.document.write(`<iframe src="${t.bukti_pembayaran}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                              } else {
                                alert("Bukti transfer aman tersimpan.");
                              }
                            }}
                            className="text-[9px] font-mono font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer uppercase tracking-wider"
                          >
                            <Image className="w-3 h-3" />
                            Bukti Bayar
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => onOpenReceipt(t)}
                          className="bg-white hover:bg-slate-50 border border-gray-250 hover:border-slate-400 text-slate-800 font-bold py-2 px-3 rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 uppercase tracking-wider"
                          title="Cetak Tiket Bukti"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Bukti
                        </button>
                        <button
                          onClick={() => handleEdit(t)}
                          className="p-2 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          title="Edit Transaksi"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTransaksi(t.id)}
                          className="p-2 text-slate-400 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Hapus Transaksi"
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
