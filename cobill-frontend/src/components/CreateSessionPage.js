import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

const CreateSessionPage = ({ onCreateSession, sesionDetails, participanteDetails, onGoToActiveSession, onGoToHome, sesionCode }) => {
  const [sessionName, setSessionName] = useState('Nueva Sesión de Gastos');
  const [tipPercentage, setTipPercentage] = useState(10); // Default 10%
  const [loading, setLoading] = useState(false); // Nuevo estado para controlar carga
  
  const handleCreate = async () => {
    if (sessionName && !isNaN(tipPercentage) && tipPercentage >= 0) {
      setLoading(true);
      await onCreateSession(sessionName, tipPercentage);
      setLoading(false);
    } else {
      alert('Por favor, ingresa un nombre de sesión válido y un porcentaje de propina (número >= 0).');
    }
  };

  const handleCopyCode = () => {
    if (sesionDetails?.codigo_gasto) {
      navigator.clipboard.writeText(sesionDetails.codigo_gasto);
      alert('Código copiado al portapapeles');
    }
  };

  return (
    <div className="text-center p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Sesión de Gasto</h2>

      <div className="flex flex-col items-center space-y-4 mb-6">
        <Input
          type="text"
          placeholder="Nombre de la Sesión (ej. Cena Amigos)"
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          className="w-full max-w-xs"
        />
        <Input
          type="number"
          placeholder="Porcentaje de Propina (ej. 10)"
          value={tipPercentage}
          onChange={(e) => setTipPercentage(parseFloat(e.target.value))}
          className="w-full max-w-xs"
          min="0"
        />
        <Button
          onClick={handleCreate}
          className={`bg-red-500 hover:bg-red-600 text-white shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Generando...' : 'Generar Código de Sesión'}
        </Button>
      </div>


      {sesionDetails && (
        <div className="mt-8 border border-gray-300 p-6 rounded-lg bg-gray-50 shadow-inner">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">Sesión Creada:</h3>
          <p className="text-lg mb-4">
            Comparte este código:
            <strong className="ml-2 bg-white border-2 border-blue-500 px-4 py-2 text-2xl font-mono text-blue-700 rounded shadow-sm tracking-widest">
              {sesionDetails.codigo_gasto}
            </strong>
            <button
              onClick={handleCopyCode}
              className="ml-4 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
            >
              Copiar
            </button>
          </p>
          <p className="text-sm text-gray-600">ID de Sesión: {sesionDetails.id}</p>
          {participanteDetails && (
            <p className="text-sm text-gray-600">Tu ID de Participante: {participanteDetails.id}</p>
          )}
          
          <Button
            onClick={onGoToActiveSession}
            className="bg-green-500 hover:bg-green-600 text-white mt-6 shadow-md"
          >
            Ir a la Sesión
          </Button>
        </div>
      )}

      <Button
        onClick={onGoToHome}
        className="bg-gray-600 hover:bg-gray-700 text-white mt-8 shadow-md"
      >
        Volver al Inicio
      </Button>
    </div>
  );
};

export default CreateSessionPage;
