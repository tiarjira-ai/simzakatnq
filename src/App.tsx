/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppState, User, Muzakki, Transaksi, Mustahik, Distribusi } from './types';
import { loadState, saveState, SEED_USERS } from './data';
import DashboardView from './components/DashboardView';
import MuzakkiView from './components/MuzakkiView';
import TransaksiView from './components/TransaksiView';
import MustahikView from './components/MustahikView';
import DistribusiView from './components/DistribusiView';
import LaporanView from './components/LaporanView';
import SyncSettingsView from './components/SyncSettingsView';
import ReceiptModal from './components/ReceiptModal';
import { 
  Users, 
  Coins, 
  Gift, 
  FileText, 
  Database, 
  UserCheck, 
  Menu, 
  X, 
  Settings, 
  Bell, 
  LogOut,
  HelpCircle,
  Activity,
  HeartHandshake
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // 1. Core App State (Offline-first loading)
  const [state, setState] = useState<AppState>(() => loadState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'muzakki' | 'transaksi' | 'mustahik' | 'distribusi' | 'laporan' | 'sync'>('dashboard');

  // 2. Role Switcher / Authentication Simulation State
  const [activeUser, setActiveUser] = useState<User>(() => {
    const currentState = loadState();
    return currentState.users[0] || SEED_USERS[0];
  });
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Sync activeUser with user database changes
  useEffect(() => {
    const found = state.users.find(u => u.id === activeUser.id);
    if (!found) {
      if (state.users.length > 0) {
        setActiveUser(state.users[0]);
      }
    } else if (found.nama !== activeUser.nama || found.role !== activeUser.role || found.username !== activeUser.username) {
      setActiveUser(found);
    }
  }, [state.users, activeUser]);

  // CRUD Handlers for Users (Petugas)
  const handleAddUser = (newUser: User) => {
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === updatedUser.id ? updatedUser : u)
    }));
  };

  const handleDeleteUser = (id: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));
  };

  const handleUpdateMosqueInfo = (nama: string, alamat: string, kontak: string) => {
    setState(prev => ({
      ...prev,
      namaMasjid: nama,
      alamatMasjid: alamat,
      kontakMasjid: kontak
    }));
  };

  // 3. Configurations
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempHargaBeras, setTempHargaBeras] = useState(state.hargaBerasPerLiter);
  const [dkmApproved, setDkmApproved] = useState(false);

  // 4. Receipt Display Modal State
  const [activeReceipt, setActiveReceipt] = useState<Transaksi | null>(null);

  // 5. Sidebar Toggle (Mobile responsive)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // 6. Running Real-time Clock State
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const formattedDate = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Automatic LocalStorage synchronization on mutations
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Handle setting updates
  const handleUpdateHargaBeras = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempHargaBeras < 1000) {
      alert('Harga beras per liter tidak masuk akal!');
      return;
    }
    setState(prev => ({
      ...prev,
      hargaBerasPerLiter: tempHargaBeras
    }));
    setShowConfigModal(false);
  };

  const handleUpdateHargaBerasDirect = (harga: number) => {
    setState(prev => ({
      ...prev,
      hargaBerasPerLiter: harga
    }));
  };

  const handleUpdateWebappUrl = (url: string) => {
    setState(prev => ({
      ...prev,
      gasWebappUrl: url
    }));
  };

  const handleResetToSeed = () => {
    // Reset to initial clean state
    localStorage.removeItem('zakat_fitrah_app_state');
    window.location.reload();
  };

  // State mutation handlers
  const handleAddMuzakki = (newMuzakki: Muzakki, newTransaksi?: Transaksi) => {
    setState(prev => {
      const updatedMuzakkis = [...prev.muzakkis, newMuzakki];
      const updatedTransaksis = newTransaksi 
        ? [...prev.transaksis, newTransaksi]
        : prev.transaksis;
      
      return {
        ...prev,
        muzakkis: updatedMuzakkis,
        transaksis: updatedTransaksis
      };
    });

    if (newTransaksi) {
      setActiveReceipt(newTransaksi);
    }
  };

  const handleUpdateMuzakki = (updated: Muzakki) => {
    setState(prev => ({
      ...prev,
      muzakkis: prev.muzakkis.map(m => m.id === updated.id ? updated : m)
    }));
  };

  const handleDeleteMuzakki = (id: string) => {
    if (confirm('Hapus muzakki ini? Seluruh riwayat bayar muzakki ini juga akan dieliminasi dari daftar.')) {
      setState(prev => ({
        ...prev,
        muzakkis: prev.muzakkis.filter(m => m.id !== id),
        transaksis: prev.transaksis.filter(t => t.muzakki_id !== id)
      }));
    }
  };

  const handleAddTransaksi = (tx: Transaksi) => {
    setState(prev => ({
      ...prev,
      transaksis: [...prev.transaksis, tx]
    }));
    // Open receipt right away
    setActiveReceipt(tx);
  };

  const handleDeleteTransaksi = (id: string) => {
    if (confirm('Hapus transaksi pembayaran ini? Stok gudang/kas akan disesuaikan.')) {
      setState(prev => ({
        ...prev,
        transaksis: prev.transaksis.filter(t => t.id !== id)
      }));
    }
  };

  const handleUpdateTransaksi = (updated: Transaksi) => {
    setState(prev => ({
      ...prev,
      transaksis: prev.transaksis.map(t => t.id === updated.id ? updated : t)
    }));
  };

  const handleAddMustahik = (newMustahik: Mustahik) => {
    setState(prev => ({
      ...prev,
      mustahiks: [...prev.mustahiks, newMustahik]
    }));
  };

  const handleUpdateMustahik = (updated: Mustahik) => {
    setState(prev => ({
      ...prev,
      mustahiks: prev.mustahiks.map(m => m.id === updated.id ? updated : m)
    }));
  };

  const handleDeleteMustahik = (id: string) => {
    if (confirm('Hapus mustahik ini?')) {
      setState(prev => ({
        ...prev,
        mustahiks: prev.mustahiks.filter(m => m.id !== id)
      }));
    }
  };

  const handleToggleVerifikasi = (id: string) => {
    setState(prev => ({
      ...prev,
      mustahiks: prev.mustahiks.map(m => {
        if (m.id === id) {
          return {
            ...m,
            status_verifikasi: m.status_verifikasi === 'Terverifikasi' ? 'Belum Terverifikasi' : 'Terverifikasi'
          };
        }
        return m;
      })
    }));
  };

  const handleAddDistribusi = (ds: Distribusi) => {
    setState(prev => ({
      ...prev,
      distribusis: [...prev.distribusis, ds]
    }));
  };

  const handleDeleteDistribusi = (id: string) => {
    if (confirm('Batalkan & hapus pencatatan distribusi ini? Stok/saldo akan dikembalikan.')) {
      setState(prev => ({
        ...prev,
        distribusis: prev.distribusis.filter(d => d.id !== id)
      }));
    }
  };

  const handleUpdateDistribusi = (updated: Distribusi) => {
    setState(prev => ({
      ...prev,
      distribusis: prev.distribusis.map(d => d.id === updated.id ? updated : d)
    }));
  };

  // WhatsApp reminder (Feature 15)
  const triggerWhatsAppReminder = (muzakki: Muzakki) => {
    const formattedNum = muzakki.no_hp.startsWith('0') ? `62${muzakki.no_hp.substring(1)}` : `62${muzakki.no_hp}`;
    const mosqueName = state.namaMasjid || 'Masjid Nurul Qalam';
    const text = encodeURIComponent(
      `Assalamu'alaikum Wr. Wb. Bapak/Ibu *${muzakki.nama}*.\n\nKami dari *Panitia Zakat Fitrah ${mosqueName}* ingin mengabarkan sekaligus mengingatkan bahwa loket pembayaran zakat fitrah resmi Ramadhan telah dibuka di Masjid.\n\nWajib zakat untuk keluarga Anda: *${muzakki.jumlah_jiwa} Jiwa*.\nTakaran beras: *${muzakki.jumlah_jiwa * 3.5} Liter* (atau setara *${formatCurrency(muzakki.jumlah_jiwa * 3.5 * state.hargaBerasPerLiter)}* jika berupa uang).\n\nMari segera tunaikan kewajiban suci kita sebelum akhir Ramadhan tiba. Atas perhatiannya kami haturkan Jazakumullah Khairan.`
    );
    window.open(`https://wa.me/${formattedNum}?text=${text}`, '_blank');
  };

  function formatCurrency(value: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  }

  return (
    <div className="min-h-screen bg-[#fcfcfb] text-slate-800 font-sans flex flex-col antialiased" id="app-root-container">
      {/* 1. TOP RESPONSIVE NAVIGATION BAR */}
      <header className="bg-[#0b2419] text-white shadow-xs sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-emerald-900/30 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileSidebar(prev => !prev)}
            className="p-1.5 hover:bg-emerald-900/50 rounded-lg lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <span className="text-2xl filter drop-shadow-sm">🕌</span>
            <div>
              <h1 className="text-sm md:text-base font-serif font-black tracking-wide leading-none">
                {state.namaMasjid || 'Masjid Nurul Qalam'}
              </h1>
              <p className="text-[9px] text-emerald-400 font-mono font-bold tracking-widest uppercase mt-1">
                {state.alamatMasjid || 'Sistem Zakat Fitrah Pakkanrebete'}
              </p>
            </div>
          </div>
        </div>

        {/* User Role Switcher Controls & Quick Settings */}
        <div className="flex items-center gap-3">
          {/* Real-time Clock Widget */}
          <div className="hidden md:flex flex-col items-end px-3.5 py-1.5 bg-emerald-950/50 rounded-xl border border-emerald-800/30 font-mono text-[11px] font-bold text-emerald-400">
            <span className="text-white text-xs tracking-wider flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {formattedTime}
            </span>
            <span className="text-[8px] text-emerald-500/80 mt-0.5">{formattedDate}</span>
          </div>

          {/* Quick Config Rice Price (Available for Admin) */}
          {activeUser.role === 'admin' && (
            <button
              onClick={() => {
                setTempHargaBeras(state.hargaBerasPerLiter);
                setShowConfigModal(true);
              }}
              className="p-2 bg-emerald-900/30 hover:bg-emerald-900/60 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold font-mono tracking-wider cursor-pointer border border-emerald-800/40 text-emerald-300"
              title="Atur harga beras per liter"
            >
              <Settings className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">SET BERAS</span>
            </button>
          )}

          {/* User Profile selector */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(prev => !prev)}
              className="flex items-center gap-2 bg-emerald-950/80 hover:bg-emerald-950 px-3 py-2 rounded-xl border border-emerald-800/40 transition-all cursor-pointer text-xs font-bold text-left"
              id="role-switcher-btn"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <div className="leading-tight">
                <div className="text-[8px] text-emerald-400 font-mono font-bold uppercase tracking-widest">PETUGAS:</div>
                <div className="truncate max-w-[100px] sm:max-w-[150px] font-medium text-white">{activeUser.nama}</div>
              </div>
            </button>

            {/* Switch Role popover */}
            <AnimatePresence>
              {showRoleMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-13 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2.5 z-50 text-slate-800"
                >
                  <div className="px-3 py-2 border-b border-gray-50 mb-1.5">
                    <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest">Pilih Petugas / Peran</span>
                  </div>
                  {state.users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setActiveUser(u);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all font-semibold cursor-pointer ${
                        activeUser.id === u.id 
                          ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-100/70' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{u.nama}</div>
                        <div className="text-[10px] text-gray-400 font-mono capitalize mt-0.5">{u.role === 'dkm' ? 'Ketua DKM (Approve)' : u.role}</div>
                      </div>
                      {activeUser.id === u.id && <span className="text-emerald-600 font-bold text-xs">✓</span>}
                    </button>
                  ))}
                  <div className="p-2 border-t border-gray-100 mt-2 flex justify-between items-center text-[9px] font-mono text-gray-400 font-semibold">
                    <span>DATABASE</span>
                    <span className="text-emerald-600 font-bold">OFFLINE ACTIVE</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row print:bg-white print:block">
        {/* 2. SIDEBAR NAVIGATION - Hidden on print, collapsible on mobile */}
        <aside 
          className={`bg-[#05130d] text-emerald-100/90 w-64 flex flex-col justify-between p-5 z-30 transition-all border-r border-emerald-950 print:hidden shrink-0 fixed inset-y-0 left-0 lg:sticky lg:top-[56px] lg:h-[calc(100vh-56px)] ${
            showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
          id="app-sidebar"
        >
          <div className="space-y-6">
            {/* Nav Menu Header */}
            <div className="flex items-center justify-between lg:hidden border-b border-emerald-950 pb-3 mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">Navigasi Utama</span>
              <button
                onClick={() => setShowMobileSidebar(false)}
                className="p-1 hover:bg-emerald-950/50 rounded-lg text-emerald-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu options */}
            <nav className="space-y-1" id="sidebar-nav-menu">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Activity },
                { id: 'muzakki', label: 'Muzakki (Wajib Zakat)', icon: Users },
                { id: 'transaksi', label: 'Penerimaan Zakat', icon: Coins },
                { id: 'mustahik', label: 'Mustahik (Penerima)', icon: HeartHandshake },
                { id: 'distribusi', label: 'Penyaluran Zakat', icon: Gift },
                { id: 'laporan', label: 'Laporan Rekapitulasi', icon: FileText },
                { id: 'sync', label: 'Pengaturan Admin', icon: Settings }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setShowMobileSidebar(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-600 text-white border border-emerald-500/30 shadow-[0_4px_12px_rgba(16,185,129,0.25)]' 
                        : 'text-emerald-100/60 hover:bg-emerald-950/50 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-emerald-500/70'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Help and status */}
          <div className="space-y-4 pt-4 border-t border-emerald-950">
            {/* Quick reminder card */}
            <div className="bg-[#030a07] p-4.5 rounded-xl border border-emerald-900/50 text-[10px] space-y-1.5 shadow-xs">
              <span className="font-mono font-extrabold text-emerald-400 block tracking-widest uppercase truncate">{state.namaMasjid || 'MASJID NURUL QALAM'}</span>
              <p className="text-emerald-100/70 leading-relaxed">
                Ketetapan Zakat Fitrah: <span className="text-white font-extrabold font-mono">{formatCurrency(state.hargaBerasPerLiter * 3.5)}</span> / jiwa (3.5 L Beras).
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-100/40 font-semibold px-2">
              <span>DATABASE OFFLINE:</span>
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                TERSIMPAN
              </span>
            </div>
          </div>
        </aside>

        {/* Overlay backdrop for mobile navigation drawer */}
        {showMobileSidebar && (
          <div 
            onClick={() => setShowMobileSidebar(false)}
            className="fixed inset-0 bg-[#05130d]/60 backdrop-blur-xs z-20 lg:hidden"
          ></div>
        )}

        {/* 3. MAIN WORKSPACE */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full print:p-0 print:max-w-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              id="active-view-container"
            >
              {activeTab === 'dashboard' && (
                <DashboardView
                  muzakkis={state.muzakkis}
                  transaksis={state.transaksis}
                  mustahiks={state.mustahiks}
                  distribusis={state.distribusis}
                  hargaBeras={state.hargaBerasPerLiter}
                />
              )}

              {activeTab === 'muzakki' && (
                <MuzakkiView
                  muzakkis={state.muzakkis}
                  transaksis={state.transaksis}
                  currentUser={activeUser}
                  hargaBeras={state.hargaBerasPerLiter}
                  onAddMuzakki={handleAddMuzakki}
                  onUpdateMuzakki={handleUpdateMuzakki}
                  onDeleteMuzakki={handleDeleteMuzakki}
                  onOpenReceipt={setActiveReceipt}
                />
              )}

              {activeTab === 'transaksi' && (
                <TransaksiView
                  transaksis={state.transaksis}
                  muzakkis={state.muzakkis}
                  currentUser={activeUser}
                  hargaBeras={state.hargaBerasPerLiter}
                  onAddTransaksi={handleAddTransaksi}
                  onUpdateTransaksi={handleUpdateTransaksi}
                  onDeleteTransaksi={handleDeleteTransaksi}
                  onOpenReceipt={setActiveReceipt}
                />
              )}

              {activeTab === 'mustahik' && (
                <MustahikView
                  mustahiks={state.mustahiks}
                  currentUser={activeUser}
                  onAddMustahik={handleAddMustahik}
                  onUpdateMustahik={handleUpdateMustahik}
                  onDeleteMustahik={handleDeleteMustahik}
                  onToggleVerifikasi={handleToggleVerifikasi}
                />
              )}

              {activeTab === 'distribusi' && (
                <DistribusiView
                  distribusis={state.distribusis}
                  mustahiks={state.mustahiks}
                  transaksis={state.transaksis}
                  currentUser={activeUser}
                  onAddDistribusi={handleAddDistribusi}
                  onUpdateDistribusi={handleUpdateDistribusi}
                  onDeleteDistribusi={handleDeleteDistribusi}
                />
              )}

              {activeTab === 'laporan' && (
                <LaporanView
                  muzakkis={state.muzakkis}
                  transaksis={state.transaksis}
                  mustahiks={state.mustahiks}
                  distribusis={state.distribusis}
                  hargaBeras={state.hargaBerasPerLiter}
                  dkmApproved={dkmApproved}
                  onToggleDKMApproval={() => setDkmApproved(prev => !prev)}
                  currentUser={activeUser}
                  namaMasjid={state.namaMasjid}
                  alamatMasjid={state.alamatMasjid}
                  users={state.users}
                />
              )}

              {activeTab === 'sync' && (
                <SyncSettingsView
                  appState={state}
                  onUpdateWebappUrl={handleUpdateWebappUrl}
                  onUpdateHargaBeras={handleUpdateHargaBerasDirect}
                  onResetToSeed={handleResetToSeed}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                  onUpdateMosqueInfo={handleUpdateMosqueInfo}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Quick interactive action for unpaid Muzakkis at the bottom of the Muzakki list */}
          {activeTab === 'muzakki' && (
            <div className="mt-8 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Pengingat Pembayaran Zakat Fitrah via WhatsApp</h4>
                <p className="text-xs text-gray-400 mt-0.5">Daftar Kepala Keluarga yang belum bayar, siap kirim pengingat sekali klik.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {state.muzakkis
                  .filter(m => !state.transaksis.find(t => t.muzakki_id === m.id))
                  .slice(0, 4)
                  .map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{m.nama}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">Kontak: {m.no_hp || 'Tidak ada'} | {m.jumlah_jiwa} Jiwa</span>
                      </div>
                      <button
                        onClick={() => triggerWhatsAppReminder(m)}
                        disabled={!m.no_hp}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1"
                      >
                        Kirim WA
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 4. MODALS AND FLOATING PANELS */}
      {/* Printable Receipt Modal */}
      <AnimatePresence>
        {activeReceipt && (
          <ReceiptModal
            transaksi={activeReceipt}
            onClose={() => setActiveReceipt(null)}
            namaMasjid={state.namaMasjid}
            alamatMasjid={state.alamatMasjid}
            kontakMasjid={state.kontakMasjid}
          />
        )}
      </AnimatePresence>

      {/* Config Rice Price Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4"
              id="config-price-modal"
            >
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-md font-bold text-gray-800 flex items-center gap-1.5">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  Atur Standar Harga Beras
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Konfigurasi nilai zakat fitrah jika diuangkan.</p>
              </div>

              <form onSubmit={handleUpdateHargaBeras} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Harga Beras per Liter (Rp)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">Rp</span>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={tempHargaBeras}
                      onChange={(e) => setTempHargaBeras(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 focus:outline-hidden focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block leading-relaxed italic">
                    * Contoh zakat: 1 Jiwa wajib membayar 3.5 Liter Beras. Jika harga beras Rp 12.000/L, maka nilai uang zakat = Rp 42.000 / jiwa.
                  </span>
                </div>

                <div className="flex gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-5 rounded-xl text-xs transition cursor-pointer"
                  >
                    Simpan Konfigurasi
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
