/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaksi } from '../types';
import { formatCurrency } from '../data';
import { X, Printer, CheckCircle, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReceiptModalProps {
  transaksi: Transaksi | null;
  onClose: () => void;
}

export default function ReceiptModal({ transaksi, onClose }: ReceiptModalProps) {
  const [showScannerSim, setShowScannerSim] = useState(false);

  if (!transaksi) return null;

  // Format QR Data
  const qrData = encodeURIComponent(
    `Masjid Nurul Qalam Pakkanrebete\nID: ${transaksi.id}\nMuzakki: ${transaksi.muzakki_nama}\nJiwa: ${transaksi.jumlah_jiwa}\nZakat: ${
      transaksi.jenis === 'beras' 
        ? transaksi.beras_liter + ' Ltr Beras' 
        : transaksi.jenis === 'uang'
          ? formatCurrency(transaksi.nominal)
          : `${transaksi.beras_liter} Ltr Beras + ${formatCurrency(transaksi.nominal)}`
    }\nTanggal: ${transaksi.tanggal}\nStatus: VALID`
  );
  
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200/90 print:p-0 print:shadow-none print:rounded-none"
        id="receipt-modal-container"
      >
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-150 bg-[#fcfcfb] print:hidden">
          <h3 className="text-sm font-serif font-black text-slate-950 flex items-center gap-2 uppercase tracking-wide">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            BUKTI PEMBAYARAN ZAKAT
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
            id="close-receipt-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-8 print:p-0" id="printable-receipt">
          {/* Mosque Header */}
          <div className="text-center border-b-2 border-dashed border-gray-200 pb-5 mb-5">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-full mb-2 print:hidden">
              <span className="text-2xl font-bold text-emerald-700">🕌</span>
            </div>
            <h2 className="text-xl font-serif font-black text-slate-950 tracking-wide uppercase">
              Masjid Nurul Qalam
            </h2>
            <p className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">
              Pakkanrebete, Kabupaten Soppeng, Sulawesi Selatan
            </p>
            <div className="mt-2.5 inline-block bg-emerald-100/60 text-emerald-800 text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest print:hidden">
              BUKTI PEMBAYARAN RESMI
            </div>
          </div>

          {/* Receipt Title */}
          <div className="text-center mb-5">
            <h4 className="text-sm font-serif font-black text-slate-900 tracking-widest uppercase">
              BUKTI PEMBAYARAN ZAKAT FITRAH
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-1 uppercase tracking-wider font-semibold">
              No. Transaksi: <span className="font-bold text-slate-800 font-mono">{transaksi.id}</span>
            </p>
          </div>

          {/* Details Table */}
          <div className="space-y-3.5 mb-6 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-slate-500 font-mono font-bold uppercase tracking-wider">Muzakki (KK)</span>
              <span className="text-slate-900 font-serif font-black text-right uppercase text-sm">{transaksi.muzakki_nama}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-slate-500 font-mono font-bold uppercase tracking-wider">Jumlah Jiwa</span>
              <span className="text-slate-900 font-bold font-mono">{transaksi.jumlah_jiwa} Orang</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-slate-500 font-mono font-bold uppercase tracking-wider">Jenis Pembayaran</span>
              <span className="text-slate-900 font-mono font-bold capitalize bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                {transaksi.jenis === 'campuran' ? 'Beras + Uang (Campuran)' : transaksi.jenis}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-slate-500 font-mono font-bold uppercase tracking-wider">Jumlah Pembayaran</span>
              <span className="text-slate-950 font-serif font-black text-sm md:text-base text-emerald-800 text-right">
                {transaksi.jenis === 'beras' 
                  ? `${transaksi.beras_liter} Liter Beras` 
                  : transaksi.jenis === 'uang'
                    ? formatCurrency(transaksi.nominal)
                    : `${transaksi.beras_liter} L Beras + ${formatCurrency(transaksi.nominal)}`}
              </span>
            </div>
            {(transaksi.jenis === 'uang' || transaksi.jenis === 'campuran') && transaksi.metode_pembayaran && (
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-slate-500 font-mono font-bold uppercase tracking-wider">Metode</span>
                <span className="text-slate-900 font-mono font-bold uppercase">{transaksi.metode_pembayaran}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-slate-500 font-mono font-bold uppercase tracking-wider">Tanggal Bayar</span>
              <span className="text-slate-900 font-mono font-bold">{transaksi.tanggal}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
              <span className="text-slate-500 font-mono font-bold uppercase tracking-wider">Amil / Petugas</span>
              <span className="text-slate-900 font-mono font-bold uppercase tracking-wide">{transaksi.petugas}</span>
            </div>
          </div>

          {/* Footer Sign & QR Code */}
          <div className="grid grid-cols-2 gap-4 items-center pt-4 border-t-2 border-dashed border-gray-100">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <img
                src={qrImageUrl}
                alt="Verification QR Code"
                className="w-28 h-28 border border-gray-200 p-1 bg-white rounded-md"
                referrerPolicy="no-referrer"
              />
              <span className="text-[10px] text-slate-400 font-mono mt-1 uppercase tracking-widest font-bold">
                Verifikasi QR
              </span>
            </div>

            {/* Signature Area */}
            <div className="text-center flex flex-col justify-between h-28 py-1">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                Sengkang, {transaksi.tanggal}
              </span>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Amil Panitia</div>
              <div>
                <div className="w-24 border-b border-slate-300 mx-auto"></div>
                <span className="text-xs font-serif font-black text-slate-800 mt-1 block uppercase">
                  {transaksi.petugas}
                </span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="text-center mt-6 text-[10px] font-medium text-slate-400 leading-relaxed border-t border-gray-100 pt-4 uppercase tracking-wider">
            "Semoga Allah memberikan pahala atas apa yang telah engkau berikan, memberikan keberkahan atas apa yang engkau sisakan, dan menjadikannya pembersih bagimu."
          </div>
        </div>

        {/* Action Buttons - Hidden on Print */}
        <div className="flex flex-col gap-2 p-6 bg-[#fcfcfb] border-t border-gray-150 print:hidden">
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all uppercase tracking-wider text-xs cursor-pointer border border-emerald-700/50"
              id="print-receipt-btn"
            >
              <Printer className="w-4 h-4" />
              Cetak Bukti
            </button>
            <button
              onClick={() => setShowScannerSim(true)}
              className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl transition-all text-xs border border-gray-250 uppercase tracking-wider cursor-pointer"
              id="simulate-scan-btn"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Simulasi QR
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 py-1.5 transition-all cursor-pointer uppercase tracking-wider"
          >
            Tutup
          </button>
        </div>

        {/* Scanner Simulation Panel */}
        <AnimatePresence>
          {showScannerSim && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="absolute inset-0 z-10 bg-slate-950 text-white p-6 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono font-bold text-xs tracking-wider text-emerald-400">QR CODE SCANNER VERIFIED</span>
                </div>
                <button
                  onClick={() => setShowScannerSim(false)}
                  className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="my-auto space-y-4">
                <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="font-serif font-black text-lg text-white uppercase tracking-wider">Zakat Fitrah Valid</h4>
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Verifikasi Sistem Masjid Nurul Qalam Pakkanrebete</p>
                </div>

                <div className="bg-black/40 rounded-xl p-4.5 font-mono text-xs space-y-2.5 border border-slate-900">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">ID TRANSAKSI:</span>
                    <span className="text-emerald-400 font-bold">{transaksi.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">NAMA MUZAKKI:</span>
                    <span className="text-white font-bold uppercase">{transaksi.muzakki_nama}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">JUMLAH JIWA:</span>
                    <span className="text-white font-bold">{transaksi.jumlah_jiwa} Orang</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">TIPE ZAKAT:</span>
                    <span className="text-white font-bold uppercase">{transaksi.jenis === 'campuran' ? 'Beras + Uang' : transaksi.jenis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">JUMLAH BAYAR:</span>
                    <span className="text-emerald-400 font-black">
                      {transaksi.jenis === 'beras' 
                        ? `${transaksi.beras_liter} Liter Beras` 
                        : transaksi.jenis === 'uang'
                          ? formatCurrency(transaksi.nominal)
                          : `${transaksi.beras_liter} L Beras + ${formatCurrency(transaksi.nominal)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">TANGGAL BAYAR:</span>
                    <span className="text-white font-bold">{transaksi.tanggal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold uppercase tracking-wider">AMIL PETUGAS:</span>
                    <span className="text-white font-bold uppercase">{transaksi.petugas}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowScannerSim(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer text-center uppercase tracking-widest text-xs border border-emerald-700/50"
              >
                Selesai Verifikasi
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
