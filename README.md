# Muni Web
Frontend web de la plataforma municipal de Cipolletti para consultar actividades, gestionar inscripciones, administrar encuentros y realizar el seguimiento de asistencia.

## Descripción
Muni Web es una aplicación desarrollada con React y Vite que permite acceder a las funcionalidades de la plataforma según el rol del usuario. Se comunica con una API backend para consultar y gestionar la información disponible.

## Roles de usuario
- **ADMINISTRADOR:** gestión y consulta de actividades y acceso a las funciones administrativas disponibles.
- **INSTRUCTOR:** acceso a las actividades asignadas, gestión de encuentros y seguimiento de asistencia.
- **PARTICIPANTE:** consulta del catálogo de actividades y gestión de sus inscripciones.

Las acciones disponibles dependen del rol del usuario y de los permisos implementados por el backend.

## Funcionalidades principales
- Visualización del catálogo y detalle de actividades.
- Consulta de períodos y estados de inscripción.
- Gestión y consulta de inscripciones.
- Gestión y consulta de encuentros asociados a las actividades.
- Registro y consulta de asistencia mediante las funciones disponibles para instructores.
- Consulta y edición del perfil de usuario, según los permisos correspondientes.
- Autenticación y navegación según el rol del usuario.
- Interfaz adaptable a distintos tamaños de pantalla.
- Modo claro y oscuro.
- Componentes reutilizables para encabezado, portada, tarjetas, modales y pie de página.
- Acceso a WhatsApp desde la página pública para realizar consultas.

## Tecnologías
- **React:** construcción de la interfaz de usuario.
- **Vite:** servidor de desarrollo y herramienta de compilación.
- **JavaScript:** lógica de la aplicación.
- **CSS:** estilos y diseño adaptable.
- **React Router:** navegación entre páginas y rutas protegidas.
- **Lucide React:** iconografía de la interfaz.

La comunicación con el backend se organiza mediante servicios de frontend, entre ellos `activitiesService`, `attendanceService`, `authService`, `meetingsService` y `usersService`.

## Requisitos
- Node.js compatible con la versión de Vite utilizada por el proyecto.
- npm.
- Acceso a la API backend para probar las funcionalidades que requieren datos del servidor.

## Instalación y ejecución
Cloná el repositorio:
git clone https://github.com/JessiRomi/muni_web.git
cd muni_web

Instalá las dependencias:
npm install

Iniciá el servidor de desarrollo:
npm run dev

Vite mostrará en la terminal la dirección local para abrir la aplicación en el navegador.

## Compilación de producción
Para generar la versión de producción:
npm run build

Para ejecutar una vista previa local de la compilación:
npm run preview


## Configuración de la API
El frontend utiliza Axios para comunicarse con el API Gateway del backend.

Por defecto, la aplicación utiliza:
http://localhost:3000

La URL base puede configurarse mediante la variable de entorno `VITE_API_URL`.

Para utilizar otra dirección, creá un archivo `.env.local` en la raíz del frontend:
VITE_API_URL=http://localhost:3000

Ajustá la URL según el entorno en el que se ejecute el backend.

Las solicitudes autenticadas incluyen el token `access_token` almacenado en `sessionStorage`, enviado mediante el encabezado `Authorization: Bearer`.

El backend utiliza JWT para la autenticación y dispone de documentación Swagger en:
http://localhost:3000/api

Esta dirección corresponde a la configuración local predeterminada del gateway.

Para ejecutar las funcionalidades que requieren datos, el gateway y los microservicios correspondientes deben estar disponibles.

No publiques credenciales, tokens ni archivos de entorno con información sensible en el repositorio.


## Estructura del proyecto
La aplicación organiza el código dentro de `src/` de la siguiente manera:

src/
├── assets/                 # Recursos gráficos
├── components/
│   ├── auth/               # Componentes de autenticación
│   ├── contact/             # Contacto por WhatsApp
│   ├── layout/              # Encabezado, portada y pie de página
│   └── routes/              # Protección de rutas
├── config/                  # Configuración de la API
├── context/                 # Contexto de autenticación
├── pages/
│   ├── dashboard/           # Panel administrativo
│   │   └── activities/      # Gestión de actividades
│   ├── home/                # Página pública
│   ├── instructor/          # Funciones del instructor
│   └── participant/         # Funciones del participante
├── services/                # Comunicación con la API
├── styles/                  # Estilos reutilizables
├── utils/                   # Funciones auxiliares
├── App.css
├── App.jsx
├── index.css
└── main.jsx

La estructura puede evolucionar a medida que se incorporen nuevas funcionalidades.

## Diseño e interfaz
La interfaz utiliza una identidad visual municipal con encabezados oscuros, acentos amarillos, ámbar y naranjas, fotografías integradas y tarjetas de actividades con formas orgánicas.

El diseño contempla componentes reutilizables, navegación adaptable y modos claro y oscuro para mantener una experiencia consistente.

## Repositorio
[GitHub: JessiRomi/muni_web](https://github.com/JessiRomi/muni_web)

## Estado del proyecto
Proyecto en desarrollo. Las funcionalidades disponibles dependen de la versión del frontend y de la API backend con la que se encuentre integrado.