'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      const { cargo } = JSON.parse(session);
      if (cargo === 'FUNCIONARIO') router.push('/dashboard/funcionario');
      else router.push('/dashboard/operativo');
    }
  }, [router]);

  return null;
}