'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default function LoginAdmin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Cek kecocokan data ke tabel admins di Supabase
    const { data, error: err } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (err || !data) {
      setError('Username atau Password salah, Mas!');
    } else {
      // Simpan session sederhana di localStorage agar bisa diakses di dashboard
      localStorage.setItem('admin_role', data.role);
      localStorage.setItem('admin_user', data.username);
      
      // Alihkan langsung ke dashboard admin utama
      router.push('/admin');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="w-full max-w-sm bg-slate-800/40 backdrop-blur-md p-8 rounded-2xl border border-slate-700/60 shadow-2xl">
        <h2 className="text-2xl font-extrabold text-white text-center mb-1">PresenSight Admin</h2>
        <p className="text-xs text-slate-400 text-center mb-6">Silakan masuk untuk mengelola sistem absensi</p>
        
        {error && <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl text-xs text-center mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500" placeholder="admin" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-teal-500" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 active:scale-[0.99] transition text-slate-950 font-bold rounded-xl text-sm mt-2 shadow-lg shadow-teal-500/10">
            Masuk Sistem
          </button>
        </form>
      </div>
    </div>
  );
}
