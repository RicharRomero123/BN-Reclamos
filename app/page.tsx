'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import Cookies from 'js-cookie'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Enviamos el usuario y contraseña (el usuario ya va sin espacios gracias al onChange)
      const data = await authService.login(usuario, password);
      
      Cookies.set('token', data.token || 'sesion-activa', { expires: 1 }); 

      router.push('/dashboard'); 

    } catch (err: any) {
      console.error(err);
      setError('Usuario o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 font-sans">
      
      {/* 1. COLUMNA IZQUIERDA: FORMULARIO */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          {/* HEADER CON LOGO */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-6">
              <img 
                src="https://res.cloudinary.com/dlfqwehlo/image/upload/v1771904552/images_rdqezh.png" 
                alt="Logo BN"
                className="h-24 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300" 
              />
            </div>
            
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Sistema BN Reclamos
              </h1>
              <p className="text-slate-500 mt-2">
                Ingresa tus credenciales para acceder.
              </p>
            </div>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            
            {/* Input Usuario */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Usuario</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                {/* --- AQUÍ ESTÁ EL CAMBIO --- */}
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white shadow-sm"
                  placeholder="Ej: RVRC"
                  value={usuario}
                  onChange={(e) => {
                    // .replace(/\s/g, '') elimina TODOS los espacios en tiempo real
                    // Si quieres que sea mayúscula automática también, usa: 
                    // e.target.value.replace(/\s/g, '').toUpperCase()
                    setUsuario(e.target.value.replace(/\s/g, ''));
                  }}
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Mensaje de Error Animado */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Validando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>
          
          <p className="text-center text-xs text-slate-400 mt-8">
            © 2024 Banco de la Nación. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>

      {/* 2. COLUMNA DERECHA: ARTE VISUAL */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-slate-900 opacity-90" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20"
        />
        <div className="relative z-10 text-white max-w-md text-center p-8 backdrop-blur-md bg-white/5 rounded-3xl border border-white/10 shadow-2xl">
          <div className="mb-6 flex justify-center">
             <div className="bg-white/10 p-3 rounded-2xl border border-white/20">
               <ShieldCheck className="h-8 w-8 text-blue-200" />
             </div>
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Portal de Operaciones</h2>
          <p className="text-blue-100/80 mb-8 leading-relaxed font-light">
            Plataforma centralizada para la gestión eficiente de reclamos y seguimiento transaccional.
          </p>
          <div className="relative h-auto w-full flex justify-center gap-4">
             <motion.div 
               initial={{ y: 10, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="bg-white/10 backdrop-blur-sm p-2 px-4 rounded-full border border-white/10 flex items-center gap-3"
             >
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-[10px] font-bold text-white tracking-widest">SISTEMA EN LÍNEA</span>
             </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}