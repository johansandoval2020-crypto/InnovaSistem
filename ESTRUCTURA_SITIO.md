# 9.1 Estructuración del sitio web InnovaSistem

## Explicación general
InnovaSistem está organizado como una plataforma web modular con tres secciones principales: landing page pública, panel de autenticación y dashboards administrativos. La estructura separada permite que usuarios finales (dueños de negocios) gestionen sus datos de forma independiente, mientras que administradores tienen vista agregada de toda la plataforma.

---

## Páginas creadas

### 1. **index.html** (Landing page pública)
- Página de inicio y presentación de la plataforma
- Contiene hero section con información de valor
- Acceso a login y registro de nuevos negocios
- Información sobre tipos de negocio soportados (clínicas, pupuserías, talleres)

### 2. **login.html** (Autenticación)
- Tres paneles interactivos:
  - **Panel Login**: ingreso con email y contraseña (usuarios ya registrados)
  - **Panel Registro**: creación de nuevas cuentas de negocio
  - **Panel Admin Login**: acceso exclusivo admin (email: admin24@gmail.com)
- Redirige a `admin.html` (login usuario) o `superadmin.html` (login admin)

### 3. **admin.html** (Dashboard de negocio)
- Panel principal para dueños de negocios registrados
- Siete vistas diferentes (nav vertical dock):
  - **Resumen**: KPIs del negocio (ingresos, ventas, comisión)
  - **Inventario**: productos/insumos/repuestos con stock
  - **Ventas**: historial y gráficas de ventas
  - **Proveedores**: directorio de proveedores por rubro
  - **Clientes**: listado de clientes y su historial
  - **Ingresos**: análisis de ingresos por período
  - **Pagos**: seguimiento de pagos (pagado/pendiente)

### 4. **superadmin.html** (Dashboard administrativo)
- Panel agregado para administrador de plataforma
- Cuatro vistas (nav vertical dock):
  - **Resumen**: KPIs globales (negocios registrados, ingresos totales, comisión 10%)
  - **Ingresos**: tabla de ingresos por negocio
  - **Clientes**: tarjetas de todos los negocios registrados
  - **Pedidos**: tabla de compras a proveedores con seguimiento de entrega

---

## Secciones principales (Landing)

### Sección Hero
- Título: "Bienvenidos a InnovaSistem"
- Subtítulo en violeta: "a InnovaSistem"
- Fondo: panel azul oscuro semi-transparente con blur
- Botones CTA: "Crear mi negocio" y "Ver cómo funciona"
- Dato destacado: "18 Tenemos 18 proveedores aliados" (centrado, único contador)

### Sección "Cómo funcionamos"
- Cuatro step-cards con números (1-4)
- Fondos: azul oscuro (navy/deep) alternados
- Iconos: 🌱 📦 🤝 📊
- Describe el flujo: elegir negocio → inventario → proveedores → control total

### Sección "Problemas"
- Cuatro problem-cards con grid 2x2
- Fondos: azul oscuro alternados
- Iconos: 📉 🗒️ 🚚 📦
- Describe los problemas que resuelve

### Sección "Qué ofrecemos"
- Seis offer-cards con grid 3x3
- Fondos: azul oscuro (navy/deep) con puntos decorativos violeta
- Iconos: SVG línea minimalistas
- Features: conexión proveedores, facturación, ventas, inventario, ingresos, pagos

### Sección "Sectores"
- Tres sector-cards con imágenes de fondo (cuadro.png)
- Overlay oscuro con gradiente
- Texto blanco encima
- Tipos: Clínica, Pupusería, Taller automotriz

---

## Menús de navegación

### Navigation Bar (index.html)
- **Brand/Logo**: mascota robot circular (logo.png)
- **Links principales**: Cómo funciona | Problemas | Qué ofrecemos | Sectores
- **CTA buttons**: Iniciar sesión | Crear cuenta
- **Burger menu** (móvil): desplegable con todos los links
- Se vuelve "scrolled" (fondo oscuro) después de 40px de scroll

### Dock Navigation (admin.html / superadmin.html)
- **Vertical sidebar** lado izquierdo
- **Logo** mascota circular arriba
- **Botones de vista** con iconos + tooltips:
  - Admin: Resumen, Inventario, Ventas, Proveedores, Clientes, Ingresos, Pagos
  - Super-admin: Resumen, Ingresos, Clientes, Pedidos
- **Separador** (línea)
- **Botones de utilidad**: Tema (dark/light) | Logout

---

## Formularios

### Formulario de Login (panelLogin)
- Email (requerido)
- Contraseña (requerido)
- Botón submit: "Entrar a mi panel →"
- Link "Creá una aquí" → cambio a registro
- Botón admin: "Iniciar sesión como administrador" → cambio a panel admin

### Formulario de Registro (panelRegister)
- Nombre del negocio (text, requerido)
- Tipo de negocio (selector de 3 tarjetas: Clínica, Pupusería, Taller)
- Tu nombre (text, requerido)
- Correo (email, requerido)
- Contraseña (password, minlength 4, requerido)
- Botón submit: "Crear mi negocio →"
- Link "Iniciá sesión" → cambio a login

### Formulario de Admin Login (panelAdminLogin)
- Email (requerido, solo acepta admin24@gmail.com)
- Contraseña (requerido)
- Botón submit: "Entrar como administrador →"
- Botón volver: "← Volver a iniciar sesión"

### Formularios dinámicos en Dashboards
- **Nueva venta**: modal con cliente, producto, cantidad, precio
- **Nuevo pago**: modal con proveedor, monto, estado (pagado/pendiente)
- **Compra a proveedor**: catalogo de proveedor + carrito + confirm

---

## Encabezados (Headers)

### Landing (index.html)
- `<header class="hero">` con clock local
- Título h1 con accent en violeta
- Fondo azul oscuro semi-transparente

### Dashboard (admin.html / superadmin.html)
- `<div class="topbar">` con:
  - Título del negocio / "Panel general"
  - Tipo de negocio (badge)
  - Botón logout

---

## Pie de página (Footer)

**No tiene pie de página tradicional.** 
- Landing termina con sección "Sectores" y CTA final
- Dashboards terminan donde termina el contenido dinámico (sin footer fijo)
- Esto mantiene el focus en el contenido principal

---

## Organización de contenidos

### Estructura de secciones en Landing
```
Hero (título + 1 stat)
  ↓
Cómo funciona (4 steps)
  ↓
Problemas (4 cards)
  ↓
Qué ofrecemos (6 cards)
  ↓
Sectores (3 cards con imagen)
  ↓
CTA final (botón crear negocio)
```

### Estructura de datos por negocio
- **Estado**: `innova_business_<id>` (localStorage)
  - Inventario (productos con stock/precio)
  - Ventas (historial con cliente/fecha/monto)
  - Clientes (lista con compras)
  - Pagos (pendientes/pagados)
- **Multi-cuenta global**: `innova_accounts` (array de todos los negocios registrados)

### Estructura de datos globales (Super-admin)
- `innova_accounts`: array de cuentas registradas
- `innova_orders`: array de compras a proveedores (con ETA)
- Datos de cada negocio: agregados desde cada `innova_business_<id>`

---

## Estructura de archivos y carpetas

```
innovasistem/
│
├── index.html              (landing page)
├── login.html              (auth page)
├── admin.html              (user dashboard)
├── superadmin.html         (admin dashboard)
│
├── styles.css              (landing styles)
├── login.css               (auth styles)
├── admin.css               (dashboard styles - shared)
│
├── main.js                 (landing interactions)
├── login.js                (auth logic)
├── admin.js                (user dashboard logic)
├── superadmin.js           (admin dashboard logic)
├── data.js                 (seed data: tipos, productos, proveedores)
│
├── imagenes/
│   ├── logo.png            (mascota robot circular)
│   ├── cromo.png           (fondo azul satín - body fixed)
│   ├── cuadro.png          (textura metálica sector-cards)
│   └── ois.png             (peces koi - login panel)
│
├── CONTEXTO.md             (dev notes sobre decisiones)
├── ESTRUCTURA_SITIO.md     (este archivo)
│
└── .git/                   (repo GitHub)
```

### Paleta de colores (CSS variables)
```css
--dark-green: #221A3D        (índigo oscuro, nunca se usa para verde)
--moss: #6C5CE7              (violeta-azul vívido)
--midnight: #4A3F91          (azul-violeta profundo)
--beige: #F1EEFF             (lavanda muy claro)
--ink: #1C1830               (casi negro)
--paper: #FCFBFF             (blanco frío)
--p-navy: #1E2A52            (azul oscuro tarjetas)
--p-deep: #223159            (azul oscuro variante)
--p-sky: #DCEEFF             (azul claro acentos)
--glass-dark: rgba(22,28,58,.82)  (panel semi-transparente oscuro)
```

### Tipografía
- **Serif** (títulos): Fraunces (400, 600, 700)
- **Sans** (cuerpo): Work Sans (400, 500, 600, 700)

---

## Notas técnicas

- **Storage**: localStorage (multi-cuenta con `innova_accounts` array)
- **No base de datos**: Todo en navegador (datos de demo/MVP)
- **Responsivo**: Mobile-first con media queries
- **Fondo fijo**: `background-attachment: fixed` en `body` (aplicado en styles.css, login.css, admin.css)
- **Animaciones**: reveal animations con IntersectionObserver, counter animations
- **Paleta única azul**: Landing, login y dashboards usan SOLO tonos azul oscuro (navy/deep) como fondo principal
- **Cache-busting**: Versiones en URLs de CSS/JS para evitar stale cache en Vercel
