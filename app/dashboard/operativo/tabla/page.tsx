'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  ChevronLeft, ChevronRight, Filter, CheckCircle, Clock, 
  Ticket as TicketIcon, RefreshCw, Edit3, X, Save, Eye, Copy, AlertTriangle, ChevronDown, Calendar, Fingerprint, Search 
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://service-bn-8.onrender.com/api';

export default function TablaOperativoPage() {
  // --- ESTADOS PRINCIPALES ---
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filtro, setFiltro] = useState('todos'); // Filtro de estado (Backend)
  const [loading, setLoading] = useState(false);

  // --- NUEVO: ESTADOS PARA BÚSQUEDA FRONTEND ---
  const [dniBusqueda, setDniBusqueda] = useState('');
  const [fechaBusqueda, setFechaBusqueda] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false); // Para saber si estamos filtrando en front

  // --- ESTADOS DE MODALES Y ACCIONES ---
  const [modalType, setModalType] = useState<'view' | 'edit' | 'confirm' | null>(null);
  const [selectedReclamo, setSelectedReclamo] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<{type: 'status' | 'update', data: any} | null>(null);

  // --- UTILIDADES DE FECHA ---
  const dateToInputFormat = (dateStr: string) => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  };

  const inputToBackendFormat = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`; // Retorna DD-MM-YYYY
  };

  // --- 1. CARGA DE DATOS NORMAL (Paginación Backend) ---
  const fetchReclamos = useCallback(async () => {
    // Si estamos en modo búsqueda manual, no ejecutamos la paginación automática
    if (isSearchMode) return; 

    setLoading(true);
    try {
      let url = `${API_URL}/reclamos?page=${page}&size=10`;
      if (filtro !== 'todos') url += `&completado=${filtro === 'true'}`;
      const res = await axios.get(url);
      setData(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  }, [page, filtro, isSearchMode]);

  useEffect(() => { fetchReclamos(); }, [fetchReclamos]);

  // --- 2. NUEVO: CARGA MASIVA Y FILTRADO (Frontend Search) ---
  const buscarEnFront = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si no hay nada escrito, no hacemos nada (o podrías recargar normal)
    if (!dniBusqueda && !fechaBusqueda) return;

    setLoading(true);
    try {
      // a) Traemos "toda" la data (limit muy alto, ej: 10000)
      // Nota: Mantenemos el filtro de estado (pend/completado) si lo deseas, o lo quitas del URL
      let url = `${API_URL}/reclamos?page=0&size=10000`; 
      if (filtro !== 'todos') url += `&completado=${filtro === 'true'}`;

      const res = await axios.get(url);
      const allData = res.data.content || [];

      // b) Filtramos en Javascript
      const resultadosFiltrados = allData.filter((item: any) => {
        // Filtro DNI (si el usuario escribió algo)
        const matchDni = dniBusqueda 
          ? item.documentoCliente.includes(dniBusqueda) 
          : true;

        // Filtro Fecha (si el usuario seleccionó fecha)
        // Convertimos el input (YYYY-MM-DD) al formato del back (DD-MM-YYYY) para comparar
        const fechaFormateada = inputToBackendFormat(fechaBusqueda);
        const matchFecha = fechaBusqueda 
          ? item.fechaTrx === fechaFormateada 
          : true;

        return matchDni && matchFecha;
      });

      // c) Actualizamos la tabla con la data filtrada
      setData(resultadosFiltrados);
      setTotalElements(resultadosFiltrados.length);
      setTotalPages(1); // En búsqueda local, todo está en una "página"
      setIsSearchMode(true); // Activamos la bandera

    } catch (error) {
      console.error("Error buscando:", error);
      alert("Error al buscar datos masivos.");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. LIMPIAR BÚSQUEDA ---
  const limpiarBusqueda = () => {
    setDniBusqueda('');
    setFechaBusqueda('');
    setIsSearchMode(false); // Apagamos modo búsqueda
    setPage(0); // Volvemos a página 0
    // Al cambiar isSearchMode a false, el useEffect disparará fetchReclamos automáticamente
  };


  // --- OTRAS UTILIDADES ---
  const copiarData = (item: any) => {
    const texto = `RECLAMO: ${item.nroReclamo || 'S/N'}\nCLIENTE: ${item.documentoCliente}\nFECHA: ${item.fechaTrx}\nESTADO: ${item.completado ? 'COMPLETADO' : 'PENDIENTE'}\nID: ${item.id}`;
    navigator.clipboard.writeText(texto);
    alert("¡Datos copiados al portapapeles!");
  };

  const solicitarConfirmacion = (type: 'status' | 'update', data: any) => {
    setPendingAction({ type, data });
    setModalType('confirm');
  };

  const ejecutarAccionConfirmada = async () => {
    if (!pendingAction) return;
    setIsSaving(true);
    try {
      if (pendingAction.type === 'status') {
        await axios.patch(`${API_URL}/reclamos/${pendingAction.data.id}/estado?estado=${pendingAction.data.nuevoEstado}`);
      } else {
        const payload = { ...pendingAction.data, fechaTrx: inputToBackendFormat(pendingAction.data.fechaTrx) };
        await axios.put(`${API_URL}/reclamos/${payload.id}/gestionar`, payload);
      }
      setModalType(null);
      // Decisión: ¿Recargamos todo o mantenemos la búsqueda?
      // Por simplicidad, recargamos la vista normal para ver los cambios frescos
      if (isSearchMode) {
         // Opción A: Re-ejecutar búsqueda (puede ser lento)
         // Opción B: Salir de búsqueda
         limpiarBusqueda(); 
      } else {
         fetchReclamos();
      }
    } catch (e) { 
      alert("Error al procesar la solicitud en el servidor."); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleTicketChange = (index: number, field: string, value: any) => {
    const updatedTickets = [...selectedReclamo.tickets];
    updatedTickets[index] = { ...updatedTickets[index], [field]: value };
    setSelectedReclamo({ ...selectedReclamo, tickets: updatedTickets });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">
      
      {/* HEADER CLARO CON FILTROS Y BÚSQUEDA */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-4">
        
        {/* FILA SUPERIOR: Totales y Filtro Estado */}
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-sm">
                <Filter className="h-4 w-4 text-blue-600" />
                <select 
                  className="text-sm outline-none bg-transparent font-bold text-slate-700"
                  value={filtro}
                  onChange={(e) => { setFiltro(e.target.value); setPage(0); setIsSearchMode(false); }}
                >
                  <option value="todos">Todos los Reclamos</option>
                  <option value="false">Solo Pendientes</option>
                  <option value="true">Solo Completados</option>
                </select>
              </div>
              {loading && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
            </div>

            <div className="text-right hidden sm:block">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                 {isSearchMode ? 'Resultados encontrados' : 'Registros Totales'}
               </p>
               <p className="text-lg font-black text-slate-800 leading-none">{totalElements}</p>
            </div>
        </div>

        {/* --- NUEVO: BARRA DE BÚSQUEDA (FORMULARIO) --- */}
        <form onSubmit={buscarEnFront} className="flex flex-wrap gap-3 items-end pt-2 border-t border-slate-200">
           
           {/* Input DNI */}
           <div className="flex-1 min-w-[150px]">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Buscar por DNI/Doc</label>
             <div className="relative">
                <input 
                  type="text" 
                  placeholder="Escribe documento..." 
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={dniBusqueda}
                  onChange={(e) => setDniBusqueda(e.target.value)}
                />
                <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5"/>
             </div>
           </div>

           {/* Input Fecha */}
           <div className="flex-1 min-w-[150px]">
             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Filtrar por Fecha</label>
             <div className="relative">
                <input 
                  type="date" 
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-600"
                  value={fechaBusqueda}
                  onChange={(e) => setFechaBusqueda(e.target.value)}
                />
                <Calendar className="h-4 w-4 text-slate-400 absolute left-3 top-2.5"/>
             </div>
           </div>

           {/* Botones Buscar / Limpiar */}
           <div className="flex gap-2">
              <button 
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:bg-slate-300"
              >
                <Search className="h-4 w-4"/> Buscar
              </button>

              {(isSearchMode || dniBusqueda || fechaBusqueda) && (
                <button 
                  type="button"
                  onClick={limpiarBusqueda}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="h-4 w-4"/> Limpiar
                </button>
              )}
           </div>
        </form>
        {isSearchMode && (
          <p className="text-[10px] text-orange-600 font-bold flex items-center gap-1">
             <AlertTriangle className="h-3 w-3"/> FILTRANDO LOCALMENTE SOBRE DATA MASIVA
          </p>
        )}
      </div>

      {/* TABLA CLARA */}
      <div className="flex-grow overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Reclamo / Fecha</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Estado Maestro (Dropdown)</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/40 transition-all group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-800 block">{item.nroReclamo || 'S/N'}</span>
                    <span className="text-xs text-slate-500">{item.fechaTrx}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 block">{item.documentoCliente}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 rounded font-bold uppercase">{item.tipoDocumento}</span>
                  </td>
                  <td className="px-6 py-4">
                    {/* DROPDOWN DE ESTADO */}
                    <div className="relative inline-block text-left group/drop z-10">
                      <button className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-black text-[10px] border transition-all shadow-sm ${
                        item.completado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {item.completado ? <CheckCircle className="h-3 w-3"/> : <Clock className="h-3 w-3"/>}
                        {item.completado ? 'COMPLETADO' : 'PENDIENTE'}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </button>
                      <div className="absolute left-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl opacity-0 invisible group-hover/drop:opacity-100 group-hover/drop:visible transition-all origin-top-left transform scale-95 group-hover/drop:scale-100 overflow-hidden">
                        <button 
                          onClick={() => solicitarConfirmacion('status', {id: item.id, nuevoEstado: true})} 
                          className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-green-700 hover:bg-green-50 flex items-center gap-2"
                        >
                          <CheckCircle className="h-3 w-3"/> MARCAR COMPLETADO
                        </button>
                        <button 
                          onClick={() => solicitarConfirmacion('status', {id: item.id, nuevoEstado: false})} 
                          className="w-full text-left px-4 py-2.5 text-[10px] font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2 border-t border-slate-100"
                        >
                          <Clock className="h-3 w-3"/> REABRIR RECLAMO
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setSelectedReclamo(item); setModalType('view'); }} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm">
                          <Eye className="h-4 w-4"/>
                      </button>
                      <button onClick={() => { 
                        const clone = JSON.parse(JSON.stringify(item));
                        clone.fechaTrx = dateToInputFormat(clone.fechaTrx); 
                        setSelectedReclamo(clone); setModalType('edit'); 
                      }} className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg hover:bg-blue-100 transition-all shadow-sm">
                          <Edit3 className="h-4 w-4"/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
               <tr>
                 <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">
                    No se encontraron registros {isSearchMode && 'con estos filtros'}
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN CLARA */}
      {/* Ocultamos paginación si estamos buscando en modo front, ya que todo está cargado */}
      {!isSearchMode && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-slate-500">
          <span className="text-xs font-bold">Página {page + 1} de {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 shadow-sm transition-all"><ChevronLeft className="h-4 w-4"/></button>
            <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-50 shadow-sm transition-all"><ChevronRight className="h-4 w-4"/></button>
          </div>
        </div>
      )}

      {/* --- MODALES --- */}
      {/* ... (Tus modales de confirmación, view y edit siguen exactamente igual abajo) ... */}
      
      {/* MODAL 1: CONFIRMACIÓN */}
      {modalType === 'confirm' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl transform transition-all scale-100">
            <div className="bg-amber-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-amber-600 h-7 w-7" />
            </div>
            <h3 className="text-slate-800 font-black text-lg mb-2">¿Estás seguro?</h3>
            <p className="text-slate-500 text-sm mb-6">Esta acción actualizará los datos directamente en la base de datos. ¿Deseas continuar?</p>
            <div className="flex gap-3">
              <button onClick={() => setModalType(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">CANCELAR</button>
              <button onClick={ejecutarAccionConfirmada} disabled={isSaving} className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200 disabled:bg-slate-300">
                {isSaving ? <RefreshCw className="h-4 w-4 animate-spin"/> : null}
                {isSaving ? 'Procesando...' : 'SÍ, CONFIRMAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VISTA RÁPIDA */}
      {modalType === 'view' && selectedReclamo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800 flex items-center gap-2"><Eye className="h-4 w-4 text-blue-500"/> Vista Rápida</h3>
              <button onClick={() => copiarData(selectedReclamo)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 hover:text-blue-600 transition-all shadow-sm" title="Copiar al portapapeles"><Copy className="h-4 w-4"/></button>
            </div>
            <div className="p-6 space-y-3 font-mono text-sm text-slate-700 bg-slate-50/50">
              <p><span className="font-bold text-slate-400 inline-block w-24">RECLAMO:</span> {selectedReclamo.nroReclamo || 'S/N'}</p>
              <p><span className="font-bold text-slate-400 inline-block w-24">CLIENTE:</span> {selectedReclamo.documentoCliente} ({selectedReclamo.tipoDocumento})</p>
              <p><span className="font-bold text-slate-400 inline-block w-24">FECHA:</span> {selectedReclamo.fechaTrx}</p>
              <p><span className="font-bold text-slate-400 inline-block w-24">ESTADO:</span> <span className={selectedReclamo.completado ? 'text-green-600 font-bold' : 'text-amber-600 font-bold'}>{selectedReclamo.completado ? 'COMPLETADO' : 'PENDIENTE'}</span></p>
              <div className="pt-3 border-t border-slate-200">
                <p className="text-[10px] text-slate-400 mb-1 font-bold">UUID DEL SISTEMA:</p>
                <p className="text-[10px] break-all bg-white p-2 rounded border border-slate-100">{selectedReclamo.id}</p>
              </div>
            </div>
            <button onClick={() => setModalType(null)} className="w-full py-3 bg-white border-t border-slate-100 font-bold text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs">Cerrar Vista</button>
          </div>
        </div>
      )}

      {/* MODAL 3: EDICIÓN COMPLETA */}
      {modalType === 'edit' && selectedReclamo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col my-8 max-h-[90vh] border border-slate-200">
            <div className="p-5 bg-slate-50 rounded-t-2xl border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-blue-600" /> MODIFICAR RECLAMO
              </h3>
              <button onClick={() => setModalType(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X className="h-5 w-5 text-slate-500"/></button>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
              {/* Cabecera */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Fingerprint className="h-3 w-3"/> Información Cliente</label>
                  <div className="flex gap-2">
                    <select className="p-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={selectedReclamo.tipoDocumento} onChange={(e) => setSelectedReclamo({...selectedReclamo, tipoDocumento: e.target.value})}>
                      <option value="DNI">DNI</option><option value="RUC">RUC</option>
                    </select>
                    <input className="flex-1 p-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Nro Documento" value={selectedReclamo.documentoCliente} onChange={(e) => setSelectedReclamo({...selectedReclamo, documentoCliente: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar className="h-3 w-3"/> Datos Reclamo</label>
                  <div className="flex gap-2">
                      <input className="flex-1 p-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" placeholder="Nro Reclamo" value={selectedReclamo.nroReclamo} onChange={(e) => setSelectedReclamo({...selectedReclamo, nroReclamo: e.target.value})} />
                      <input type="date" className="p-2.5 bg-white border border-slate-300 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={selectedReclamo.fechaTrx} onChange={(e) => setSelectedReclamo({...selectedReclamo, fechaTrx: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* Tickets */}
              <div className="space-y-4">
                 <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><TicketIcon className="h-3 w-3"/> Gestión de Tickets Asociados</label>
                 {selectedReclamo.tickets?.map((t: any, idx: number) => (
                   <div key={t.id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Nro Ticket</label>
                        <input className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={t.nroTicket} onChange={(e) => handleTicketChange(idx, 'nroTicket', e.target.value)} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Importe</label>
                        <input type="number" className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={t.importe} onChange={(e) => handleTicketChange(idx, 'importe', parseFloat(e.target.value))} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Estado</label>
                        <input className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={t.estadoTicket} onChange={(e) => handleTicketChange(idx, 'estadoTicket', e.target.value)} />
                     </div>
                     <div className="md:col-span-3 flex gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">ID Único Operación</label>
                            <input className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none font-mono" value={t.idUnico} onChange={(e) => handleTicketChange(idx, 'idUnico', e.target.value)} />
                        </div>
                         <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Cód. Devolución</label>
                            <input className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" value={t.codDevolucion} onChange={(e) => handleTicketChange(idx, 'codDevolucion', e.target.value)} />
                        </div>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-4 rounded-b-2xl">
               <button onClick={() => setModalType(null)} className="px-6 py-2.5 text-slate-500 font-bold text-sm hover:bg-slate-100 rounded-xl transition-colors">CANCELAR</button>
               <button onClick={() => solicitarConfirmacion('update', selectedReclamo)} className="px-8 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
                 <Save className="h-4 w-4"/> APLICAR CAMBIOS
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}