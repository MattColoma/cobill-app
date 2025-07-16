import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

const RegisterPage = ({ onRegister, onGoToLogin }) => {
  const [nombre, setNombre] = useState(''); // CAMBIO: 'name' a 'nombre'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      // CAMBIO: Pasar 'nombre' en lugar de 'name'
      await onRegister(nombre, email, password);
      setMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setIsError(false);
      setNombre(''); // Limpiar campo 'nombre'
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage(err.message || 'Error al registrarse. Inténtalo de nuevo.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Registrarse</h2>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
        <Input
          type="text"
          placeholder="Nombre"
          value={nombre} // CAMBIO: usar 'nombre'
          onChange={(e) => setNombre(e.target.value)} // CAMBIO: setNombre
          className="w-full max-w-xs"
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full max-w-xs"
          required
        />
        <Input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full max-w-xs"
          required
        />
        <Button
          type="submit"
          className={`bg-blue-600 hover:bg-blue-700 text-white shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </Button>
      </form>

      {message && (
        <p className={`mt-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}

      <p className="mt-6 text-gray-700">
        ¿Ya tienes una cuenta?{' '}
        <button onClick={onGoToLogin} className="text-blue-500 hover:underline">
          Inicia Sesión aquí
        </button>
      </p>
    </div>
  );
};

export default RegisterPage;
