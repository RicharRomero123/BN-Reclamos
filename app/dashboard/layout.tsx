'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Usuario } from '@/types';
import { ClipboardList, LogOut, User, LayoutDashboard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (!session) {
      router.push('/');
    } else {
      try {
        const parsedUser = JSON.parse(session);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('user_session');
        router.push('/');
      }
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        <p className="mt-4 text-gray-600 font-medium">Cargando sesión...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- NAVBAR --- */}
      <nav className="bg-slate-900 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo y Nombre del Sistema */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none tracking-tight">BN RECLAMOS</span>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-widest">Plataforma Gestión</span>
              </div>
            </div>

            {/* Info Usuario y Acciones */}
            <div className="flex items-center gap-4 sm:gap-8">
              
              {/* Badge de Usuario */}
              <div className="hidden md:flex flex-col items-end border-r border-slate-700 pr-4">
                <span className="text-sm font-bold text-slate-100">{user.nombre}</span>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-blue-400" />
                  <span className="text-[11px] text-slate-400 uppercase font-bold">{user.rol}</span>
                </div>
              </div>

              {/* Mobile User Icon */}
              <div className="md:hidden bg-slate-800 p-2 rounded-full">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              
              {/* Botón Salir */}
              <button 
                onClick={handleLogout}
                className="group flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/20"
              >
                <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- CABECERA DE BIENVENIDA (OPCIONAL) --- */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center gap-2 text-slate-500 text-sm">
           <LayoutDashboard className="h-4 w-4" />
           <span>Dashboard</span>
           <span>/</span>
           <span className="text-slate-900 font-medium capitalize">{user.rol?.toLowerCase()}</span>
        </div>
      </div>

      {/* --- CONTENIDO DINÁMICO --- */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}