# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

Cobill App: Gestión de Gastos Compartidos
¡Bienvenido al repositorio de Cobill App! Cobill es una aplicación web diseñada para simplificar la gestión y división de gastos en grupo, ideal para amigos, familias o compañeros de viaje. Permite a los usuarios crear sesiones de gasto, unirse a ellas mediante un código único, añadir ítems consumidos y ver un resumen de los totales de la sesión.

🚀 Características Principales
Autenticación de Usuarios: Registro e inicio de sesión seguro (local con email/contraseña).

Creación de Sesiones: Genera un código único para cada sesión de gasto.

Unión a Sesiones: Los participantes pueden unirse a una sesión usando el código.

Gestión de Ítems de Gasto: Añade descripciones y costos a los ítems consumidos dentro de una sesión.

Cálculo de Totales: Visualiza los totales de la sesión, incluyendo el porcentaje de propina.

Comunicación en Tiempo Real: Utiliza Socket.IO para actualizaciones instantáneas de la sesión.

Diseño Moderno y Responsivo: Interfaz de usuario construida con React y Tailwind CSS.

🛠️ Tecnologías Utilizadas
Backend
Node.js: Entorno de ejecución JavaScript.

Express.js: Framework web para Node.js.

SQL Server: Base de datos relacional para el almacenamiento de datos.

mssql: Driver Node.js para SQL Server.

Socket.IO: Para comunicación bidireccional en tiempo real.

bcryptjs: Para el hasheo seguro de contraseñas.

jsonwebtoken (JWT): Para la autenticación basada en tokens.

dotenv: Para la gestión de variables de entorno.

cors: Middleware para habilitar Cross-Origin Resource Sharing.

Frontend
React.js: Librería JavaScript para construir interfaces de usuario.

Tailwind CSS: Framework CSS utility-first para un diseño rápido y responsivo.

Axios: Cliente HTTP basado en promesas para realizar solicitudes a la API.

Socket.IO Client: Librería cliente para comunicación en tiempo real con el backend.

🏗️ Estructura del Proyecto
cobill-app/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuración de la base de datos
│   │   ├── controllers/      # Lógica de negocio de las APIs
│   │   ├── middleware/       # Middlewares (ej. autenticación)
│   │   ├── models/           # Modelos de base de datos
│   │   ├── routes/           # Definición de rutas de la API
│   │   ├── utils/            # Utilidades (ej. generador de códigos)
│   │   └── server.js         # Archivo principal del servidor
│   ├── .env.example          # Ejemplo de variables de entorno del backend
│   ├── package.json
│   └── README.md             # README específico del backend
├── frontend/
│   ├── public/               # Archivos estáticos (ej. logo)
│   ├── src/
│   │   ├── components/       # Componentes React (páginas, UI, etc.)
│   │   ├── App.js            # Componente principal de la aplicación
│   │   ├── index.js          # Punto de entrada de React
│   │   └── index.css         # Estilos globales de Tailwind
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md             # README específico del frontend
└── README.md                 # Este archivo

⚙️ Configuración y Ejecución Local
Para levantar la aplicación completa en tu entorno local, sigue estos pasos:

1. Configuración de la Base de Datos (SQL Server)
Asegúrate de tener una instancia de SQL Server funcionando.

Crea una base de datos llamada cobill.

Ejecuta los scripts de creación de tablas que se encuentran en backend/sql/create_tables.sql (o similar, si tienes un archivo SQL para esto). Asegúrate de que las tablas usuario, SesionGasto, ParticipanteSesion e ItemGasto estén creadas.

2. Configuración del Backend
Navega al directorio backend/:

cd backend

Instala las dependencias:

npm install

Crea un archivo .env en el directorio backend/ y configura tus variables de entorno (puedes usar .env.example como plantilla):

DB_USER=tu_usuario_sql
DB_PASSWORD=tu_contraseña_sql
DB_HOST=localhost # o la IP/nombre de tu servidor SQL
DB_NAME=cobill
PORT=5000
JWT_SECRET=una_clave_secreta_muy_larga_y_aleatoria_para_jwt

Inicia el servidor backend:

node src/server.js

El servidor debería iniciarse en http://localhost:5000.

3. Configuración del Frontend
Abre una nueva terminal, navega al directorio frontend/:

cd frontend

Instala las dependencias:

npm install

Asegúrate de que tu logo (Logo_sin_fondo.png) esté en la carpeta frontend/public/img/. Si no existe la carpeta img dentro de public, créala.

Inicia la aplicación React:

npm start

La aplicación se abrirá en tu navegador en http://localhost:3000.

🤝 Contribución
Si deseas contribuir a este proyecto, por favor, sigue las siguientes pautas:

Haz un fork del repositorio.

Crea una nueva rama para tu característica (git checkout -b feature/nombre-de-la-caracteristica).

Realiza tus cambios y commitea (git commit -m 'feat: Añadir nueva característica X').

Haz push a tu rama (git push origin feature/nombre-de-la-caracteristica).

Abre un Pull Request.

📄 Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

¡Disfruta usando y desarrollando Cobill App!