import React from 'react';

const Button = ({ onClick, children, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      // Clases base para un estilo profesional
      className={`
        py-2 px-4 rounded-lg font-semibold text-white
        transition duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        shadow-md hover:shadow-lg active:shadow-sm
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
