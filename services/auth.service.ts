// src/services/auth.service.ts
import axios from 'axios';

// Forzamos la lectura o usamos un string directo si falla
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-bn-8.onrender.com/api';

export const authService = {
  async login(usuario: string, password: string) {
    // Esto imprimirá en la consola del navegador la URL real que se está usando
    console.log("Conectando a:", `${API_URL}/usuarios/login`);
    
    try {
      const response = await axios.post(`${API_URL}/usuarios/login`, {
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