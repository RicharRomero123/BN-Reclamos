export default function FuncionarioPage() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bandeja de Gestión Administrativa</h2>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
          Funcionario
        </span>
      </div>
      
      {/* Aquí llamaremos a tu Tabla de Reclamos con filtros */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center text-gray-400">
        Tabla de Reclamos y Filtros (Próximamente)
      </div>
    </div>
  );
}