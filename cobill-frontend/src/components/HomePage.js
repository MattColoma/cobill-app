import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

const HomePage = ({ onJoinSession, onGoToCreateSession }) => {
  const [code, setCode] = useState('');
  const [participantName, setParticipantName] = useState('');

  const handleJoin = () => {
    if (code && participantName) {
      onJoinSession(code, participantName);
    } else {
      alert('Por favor, ingresa el código de sesión y tu nombre.'); // Considerar un modal más profesional
    }
  };

  return (
    <div className="text-center p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Bienvenidos</h2>


      <Button
        onClick={onGoToCreateSession}
        className="bg-green-500 hover:bg-green-600 text-white mb-8 shadow-md"
      >
        Crear Nueva Sesión de Gasto
      </Button>

      <div className="border-t border-gray-300 my-8 w-4/5 mx-auto"></div>

      <h3 className="text-xl font-semibold mb-4 text-gray-700">Unirse a Sesión Existente</h3>
      <div className="flex flex-col items-center space-y-4">
        <Input
          type="text"
          placeholder="Código de Sesión (ej. ABC123)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full max-w-xs"
        />
        <Input
          type="text"
          placeholder="Tu Nombre"
          value={participantName}
          onChange={(e) => setParticipantName(e.target.value)}
          className="w-full max-w-xs"
        />
        <Button
          onClick={handleJoin}
          className="bg-blue-500 hover:bg-blue-600 text-white shadow-md"
        >
          Unirse
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
