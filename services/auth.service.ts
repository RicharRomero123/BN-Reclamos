// src/services/auth.service.ts
import axios from 'axios';

// Forzamos la lectura o usamos un string directo si falla
const API_URL = 'https://unbased-pallidly-donn.ngrok-free.dev/api';

// 1. CREAMOS LA INSTANCIA CON EL HEADER PARA NGROK
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true' // <--- ESTO ES VITAL
  }
});

export const authService = {
  async login(usuario: string, password: string) {
    // Esto imprimirá en la consola del navegador la URL real que se está usando
    console.log("Conectando a:", `${API_URL}/usuarios/login`);
    
    try {
      // 2. USAMOS 'api.post' EN LUGAR DE 'axios.post'
      // Nota: Como ya definimos baseURL arriba, aquí solo ponemos la parte final de la ruta
      // O si prefieres mantener la URL completa explícita, también funciona, pero la instancia inyecta el header.
      
      const response = await api.post('/usuarios/login', {
        usuario,
        password
      });
      
      if (response.data) {
        localStorage.setItem('user_session', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error: any) {
      console.error("Error en login:", error);
      throw error;
    }
  }
};