/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Muzakki, Transaksi, Mustahik, Distribusi, User } from '../types';
import { formatCurrency } from '../data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  Calendar, 
  Package, 
  Coins, 
  MapPin, 
  CheckSquare, 
  Clock 
} from 'lucide-react';
import { motion } from 'motion/react';

interface LaporanViewProps {
  muzakkis: Muzakki[];
  transaksis: Transaksi[];
  mustahiks: Mustahik[];
  distribusis: Distribusi[];
  hargaBeras: number;
  dkmApproved: boolean;
  onToggleDKMApproval: () => void;
  currentUser: User;
  namaMasjid?: string;
  alamatMasjid?: string;
  kontakMasjid?: string;
  tahunHijriah?: string;
  users?: User[];
}

export default function LaporanView({
  muzakkis,
  transaksis,
  mustahiks,
  distribusis,
  hargaBeras,
  dkmApproved,
  onToggleDKMApproval,
  currentUser,
  namaMasjid = 'Masjid Nurul Qalam',
  alamatMasjid = 'Pakkanrebete, Kabupaten Soppeng, Sulawesi Selatan',
  kontakMasjid = '0812-4567-8910',
  tahunHijriah = '1447',
  users = []
}: LaporanViewProps) {
  const [filterType, setFilterType] = useState<'harian' | 'mingguan' | 'rekap'>('rekap');
  const [filterRt, setFilterRt] = useState('Semua');
  const [filterKategori, setFilterKategori] = useState('Semua');

  // Candidate filters for signatures
  const panitiaCandidates = users.filter(u => u.role === 'admin' || u.role === 'panitia');
  const dkmCandidates = users.filter(u => u.role === 'dkm' || u.role === 'admin');

  const [selectedPanitiaId, setSelectedPanitiaId] = useState(() => {
    return panitiaCandidates[0]?.id || '';
  });
  const [selectedDkmId, setSelectedDkmId] = useState(() => {
    return dkmCandidates.find(u => u.role === 'dkm')?.id || dkmCandidates[0]?.id || '';
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const selectedPanitia = panitiaCandidates.find(u => u.id === selectedPanitiaId) || panitiaCandidates[0] || { nama: 'Andi Pratama', role: 'admin' };
  const selectedDkm = dkmCandidates.find(u => u.id === selectedDkmId) || dkmCandidates[0] || { nama: 'H. Andi Ahmad', role: 'dkm' };

  // Stats Calculations
  const totalMuzakki = transaksis.filter(t => t.status === 'Valid').length;
  const totalJiwa = transaksis.filter(t => t.status === 'Valid').reduce((acc, t) => acc + t.jumlah_jiwa, 0);

  const totalBerasDiterima = transaksis
    .filter(t => (t.jenis === 'beras' || t.jenis === 'campuran') && t.status === 'Valid')
    .reduce((acc, t) => acc + t.beras_liter, 0);

  const totalUangDiterima = transaksis
    .filter(t => (t.jenis === 'uang' || t.jenis === 'campuran') && t.status === 'Valid')
    .reduce((acc, t) => acc + t.nominal, 0);

  const totalInfaqDiterima = transaksis
    .filter(t => t.status === 'Valid')
    .reduce((acc, t) => acc + (t.infaq || 0), 0);

  const totalMustahik = mustahiks.length;

  const totalBerasDisalurkan = distribusis.reduce((acc, d) => acc + d.beras_liter, 0);
  const totalUangDisalurkan = distribusis.reduce((acc, d) => acc + d.uang, 0);

  const sisaBeras = Math.max(0, totalBerasDiterima - totalBerasDisalurkan);
  const sisaUang = Math.max(0, totalUangDiterima - totalUangDisalurkan);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    const element = document.getElementById('official-printable-report');
    if (!element) return;

    setIsGeneratingPDF(true);
    try {
      // Small delay to let any rendering/focus finish
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Regular expression to match oklch color declarations
          const oklchRegex = /oklch\(\s*([0-9.%]+)[\s,]+([0-9.%]+)[\s,]+([0-9.%]+)(?:\s*[\/,]\s*([0-9.%]+))?\s*\)/gi;

          const convertOklchToRgbString = (
            _match: string,
            lStr: string,
            cStr: string,
            hStr: string,
            aStr?: string
          ): string => {
            let l = parseFloat(lStr);
            if (lStr.endsWith('%')) l = parseFloat(lStr) / 100;

            let c = parseFloat(cStr);
            if (cStr.endsWith('%')) c = parseFloat(cStr) / 100;

            let h = parseFloat(hStr);

            let alpha = 1;
            if (aStr) {
              if (aStr.endsWith('%')) {
                alpha = parseFloat(aStr) / 100;
              } else {
                alpha = parseFloat(aStr);
              }
            }

            // OKLCH to sRGB conversion math
            const L = l;
            const a = c * Math.cos((h * Math.PI) / 180);
            const b = c * Math.sin((h * Math.PI) / 180);

            const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
            const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
            const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

            const l1 = l_ * l_ * l_;
            const m1 = m_ * m_ * m_;
            const s1 = s_ * s_ * s_;

            const r = +4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1;
            const g = -1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1;
            const bVal = -0.0041960863 * l1 - 0.7034186147 * m1 + 1.7076147010 * s1;

            const gamma = (x: number) => {
              return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
            };

            const R = Math.round(Math.max(0, Math.min(1, gamma(r))) * 255);
            const G = Math.round(Math.max(0, Math.min(1, gamma(g))) * 255);
            const B = Math.round(Math.max(0, Math.min(1, gamma(bVal))) * 255);

            if (aStr !== undefined) {
              return `rgba(${R}, ${G}, ${B}, ${alpha})`;
            } else {
              return `rgb(${R}, ${G}, ${B})`;
            }
          };

          // Process all <style> elements in cloned document
          const styles = clonedDoc.getElementsByTagName('style');
          for (let i = 0; i < styles.length; i++) {
            const style = styles[i];
            if (style.textContent) {
              style.textContent = style.textContent.replace(oklchRegex, convertOklchToRgbString);
            }
          }

          // Process all inline style attributes
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const styleAttr = el.getAttribute('style');
            if (styleAttr) {
              el.setAttribute('style', styleAttr.replace(oklchRegex, convertOklchToRgbString));
            }
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210; // A4 size width in mm
      const pageHeight = 297; // A4 size height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Laporan_Rekapitulasi_Zakat_Ramadhan_${new Date().getFullYear()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to printer if PDF download fails
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Export to Excel-compatible CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `REKAPITULASI AKHIR RAMADHAN - ${namaMasjid.toUpperCase()} ${alamatMasjid.toUpperCase()}\n\n`;
    csvContent += `Parameter,Nilai\n`;
    csvContent += `Total Kepala Keluarga Muzakki,${totalMuzakki} KK\n`;
    csvContent += `Total Jiwa Wajib Zakat,${totalJiwa} Jiwa\n`;
    csvContent += `Total Beras Zakat Fitrah Diterima,${totalBerasDiterima} Liter\n`;
    csvContent += `Total Uang Zakat Fitrah Diterima,${totalUangDiterima} Rupiah\n`;
    csvContent += `Total Infaq Sukarela Diterima,${totalInfaqDiterima} Rupiah\n`;
    csvContent += `Total Mustahik Terdaftar,${totalMustahik} Jiwa\n`;
    csvContent += `Total Beras Zakat Tersalurkan,${totalBerasDisalurkan} Liter\n`;
    csvContent += `Total Uang Zakat Tersalurkan,${totalUangDisalurkan} Rupiah\n`;
    csvContent += `Sisa Stok Beras di Gudang,${sisaBeras} Liter\n`;
    csvContent += `Sisa Saldo Kas Keuangan,${sisaUang} Rupiah\n`;
    csvContent += `Status Persetujuan Laporan Ketua DKM,${dkmApproved ? 'DISETUJUI / SAH' : 'BELUM DISETUJUI'}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_zakat_ramadhan_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8" id="laporan-view-root">
      {/* Title & Print buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-7 rounded-2xl border border-gray-150/70 shadow-xs print:hidden">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-black tracking-tight text-slate-950 flex items-center gap-2.5 uppercase">
            <FileText className="w-6 h-6 text-emerald-600" />
            LAPORAN & REKAP AKHIR
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Unduh laporan keuangan, ringkasan penerimaan zakat, dan status validasi DKM.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer border border-slate-200"
            id="export-csv-btn"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Ekspor CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className={`flex items-center gap-2 font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer border ${
              isGeneratingPDF 
                ? 'bg-amber-100 text-amber-800 border-amber-200 cursor-not-allowed animate-pulse'
                : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700/50'
            }`}
            id="download-pdf-btn"
          >
            <Download className="w-4 h-4" />
            {isGeneratingPDF ? 'Membuat PDF...' : 'Unduh PDF (A4)'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xs cursor-pointer border border-emerald-700/50"
            id="print-report-btn"
          >
            <Printer className="w-4 h-4" />
            Cetak PDF Resmi
          </button>
        </div>
      </div>

      {/* Main Official Printable Report Sheet */}
      <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-150/70 shadow-xs space-y-8 print:p-0 print:border-none print:shadow-none" id="official-printable-report">
        
        {/* Printable Official Kop Surat Header */}
        <div className="text-center border-b-4 border-double border-slate-900 pb-5">
          <h1 className="text-xl md:text-2xl font-serif font-black text-slate-950 tracking-wide uppercase">
            PANITIA RAMADHAN {namaMasjid}
          </h1>
          <p className="text-xs text-slate-600 font-bold font-mono uppercase mt-1 tracking-widest">
            {alamatMasjid}
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-1 font-bold uppercase tracking-wider">
            Sekretariat: Kompleks {namaMasjid} {kontakMasjid ? `| Kontak: ${kontakMasjid}` : ''}
          </p>
        </div>

        {/* Report Title */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-serif font-black text-slate-950 uppercase tracking-widest">
            LAPORAN REKAPITULASI AKHIR ZAKAT FITRAH
          </h2>
          <p className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">
            Periode: Ramadhan {tahunHijriah} H / {new Date().getFullYear()} M
          </p>
        </div>

        {/* Core Stats Recapitulation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Muzakki totals */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <h4 className="font-serif font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              Penerimaan (Muzakki)
            </h4>
            <div className="space-y-3 text-xs font-bold text-slate-600">
              <div className="flex justify-between">
                <span>Total KK Wajib Zakat:</span>
                <span className="text-slate-950 font-mono font-black">{totalMuzakki} KK</span>
              </div>
              <div className="flex justify-between">
                <span>Total Jiwa Terbayar:</span>
                <span className="text-slate-950 font-mono font-black">{totalJiwa} Orang</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  Total Beras Masuk:
                </span>
                <span className="text-emerald-800 font-mono font-black text-sm">{totalBerasDiterima} Liter</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-blue-600" />
                  Total Zakat Uang:
                </span>
                <span className="text-blue-800 font-mono font-black text-sm">{formatCurrency(totalUangDiterima)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <span className="text-xs">💖</span>
                  Total Infaq Masuk:
                </span>
                <span className="text-amber-800 font-mono font-black text-sm">{formatCurrency(totalInfaqDiterima)}</span>
              </div>
            </div>
          </div>

          {/* Mustahik totals */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-4">
            <h4 className="font-serif font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Penyaluran (Mustahik)
            </h4>
            <div className="space-y-3 text-xs font-bold text-slate-600">
              <div className="flex justify-between">
                <span>Mustahik Terdaftar:</span>
                <span className="text-slate-950 font-mono font-black">{totalMustahik} Jiwa</span>
              </div>
              <div className="flex justify-between">
                <span>Status Terverifikasi:</span>
                <span className="text-slate-950 font-mono font-black">
                  {mustahiks.filter(m => m.status_verifikasi === 'Terverifikasi').length} Jiwa
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  Beras Tersalurkan:
                </span>
                <span className="text-slate-900 font-mono font-black text-sm">{totalBerasDisalurkan} Liter</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-blue-600" />
                  Uang Tersalurkan:
                </span>
                <span className="text-slate-900 font-mono font-black text-sm">{formatCurrency(totalUangDisalurkan)}</span>
              </div>
            </div>
          </div>

          {/* Balances */}
          <div className="border border-slate-200 rounded-xl p-5 bg-[#fcfcfb] space-y-4">
            <h4 className="font-serif font-black text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse"></span>
              Sisa Gudang & Kas
            </h4>
            <div className="space-y-3 text-xs font-bold text-slate-600">
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  Sisa Beras:
                </span>
                <span className="text-slate-950 font-mono font-black text-sm bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  {sisaBeras} Liter
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-blue-600" />
                  Sisa Saldo Kas Zakat:
                </span>
                <span className="text-slate-950 font-mono font-black text-sm bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  {formatCurrency(sisaUang)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <span className="text-xs">💖</span>
                  Sisa Saldo Kas Infaq:
                </span>
                <span className="text-slate-950 font-mono font-black text-sm bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                  {formatCurrency(totalInfaqDiterima)}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono font-bold pt-3 border-t border-slate-200 leading-relaxed uppercase tracking-wide">
                * sisa akan dipindahkan ke kas operasional masjid.
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Table breakdown */}
        <div className="space-y-3">
          <h3 className="font-serif font-black text-slate-900 text-sm uppercase tracking-wide">Ringkasan Aktivitas Berdasarkan RT</h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden text-xs">
            <div className="grid grid-cols-6 bg-[#fcfcfb] font-mono font-bold text-slate-500 p-3.5 border-b border-gray-200 uppercase tracking-wider">
              <div>Wilayah / RT</div>
              <div className="text-center">Muzakki (KK)</div>
              <div className="text-center">Jiwa Terdaftar</div>
              <div className="text-right">Beras Masuk</div>
              <div className="text-right">Uang Masuk</div>
              <div className="text-right">Infaq Masuk</div>
            </div>
            {['01', '02', '03', '04', '05'].map(rtNum => {
              const rts = muzakkis.filter(m => m.rt === rtNum);
              const kkCount = rts.length;
              const jiwaCount = rts.reduce((acc, m) => acc + m.jumlah_jiwa, 0);
              
              // Transactions
              const rtMuzIds = new Set(rts.map(m => m.id));
              const txs = transaksis.filter(t => rtMuzIds.has(t.muzakki_id));
              const berasSum = txs.filter(t => t.jenis === 'beras' || t.jenis === 'campuran').reduce((acc, t) => acc + t.beras_liter, 0);
              const uangSum = txs.filter(t => t.jenis === 'uang' || t.jenis === 'campuran').reduce((acc, t) => acc + t.nominal, 0);
              const infaqSum = txs.reduce((acc, t) => acc + (t.infaq || 0), 0);

              return (
                <div key={rtNum} className="grid grid-cols-6 p-3.5 border-b border-gray-150 font-bold text-slate-700 hover:bg-slate-50/50 transition-all">
                  <div className="font-serif font-black text-slate-900">RT {rtNum}</div>
                  <div className="text-center font-mono font-black">{kkCount} KK</div>
                  <div className="text-center font-mono">{jiwaCount} Jiwa</div>
                  <div className="text-right font-mono font-black text-emerald-800">{berasSum} L</div>
                  <div className="text-right font-mono font-black text-blue-800">{formatCurrency(uangSum)}</div>
                  <div className="text-right font-mono font-black text-amber-700">{formatCurrency(infaqSum)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification Status Banner (Only visible on web) */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div className="space-y-1">
            <h4 className="font-serif font-black text-slate-900 text-sm flex items-center gap-1.5 uppercase tracking-wide">
              {dkmApproved ? (
                <>
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-900">Laporan Akhir Telah Sah & Disetujui DKM</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                  <span className="text-amber-800">Menunggu Persetujuan Ketua DKM</span>
                </>
              )}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl font-medium">
              Ketua DKM (Dewan Kemakmuran Masjid) memiliki wewenang penuh untuk memeriksa dashboard ini dan menyetujui laporan akhir Ramadhan guna audit keuangan masjid.
            </p>
          </div>

          {/* Interactive DKM Button if current user has authorization */}
          {currentUser.role === 'dkm' || currentUser.role === 'admin' ? (
            <button
              onClick={onToggleDKMApproval}
              className={`font-bold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider ${
                dkmApproved
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border border-emerald-700/50'
              }`}
            >
              {dkmApproved ? 'Batalkan Persetujuan' : 'Setujui Laporan Akhir'}
            </button>
          ) : (
            <div className="text-[10px] text-slate-400 bg-slate-100 px-3 py-2 rounded-lg font-mono font-bold border border-slate-200 uppercase tracking-widest">
              🔒 DKM / Admin Only
            </div>
          )}
        </div>

        {/* Printable Official Signatures and Mosque Seal Stamps */}
        <div className="grid grid-cols-2 pt-10 border-t border-slate-200 text-center text-xs">
          {/* Left Signature - Ketua Panitia */}
          <div className="flex flex-col justify-between h-36">
            <span className="font-mono font-bold text-slate-500 uppercase tracking-widest block">Ketua Panitia Zakat</span>
            <div className="text-xs font-serif text-slate-400 italic">Ditandatangani Secara Digital</div>
            <div className="space-y-1">
              {/* Dynamic selector visible only on screen */}
              <div className="print:hidden">
                {panitiaCandidates.length > 0 ? (
                  <select
                    value={selectedPanitiaId}
                    onChange={(e) => setSelectedPanitiaId(e.target.value)}
                    className="mx-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold px-2 py-1 rounded-lg text-xs cursor-pointer focus:outline-hidden focus:border-emerald-500 font-sans"
                  >
                    {panitiaCandidates.map(u => (
                      <option key={u.id} value={u.id}>{u.nama} ({u.role === 'admin' ? 'Admin' : 'Panitia'})</option>
                    ))}
                  </select>
                ) : (
                  <span className="font-bold text-slate-800">{selectedPanitia.nama}</span>
                )}
              </div>
              {/* Print-only static representation */}
              <span className="hidden print:block font-bold text-slate-800 border-b border-slate-400 pb-0.5 px-6 w-fit mx-auto">
                {selectedPanitia.nama}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono block">
                {selectedPanitia.role === 'admin' ? 'Ketua Panitia / Admin' : 'Anggota Panitia / Amil'}
              </span>
            </div>
          </div>

          {/* Right Signature - Ketua DKM (with Seal Overlay if Approved!) */}
          <div className="flex flex-col justify-between h-36 relative">
            <span className="font-mono font-bold text-slate-500 uppercase tracking-widest block">Ketua DKM Masjid</span>
            
            {/* Mosque Circular Seal Overlay if Approved! */}
            {dkmApproved ? (
              <motion.div
                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                animate={{ scale: 1, opacity: 1, rotate: -15 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border-4 border-dashed border-emerald-600/50 rounded-full flex flex-col items-center justify-center p-1 pointer-events-none"
              >
                <div className="text-emerald-600 font-extrabold text-[8px] uppercase tracking-tighter font-mono text-center max-w-[90px] truncate">{namaMasjid.toUpperCase()}</div>
                <div className="text-emerald-700 font-black text-xs my-0.5 tracking-wider border-y border-dashed border-emerald-600/50 px-2 py-0.5 font-mono">SAH / VALID</div>
                <div className="text-emerald-600 font-extrabold text-[7px] uppercase tracking-tighter font-mono text-center max-w-[90px] truncate">{(alamatMasjid.split(',')[0] || 'PAKKANREBETE').toUpperCase()}</div>
              </motion.div>
            ) : (
              <div className="text-xs font-serif text-slate-300 italic">Belum Disetujui</div>
            )}

            <div className="space-y-1 z-10">
              {/* Dynamic selector visible only on screen */}
              <div className="print:hidden">
                {dkmCandidates.length > 0 ? (
                  <select
                    value={selectedDkmId}
                    onChange={(e) => setSelectedDkmId(e.target.value)}
                    className="mx-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold px-2 py-1 rounded-lg text-xs cursor-pointer focus:outline-hidden focus:border-emerald-500 font-sans"
                  >
                    {dkmCandidates.map(u => (
                      <option key={u.id} value={u.id}>{u.nama} ({u.role === 'dkm' ? 'Ketua DKM' : 'Admin'})</option>
                    ))}
                  </select>
                ) : (
                  <span className="font-bold text-slate-800">{selectedDkm.nama}</span>
                )}
              </div>
              {/* Print-only static representation */}
              <span className="hidden print:block font-bold text-slate-800 border-b border-slate-400 pb-0.5 px-6 w-fit mx-auto">
                {selectedDkm.nama}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-mono block">
                {selectedDkm.role === 'dkm' ? 'Ketua DKM Masjid' : 'Admin Masjid / Amil'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
