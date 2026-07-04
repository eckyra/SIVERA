'use client';
import { useEffect, useState } from 'react';
import { Users, CheckCircle, Clock, MapPin } from 'lucide-react';

export default function DashboardAdmin() {
  // Simulasi data dashboard, Mas Ecky bisa mengintegrasikannya dengan tarikan data log dari Supabase atau API Sheets
  const [stats, setStats] = useState({ totalTeknisi: 42, hadir: 38, telat: 2, absen: 2 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Ringkasan</h1>
        <p className="text-slate-400 mt-1">Status dan metrik kehadiran teknisi secara real-time.</p>
      </div>

      {/* Grid Statistik yang Elegan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Total Teknisi</p>
            <p className="text-2xl font-bold text-white mt-2">{stats.totalTeknisi}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Users size={24} /></div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Hadir Hari Ini</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2">{stats.hadir}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><CheckCircle size={24} /></div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Terlambat</p>
            <p className="text-2xl font-bold text-amber-400 mt-2">{stats.telat}</p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400"><Clock size={24} /></div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Belum Absen</p>
            <p className="text-2xl font-bold text-rose-400 mt-2">{stats.absen}</p>
          </div>
          <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><MapPin size={24} /></div>
        </div>
      </div>

      {/* Tabel Laporan Log Absensi Terkini */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white">Log Kehadiran Terkini</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-700/40">
                <th className="p-4">NIK</th>
                <th className="p-4">Nama Teknisi</th>
                <th className="p-4">Unit</th>
                <th className="p-4">Service Area</th>
                <th className="p-4">Masuk</th>
                <th className="p-4">Pulang</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {/* Simulasi Baris Data */}
              <tr className="hover:bg-slate-800/20 transition">
                <td className="p-4 font-mono text-slate-400">NIK-02401</td>
                <td className="p-4 font-medium text-white">Ecky Rakhmat</td>
                <td className="p-4">CCAN</td>
                <td className="p-4">Probolinggo</td>
                <td className="p-4 text-emerald-400">07:45</td>
                <td className="p-4 text-slate-500">—</td>
                <td className="p-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-xs border border-emerald-500/20">Tepat Waktu</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
