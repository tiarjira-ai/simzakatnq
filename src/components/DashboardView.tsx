/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Muzakki, Transaksi, Mustahik, Distribusi } from '../types';
import { formatCurrency } from '../data';
import { 
  Users, 
  Coins, 
  Flame, 
  Package, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Activity, 
  MapPin, 
  Scale, 
  AlertTriangle,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  muzakkis: Muzakki[];
  transaksis: Transaksi[];
  mustahiks: Mustahik[];
  distribusis: Distribusi[];
  hargaBeras: number;
}

export default function DashboardView({
  muzakkis,
  transaksis,
  mustahiks,
  distribusis,
  hargaBeras
}: DashboardViewProps) {
  const [selectedChartTab, setSelectedChartTab] = useState<'penerimaan' | 'distribusi'>('penerimaan');

  // Real-time clock for dashboard banner
  const [liveTime, setLiveTime] = React.useState(new Date());
  React.useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculations
  const totalKK = muzakkis.length;
  
  // Total Jiwa registered
  const totalJiwa = muzakkis.reduce((acc, m) => acc + m.jumlah_jiwa, 0);

  // Total Muzakki who paid (based on transactions)
  const paidMuzakkiIds = new Set(transaksis.map(t => t.muzakki_id));
  const totalMuzakkiBayar = paidMuzakkiIds.size;
  const totalJiwaBayar = transaksis.reduce((acc, t) => acc + t.jumlah_jiwa, 0);

  const totalMustahik = mustahiks.length;

  // Receipts
  const totalBerasDiterima = transaksis
    .filter(t => (t.jenis === 'beras' || t.jenis === 'campuran') && t.status === 'Valid')
    .reduce((acc, t) => acc + t.beras_liter, 0);

  const totalUangDiterima = transaksis
    .filter(t => (t.jenis === 'uang' || t.jenis === 'campuran') && t.status === 'Valid')
    .reduce((acc, t) => acc + t.nominal, 0);

  const totalInfaqDiterima = transaksis
    .filter(t => t.status === 'Valid')
    .reduce((acc, t) => acc + (t.infaq || 0), 0);

  // Distributions
  const totalBerasDisalurkan = distribusis.reduce((acc, d) => acc + d.beras_liter, 0);
  const totalUangDisalurkan = distribusis.reduce((acc, d) => acc + d.uang, 0);

  // Remainder
  const sisaBeras = Math.max(0, totalBerasDiterima - totalBerasDisalurkan);
  const sisaUang = Math.max(0, totalUangDiterima - totalUangDisalurkan);

  // Distribution Rates
  const persentaseBerasTersalurkan = totalBerasDiterima > 0 
    ? Math.round((totalBerasDisalurkan / totalBerasDiterima) * 100) 
    : 0;

  const persentaseUangTersalurkan = totalUangDiterima > 0 
    ? Math.round((totalUangDisalurkan / totalUangDiterima) * 100) 
    : 0;

  // Group by RT/RW for stats
  const rtStats = muzakkis.reduce((acc: { [key: string]: number }, m) => {
    const key = `RT ${m.rt}/RW ${m.rw}`;
    acc[key] = (acc[key] || 0) + m.jumlah_jiwa;
    return acc;
  }, {});

  // Group transactions by date for charts
  const getDailyPenerimaanData = () => {
    const dates: { [key: string]: { beras: number; uang: number } } = {};
    
    // Last 7 days fallback or actual dates
    transaksis.forEach(t => {
      const d = t.tanggal;
      if (!dates[d]) dates[d] = { beras: 0, uang: 0 };
      if (t.jenis === 'beras') {
        dates[d].beras += t.beras_liter;
      } else if (t.jenis === 'uang') {
        dates[d].uang += t.nominal;
      } else if (t.jenis === 'campuran') {
        dates[d].beras += t.beras_liter;
        dates[d].uang += t.nominal;
      }
    });

    const sortedDates = Object.keys(dates).sort();
    if (sortedDates.length === 0) {
      return [{ date: 'No Data', beras: 0, uang: 0, label: 'No Data' }];
    }
    
    return sortedDates.map(d => {
      // Format to readable short date
      const dateParts = d.split('-');
      const label = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : d;
      return {
        date: d,
        beras: dates[d].beras,
        uang: dates[d].uang,
        label
      };
    });
  };

  const getDailyDistribusiData = () => {
    const dates: { [key: string]: { beras: number; uang: number } } = {};
    
    distribusis.forEach(d => {
      const date = d.tanggal;
      if (!dates[date]) dates[date] = { beras: 0, uang: 0 };
      dates[date].beras += d.beras_liter;
      dates[date].uang += d.uang;
    });

    const sortedDates = Object.keys(dates).sort();
    if (sortedDates.length === 0) {
      return [{ date: 'No Data', beras: 0, uang: 0, label: 'No Data' }];
    }

    return sortedDates.map(d => {
      const dateParts = d.split('-');
      const label = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : d;
      return {
        date: d,
        beras: dates[d].beras,
        uang: dates[d].uang,
        label
      };
    });
  };

  const penerimaanChartData = getDailyPenerimaanData();
  const distribusiChartData = getDailyDistribusiData();

  // Helper to draw clean SVG charts
  const renderSVGChart = (data: Array<{ label: string; beras: number; uang: number }>, type: 'beras' | 'uang') => {
    const chartHeight = 160;
    const chartWidth = 500;
    const paddingX = 40;
    const paddingY = 20;

    const values = data.map(d => type === 'beras' ? d.beras : d.uang);
    const maxValue = Math.max(...values, type === 'beras' ? 10 : 100000);
    const scaleY = (chartHeight - paddingY * 2) / maxValue;
    const stepX = (chartWidth - paddingX * 2) / Math.max(data.length - 1, 1);

    const points = data.map((d, i) => {
      const x = paddingX + i * stepX;
      const y = chartHeight - paddingY - (type === 'beras' ? d.beras : d.uang) * scaleY;
      return { x, y, label: d.label, val: type === 'beras' ? d.beras : d.uang };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area Path
    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
      : '';

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[320px] h-[160px]">
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Fill Area */}
          {points.length > 1 && (
            <path
              d={areaD}
              fill={type === 'beras' ? 'url(#berasGrad)' : 'url(#uangGrad)'}
              className="opacity-20"
            />
          )}

          {/* Line */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke={type === 'beras' ? '#10b981' : '#3b82f6'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points and Tooltips */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill={type === 'beras' ? '#10b981' : '#3b82f6'}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Highlight Circle on hover */}
              <circle
                cx={p.x}
                cy={p.y}
                r="8"
                fill={type === 'beras' ? '#10b981' : '#3b82f6'}
                className="opacity-0 hover:opacity-20 transition-opacity"
              />
              {/* Tooltip text */}
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="text-[9px] font-bold font-mono fill-slate-700 hidden group-hover:block bg-white p-1"
              >
                {type === 'beras' ? `${p.val} L` : formatCurrency(p.val)}
              </text>
              {/* Label */}
              <text
                x={p.x}
                y={chartHeight - 4}
                textAnchor="middle"
                className="text-[9px] font-medium font-mono fill-slate-400"
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* Gradients */}
          <defs>
            <linearGradient id="berasGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
            <linearGradient id="uangGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-8" id="dashboard-view-root">
      {/* Quick Summary Intro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-slate-950 uppercase">IKHTISAR REAL-TIME</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            Rekapitulasi data penerimaan dan penyaluran zakat fitrah Masjid Nurul Qalam Pakkanrebete.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100 font-mono text-[10px] font-bold text-emerald-800 uppercase tracking-widest w-fit">
          <div className="flex items-center gap-1.5 leading-none">
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            LIVE CLOCK: <span className="text-emerald-950 font-black text-xs font-mono">{liveTime.toLocaleTimeString('id-ID')}</span>
          </div>
          <div className="text-[9px] text-emerald-700/80 font-bold border-t sm:border-t-0 sm:border-l border-emerald-200/60 pt-1.5 sm:pt-0 sm:pl-3">
            {liveTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Main Core Statistics - 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total KK */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-widest block">TOTAL MUZAKKI KK</span>
            <span className="text-4xl font-black text-slate-900 tracking-tight block">{totalKK} <span className="text-sm font-normal text-slate-400">KK</span></span>
            <span className="text-xs text-slate-400 block font-semibold font-mono uppercase tracking-wider">TERDATA DI SISTEM</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Total Jiwa */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-widest block">TOTAL JIWA TERDAFTAR</span>
            <span className="text-4xl font-black text-slate-900 tracking-tight block">{totalJiwa} <span className="text-sm font-normal text-slate-400">JIWA</span></span>
            <span className="text-xs text-emerald-600 block font-semibold font-mono uppercase tracking-wider flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {totalJiwaBayar} JIWA SUDAH BAYAR
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Flame className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Total Muzakki (Bayar) */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold text-blue-700 uppercase tracking-widest block">MUZAKKI AKTIF (LUNAS)</span>
            <span className="text-4xl font-black text-slate-900 tracking-tight block">{totalMuzakkiBayar} <span className="text-sm font-normal text-slate-400">KK</span></span>
            <span className="text-xs text-slate-400 block font-semibold font-mono uppercase tracking-wider">
              {totalKK > 0 ? `${Math.round((totalMuzakkiBayar / totalKK) * 100)}% RASIO PARTISIPASI` : '0%'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
            <Award className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Total Mustahik */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs flex items-center justify-between"
        >
          <div className="space-y-2">
            <span className="text-[9px] font-mono font-bold text-amber-700 uppercase tracking-widest block">TARGET MUSTAHIK</span>
            <span className="text-4xl font-black text-slate-900 tracking-tight block">{totalMustahik} <span className="text-sm font-normal text-slate-400">JIWA</span></span>
            <span className="text-xs text-amber-600 block font-semibold font-mono uppercase tracking-wider flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {mustahiks.filter(m => m.status_verifikasi === 'Terverifikasi').length} VERIFIKASI
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Received vs Distributed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BERAS STOCK BOX */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-950 text-md leading-snug">Lumbung & Gudang Beras</h3>
                <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Takaran: 3.5 Liter / Jiwa</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              STANDAR: Rp {hargaBeras.toLocaleString('id-ID')}/L
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100/50 text-center sm:text-left">
              <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-widest block">DITERIMA</span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-900 block mt-1 font-sans">{totalBerasDiterima} <span className="text-xs font-bold font-mono text-emerald-600">L</span></span>
              <span className="text-[10px] text-slate-400 mt-1 block">Zakat Beras</span>
            </div>
            <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-100 text-center sm:text-left">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">DISALURKAN</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-800 block mt-1 font-sans">{totalBerasDisalurkan} <span className="text-xs font-bold font-mono text-slate-400">L</span></span>
              <span className="text-[10px] text-slate-400 mt-1 block">{persentaseBerasTersalurkan}% Tersalur</span>
            </div>
            <div className="bg-orange-50/40 p-4 rounded-xl border border-orange-100/50 text-center sm:text-left">
              <span className="text-[9px] font-mono font-bold text-orange-600 uppercase tracking-widest block">SISA STOK</span>
              <span className="text-2xl sm:text-3xl font-black text-orange-900 block mt-1 font-sans">{sisaBeras} <span className="text-xs font-bold font-mono text-orange-500">L</span></span>
              <span className="text-[10px] text-orange-600/70 mt-1 block font-medium">Dalam Gudang</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-bold text-gray-500">
              <span>RASIO PENYALURAN BERAS</span>
              <span className="text-slate-900">{persentaseBerasTersalurkan}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, persentaseBerasTersalurkan)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* UANG STOCK BOX */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-950 text-md leading-snug">Kas & Keuangan Zakat</h3>
                <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Tunai, QRIS, & Transfer</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              IDR CURRENCY
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/50 text-center sm:text-left">
              <span className="text-[9px] font-mono font-bold text-blue-600 uppercase tracking-widest block">ZAKAT DITERIMA</span>
              <span className="text-lg sm:text-xl font-black text-blue-900 block mt-1.5 truncate font-sans">{formatCurrency(totalUangDiterima)}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Zakat Tunai</span>
            </div>
            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100/50 text-center sm:text-left">
              <span className="text-[9px] font-mono font-bold text-amber-600 uppercase tracking-widest block">INFAQ DITERIMA</span>
              <span className="text-lg sm:text-xl font-black text-amber-900 block mt-1.5 truncate font-sans">{formatCurrency(totalInfaqDiterima)}</span>
              <span className="text-[10px] text-amber-600 mt-1 block">Infaq Sukarela</span>
            </div>
            <div className="bg-orange-50/40 p-4 rounded-xl border border-orange-100/50 text-center sm:text-left">
              <span className="text-[9px] font-mono font-bold text-orange-600 uppercase tracking-widest block">TOTAL KAS AKTIF</span>
              <span className="text-lg sm:text-xl font-black text-orange-900 block mt-1.5 truncate font-sans">{formatCurrency(sisaUang + totalInfaqDiterima)}</span>
              <span className="text-[10px] text-orange-600/70 mt-1 block font-medium">Zakat & Infaq</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-bold text-gray-500">
              <span>RASIO PENYALURAN KAS UANG</span>
              <span className="text-slate-900">{persentaseUangTersalurkan}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, persentaseUangTersalurkan)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Daily Charts & Visual Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-6 gap-3">
          <div>
            <h3 className="font-serif font-black text-slate-950 text-base uppercase">GRAFIK AKTIVITAS HARIAN</h3>
            <p className="text-xs text-slate-500 mt-1">Analisis log harian penerimaan dan distribusi zakat.</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setSelectedChartTab('penerimaan')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedChartTab === 'penerimaan'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Penerimaan
            </button>
            <button
              onClick={() => setSelectedChartTab('distribusi')}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedChartTab === 'distribusi'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Distribusi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Beras chart */}
          <div className="space-y-4 bg-[#fcfcfb] p-5 rounded-xl border border-gray-200/80">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                VOLUME BERAS (LITER)
              </span>
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">REAL TIME</span>
            </div>
            {selectedChartTab === 'penerimaan' 
              ? renderSVGChart(penerimaanChartData, 'beras')
              : renderSVGChart(distribusiChartData, 'beras')
            }
          </div>

          {/* Uang chart */}
          <div className="space-y-4 bg-[#fcfcfb] p-5 rounded-xl border border-gray-200/80">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-bold text-blue-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                KAS KEUANGAN (RUPIAH)
              </span>
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">REAL TIME</span>
            </div>
            {selectedChartTab === 'penerimaan' 
              ? renderSVGChart(penerimaanChartData, 'uang')
              : renderSVGChart(distribusiChartData, 'uang')
            }
          </div>
        </div>
      </div>

      {/* RT/RW & Mustahik category breakdown bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mustahik categories */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs md:col-span-2 space-y-5">
          <div>
            <h4 className="font-serif font-black text-slate-950 text-sm uppercase">DISTRIBUSI ASNAF (TARGET MUSTAHIK)</h4>
            <p className="text-xs text-slate-500 mt-1">Pengelompokan jiwa penerima zakat fitrah terdata berdasarkan syariah.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-3.5">
              {['Fakir', 'Miskin', 'Amil', 'Muallaf', 'Gharim', 'Fisabilillah', 'Ibnu Sabil'].map(cat => {
                const count = mustahiks.filter(m => m.kategori === cat).length;
                const percent = mustahiks.length > 0 ? Math.round((count / mustahiks.length) * 100) : 0;
                
                let colorClass = 'bg-slate-400';
                if (cat === 'Fakir') colorClass = 'bg-rose-600';
                if (cat === 'Miskin') colorClass = 'bg-amber-500';
                if (cat === 'Amil') colorClass = 'bg-emerald-600';
                if (cat === 'Muallaf') colorClass = 'bg-purple-600';
                if (cat === 'Fisabilillah') colorClass = 'bg-blue-600';

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wide">
                      <span>{cat}</span>
                      <span>{count} Jiwa ({percent}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col justify-center items-center p-6 bg-slate-50/50 rounded-xl border border-gray-200 border-dashed text-center">
              <span className="text-3xl">🎯</span>
              <h5 className="font-serif font-bold text-slate-900 mt-3 text-xs uppercase tracking-wide">Penyaluran Tepat Sasaran</h5>
              <p className="text-[11px] text-slate-500 mt-1.5 max-w-[200px] leading-relaxed">
                Database tervalidasi menjamin penyaluran zakat dilakukan secara adil dan tepat sasaran.
              </p>
            </div>
          </div>
        </div>

        {/* RT/RW demographic distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h4 className="font-serif font-black text-slate-950 text-sm uppercase">KEPADATAN WILAYAH RT</h4>
              <p className="text-xs text-slate-500 mt-1">Konsentrasi jiwa pembayar zakat fitrah per wilayah.</p>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
              {Object.keys(rtStats).length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-mono">BELUM ADA DATA</div>
              ) : (
                Object.keys(rtStats).map(key => {
                  const percent = totalJiwa > 0 ? Math.round((rtStats[key] / totalJiwa) * 100) : 0;
                  return (
                    <div key={key} className="flex justify-between items-center p-3 bg-[#fcfcfb] rounded-xl border border-gray-150/80 hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">{key}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-slate-900">{rtStats[key]} Jiwa</span>
                        <span className="text-[9px] text-slate-400 block font-mono font-bold mt-0.5">{percent}%</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
