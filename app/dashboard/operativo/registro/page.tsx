'use client';

import { useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';

const API_URL =  'https://service-bn-8.onrender.com/api';

export default function OperativoPage() {
  // Estado para la cabecera del reclamo
  const [reclamo, setReclamo] = useState({
    tipoDocumento: '',
    documentoCliente: '',
    nroReclamo: '',
    fechaTrx: '', // Formato yyyy-mm-dd para el input date
  });

  // Estado para la lista de tickets
  const [tickets, setTickets] = useState([
    { nroTicket: '', importe: 0, idUnico: '', estadoTicket: '', codDevolucion: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Formatear fecha de yyyy-mm-dd a dd-MM-yyyy para el backend
  const formatFechaParaBackend = (fecha: string) => {
    if (!fecha) return null;
    const [year, month, day] = fecha.split('-');
    return `${day}-${month}-${year}`;
  };

  const agregarTicket = () => {
    setTickets([...tickets, { nroTicket: '', importe: 0, idUnico: '', estadoTicket: '', codDevolucion: '' }]);
  };

  const eliminarTicket = (index: number) => {
    const nuevosTickets = tickets.filter((_, i) => i !== index);
    setTickets(nuevosTickets);
  };

  const handleTicketChange = (index: number, field: string, value: any) => {
    const nuevosTickets = [...tickets];
    nuevosTickets[index] = { ...nuevosTickets[index], [field]: value };
    setTickets(nuevosTickets);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const payload = {
      ...reclamo,
      fechaTrx: formatFechaParaBackend(reclamo.fechaTrx),
      tickets: tickets
    };

    try {
      const res = await axios.post(`${API_URL}/reclamos`, payload);
      console.log("Respuesta del servidor:", res.data);
      setSuccess(true);
      // Limpiar formulario tras éxito
      setReclamo({ tipoDocumento: '', documentoCliente: '', nroReclamo: '', fechaTrx: '' });
      setTickets([{ nroTicket: '', importe: 0, idUnico: '', estadoTicket: '', codDevolucion: '' }]);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* CABECERA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            Datos Generales del Reclamo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo Documento</label>
              <select 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                value={reclamo.tipoDocumento}
                onChange={(e) => setReclamo({...reclamo, tipoDocumento: e.target.value})}
              >
                <option value="">Seleccione...</option>
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nro Documento</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                value={reclamo.documentoCliente}
                onChange={(e) => setReclamo({...reclamo, documentoCliente: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nro Reclamo</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                value={reclamo.nroReclamo}
                onChange={(e) => setReclamo({...reclamo, nroReclamo: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha Transacción</label>
              <input 
                type="date" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-600"
                value={reclamo.fechaTrx}
                onChange={(e) => setReclamo({...reclamo, fechaTrx: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* LISTA DE TICKETS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Detalle de Tickets</h2>
            <button 
              type="button" 
              onClick={agregarTicket}
              className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 font-bold transition-colors"
            >
              <Plus className="h-4 w-4" /> Añadir Ticket
            </button>
          </div>

          <div className="space-y-4">
            {tickets.map((ticket, index) => (
              <div key={index} className="p-4 border rounded-xl bg-slate-50 relative group">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Nro Ticket</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md text-sm text-slate-600"
                      value={ticket.nroTicket}
                      onChange={(e) => handleTicketChange(index, 'nroTicket', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Importe</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full p-2 border rounded-md text-sm text-slate-600"
                      value={ticket.importe}
                      onChange={(e) => handleTicketChange(index, 'importe', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">ID Único</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md text-sm text-slate-600"
                      value={ticket.idUnico}
                      onChange={(e) => handleTicketChange(index, 'idUnico', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Estado Ticket</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md text-sm text-slate-600"
                      value={ticket.estadoTicket}
                      onChange={(e) => handleTicketChange(index, 'estadoTicket', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cod. Devolución</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded-md text-sm text-slate-600"
                      value={ticket.codDevolucion}
                      onChange={(e) => handleTicketChange(index, 'codDevolucion', e.target.value)}
                    />
                  </div>
                </div>

                {tickets.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => eliminarTicket(index)}
                    className="absolute top-2 right-2 p-1.5 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BOTON GUARDAR */}
        <div className="flex flex-col items-center gap-4">
          <button 
            type="submit"
            disabled={loading}
            className={`w-full md:w-64 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <> <Save className="h-5 w-5" /> Guardar Reclamo </>
            )}
          </button>

          {success && (
            <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg animate-bounce">
              <CheckCircle2 className="h-5 w-5" /> Reclamo guardado en Aiven con éxito
            </div>
          )}
        </div>
      </form>
    </div>
  );
}