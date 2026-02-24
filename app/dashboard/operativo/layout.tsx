'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FilePlus, TableProperties } from 'lucide-react';

export default function OperativoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Nuevo Registro', href: '/dashboard/operativo/registro', icon: FilePlus },
    { name: 'Ver Historial', href: '/dashboard/operativo/tabla', icon: TableProperties },
  ];

  return (
    <div className="space-y-6">
      {/* --- SUB-NAVBAR PARA OPERATIVO --- */}
      <div className="flex border-b border-slate-200 gap-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all ${
                isActive 
                  ? 'border-b-2 border-blue-600 text-blue-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </Link>
          );
        })}
      </div>

      {/* --- CONTENIDO DE LAS RUTAS HIJAS --- */}
      <div className="animate-in fade-in duration-500">
        {children}
      </div>
    </div>
  );
}