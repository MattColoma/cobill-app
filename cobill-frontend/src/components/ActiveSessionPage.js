import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

const ActiveSessionPage = ({ sesionDetails, participanteDetails, sesionItems, sesionTotals, onAddItem, onLeaveSession }) => {
  const [gastoDescripcion, setGastoDescripcion] = useState('');
  const [gastoCosto, setGastoCosto] = useState('');

  const handleAddItemClick = () => {
    onAddItem(gastoDescripcion, gastoCosto);
    setGastoDescripcion('');
    setGastoCosto('');
  };

  // Agrupar gastos por participante para el resumen
  const groupedItems = sesionItems.reduce((acc, item) => {
    const name = item.nombre_participante || 'Desconocido';
    if (!acc[name]) {
      acc[name] = { total: 0, items: [] };
    }
    acc[name].total += item.costo_item;
    acc[name].items.push(item);
    return acc;
  }, {});

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Sesión Activa: {sesionDetails?.nombre_sesion || 'Sin Nombre'}</h2>
      <p className="text-lg mb-2">Código: <strong className="text-blue-600">{sesionDetails?.codigo_gasto}</strong></p>
      <p className="text-md mb-4">Tú eres: <strong className="text-green-600">{participanteDetails?.nombre_participante}</strong> (ID: {participanteDetails?.id})</p>
      <hr className="my-6 border-gray-300" />

      <h3 className="text-xl font-semibold mb-4 text-gray-700">Agregar Gasto</h3>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <Input
          type="text"
          placeholder="Descripción del ítem"
          value={gastoDescripcion}
          onChange={(e) => setGastoDescripcion(e.target.value)}
          className="flex-grow max-w-xs"
        />
        <Input
          type="number"
          placeholder="Costo"
          value={gastoCosto}
          onChange={(e) => setGastoCosto(e.target.value)}
          className="w-24"
        />
        <Button
          onClick={handleAddItemClick}
          className="bg-yellow-500 hover:bg-yellow-600 text-gray-800 shadow-md"
        >
          Agregar Ítem
        </Button>
      </div>

      <hr className="my-6 border-gray-300" />

      <h3 className="text-xl font-semibold mb-4 text-gray-700">Mis Gastos en esta Sesión</h3>
      {sesionItems.filter(item => item.participante_id === participanteDetails?.id).length > 0 ? (
        <ul className="list-none p-0 space-y-2">
          {sesionItems
            .filter(item => item.participante_id === participanteDetails?.id)
            .map((item, index) => (
              <li key={item.id || index} className="bg-gray-100 p-3 rounded-md flex justify-between items-center shadow-sm">
                <span>{item.descripcion_item}</span>
                <strong className="text-red-600">${item.costo_item.toFixed(2)}</strong>
              </li>
            ))}
        </ul>
      ) : (
        <p className="text-gray-600">No has agregado ningún gasto aún.</p>
      )}

      <hr className="my-6 border-gray-300" />

      <h3 className="text-xl font-semibold mb-4 text-gray-700">Resumen de la Sesión</h3>
      {sesionItems.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-700">Gastos por Participante:</h4>
          {Object.entries(groupedItems).map(([name, data]) => (
            <div key={name} className="border border-gray-200 p-4 rounded-md bg-white shadow-sm">
              <strong className="text-blue-700 text-lg">{name}: ${data.total.toFixed(2)}</strong>
              <ul className="list-disc ml-5 mt-2 text-gray-600">
                {data.items.map((item, idx) => (
                  <li key={item.id || idx} className="text-sm">{item.descripcion_item}: ${item.costo_item.toFixed(2)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">Aún no hay gastos en esta sesión.</p>
      )}

      {sesionTotals && (
        <div className="mt-8 p-6 border-2 border-green-500 rounded-lg bg-green-50 text-gray-800 shadow-lg">
          <h4 className="text-xl font-bold text-green-700 mb-2">Total de la Sesión:</h4>
          <p className="text-lg">Subtotal: <strong className="text-green-800">${sesionTotals.total_sin_propina.toFixed(2)}</strong></p>
          <p className="text-lg">Propina ({sesionTotals.porcentaje_propina}%): <strong className="text-green-800">${(sesionTotals.total_sin_propina * sesionTotals.porcentaje_propina / 100).toFixed(2)}</strong></p>
          <h3 className="text-2xl font-bold text-green-700 mt-4">Total a Pagar: <strong className="text-green-800">${sesionTotals.total_con_propina.toFixed(2)}</strong></h3>
        </div>
      )}

      <Button
        onClick={onLeaveSession}
        className="bg-red-600 hover:bg-red-700 text-white mt-8 shadow-md"
      >
        Salir de la Sesión
      </Button>
    </div>
  );
};

export default ActiveSessionPage;
