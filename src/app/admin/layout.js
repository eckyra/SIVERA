'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950">
      {/* Sidebar Menu */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col shrink-0">
        <h2 className="text-xl font-bold text-teal-400 mb-8 tracking-wide">PresenSight Admin</h2>
        
        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="block px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-teal-400 rounded-xl transition">
            Dashboard
          </Link>
          <Link href="/admin/tambah-teknisi" className="block px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-teal-400 rounded-xl transition">
            Tambah Teknisi
          </Link>
          <Link href="/admin/kelola-admin" className="block px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-teal-400 rounded-xl transition">
            Kelola Admin
          </Link>
        </nav>
        
        <button onClick={handleLogout} className="mt-8 px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 rounded-xl text-left transition">
          Logout Keluar
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
