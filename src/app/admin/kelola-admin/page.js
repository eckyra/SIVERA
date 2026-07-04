'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function KelolaAdmin() {
  const [admins, setAdmins] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  const fetchAdmins = async () => {
    const { data } = await supabase.from('admins').select('*');
    if (data) setAdmins(data);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('admins').insert({ username, password, role: 'admin' });
    if (error) {
      setStatus(`Gagal: ${error.message}`);
    } else {
      setStatus('Admin Baru Berhasil Ditambahkan.');
      setUsername(''); setPassword('');
      fetchAdmins();
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-md bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Tambah Admin Baru</h2>
        <form onSubmit={handleCreateAdmin} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none" />
          </div>
          <button type="submit" className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl shadow-lg">
            Buat Akun Admin
          </button>
        </form>
        {status && <p className="text-xs text-teal-400 text-center mt-3">{status}</p>}
      </div>

      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden max-w-xl shadow-xl">
        <div className="p-4 border-b border-slate-700/50"><h3 className="font-bold text-white">Daftar Admin Aktif</h3></div>
        <ul className="divide-y divide-slate-800 text-sm p-4 space-y-2">
          {admins.map(adm => (
            <li key={adm.id} className="flex justify-between items-center py-2 text-slate-300">
              <span>{adm.username}</span>
              <span className={`px-2 py-0.5 rounded text-xs ${adm.role === 'superadmin' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>{adm.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
