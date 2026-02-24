// src/types/index.ts

// src/types/index.ts
export type Rol = 'FUNCIONARIO' | 'OPERATIVO';

export interface Usuario {
  id: string; // Tu API manda UUID
  nombre: string;
  usuario: string;
  password?: string;
  rol: Rol; // Cambiado de 'cargo' a 'rol'
}

export interface Ticket {
  id?: number;
  nroTicket: string;
  importe: number;
  idUnico: string;
  estadoTicket: string;
  gestionado: boolean;
  codDevolucion?: string;
}

export interface Reclamo {
  id?: string;
  nroReclamo: string;
  tipoDocumento: string;
  documentoCliente: string;
  completado: boolean;
  fechaTrx?: string;
  tickets: Ticket[];
  createdAt?: string;
}