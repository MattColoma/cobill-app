import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

const LoginPage = ({ onLogin, onGoToRegister }) => {
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
      await onLogin(email, password);
      // Si el login es exitoso, onLogin en App.js manejará la redirección
    } catch (err) {
      setMessage(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Iniciar Sesión</h2>
      <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
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
          className={`bg-green-600 hover:bg-green-700 text-white shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      {message && (
        <p className={`mt-4 ${isError ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}

      <p className="mt-6 text-gray-700">
        ¿No tienes una cuenta?{' '}
        <button onClick={onGoToRegister} className="text-blue-500 hover:underline">
          Regístrate aquí
        </button>
      </p>
    </div>
  );
};

export default LoginPage;
