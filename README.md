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
