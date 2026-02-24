import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  
  // 1. OBTENER EL TOKEN
  // OJO: Cambia 'token' por el nombre real de tu cookie (ej: 'sb-access-token', 'auth', etc.)
  const token = request.cookies.get('token')?.value

  // 2. DEFINIR RUTAS
  const path = request.nextUrl.pathname
  
  // Rutas públicas: Donde NO debería estar si ya inició sesión
  const isPublicPath = path === '/login' || path === '/register'

  // 3. CASO: USUARIO LOGUEADO INTENTA ENTRAR A LOGIN
  // Si tiene token y está en /login, lo pateamos al dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 4. CASO: USUARIO NO LOGUEADO INTENTA ENTRAR A DASHBOARD
  // Si no tiene token y no está en ruta pública, lo mandamos a login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si todo está en orden, déjalo pasar
  return NextResponse.next()
}

// 5. CONFIGURACIÓN DE RUTAS A PROTEGER
export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*' // Protege /dashboard y todo lo que esté adentro
  ]
}