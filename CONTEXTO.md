# InnovaSistem — Contexto del proyecto

Sitio estático (HTML/CSS/JS puro, sin build, sin npm) para un sistema de gestión
pensado para tres rubros: **Clínica**, **Pupusería** y **Taller automotriz**.

Si estás retomando esto en una conversación nueva de Claude: leé este archivo
completo antes de tocar código. Resume decisiones ya tomadas para no repetir
preguntas ni deshacer trabajo.

## Estructura de archivos

- `index.html` / `styles.css` / `main.js` — landing pública.
- `login.html` / `login.css` / `login.js` — login + registro (con selector de
  tipo de negocio).
- `admin.html` / `admin.css` / `admin.js` — panel de administración (SPA con
  vistas por `data-view`, todo en localStorage, sin backend real).
- `data.js` — datos semilla: productos, proveedores y generador de 20
  clientes/ventas por tipo de negocio.
- `imagenes/` — assets reales que el usuario proveyó (ver abajo).

No hay backend. Todo el "negocio" del usuario vive en `localStorage`:
- `innova_account` — cuenta creada en el registro (nombre, tipo, email).
- `innova_business_<tipo>` — el estado completo del negocio (inventario,
  proveedores agregados, clientes, ventas, pagos).
- `innova_theme` — tema claro/oscuro del panel.

## Decisiones de diseño ya tomadas (no revertir sin que el usuario lo pida)

1. **Sin emojis** como iconografía "seria" — se reemplazaron todos por SVG de
   línea minimalistas (offer-cards, sector-cards, dock del admin, selector de
   tipo de negocio en login).
2. **Paleta sin verdes** — el usuario pidió explícitamente sacar el verde por
   accesibilidad/contraste. Paleta actual (variables CSS `--dark-green`,
   `--moss`, `--midnight` mantienen esos NOMBRES por legado pero ya no son
   verdes):
   - tinta oscura `#1E1712` (antes verde oscuro)
   - terracota `#A9714F` (antes musgo)
   - vino `#6B2A45` (antes verde-azulado/midnight)
   - rosado `#D3968C` (sin cambios, ya combinaba bien)
   - crema `#F7F4D5` (fondo base, sin cambios)
   No reintroducir tonos verdes en ningún lado (revisar antes de usar `green`
   o hex con G dominante).
3. **Imágenes reales del usuario** (en `imagenes/`, usadas literalmente, NO
   recreadas en SVG):
   - `fondo.png` — cerezo + pagoda + lago (ink-wash). Fondo fijo de **toda**
     la página del landing (`.page-bg` en `styles.css`) y del menú/nav.
   - `fondos.png` — bonsái. Fondo del panel de admin (`.bg-texture` en
     `admin.css`), muy sutil.
   - `login.png` — Monte Fuji + cerezos + lago. Panel derecho del login
     (`.auth-art-panel`). El usuario dijo explícitamente "dejalo así" — no
     tocar esta imagen ni su posición.
   - `koi.png` — koi negro/rojo + sol rojo, ink-wash. Fondo exterior de la
     página de login (`body` en `login.css`), afuera de la tarjeta.
   Todas las secciones que tienen la foto de fondo usan overlays con
   `rgba(...)` de baja opacidad (no colores sólidos) para que la foto se note
   — el usuario pidió explícitamente "que se vea demasiado más, que parezca
   que esa foto es el fondo". Si se agregan secciones nuevas, seguir ese
   mismo patrón (fondo fijo + overlay traslúcido, nunca opaco).
4. **Flujo de inventario y proveedores (importante, cambia el modelo de
   datos):**
   - Inventario es **solo lectura** — no hay botón de "agregar" ahí.
   - Cada proveedor ya agregado (`STATE.providersAdded`) es clickeable: abre
     un modal de **catálogo** que muestra `STATE.inventory` completo (precio +
     stock actual) con un input de cantidad y botón "+ Agregar".
   - Lo agregado cae en un **carrito** (dentro del mismo modal, en memoria,
     se pierde si cerrás el modal sin confirmar).
   - "Confirmar compra" suma las cantidades directo al `stock` de
     `STATE.inventory` y persiste. No crea productos nuevos — el catálogo
     siempre es el inventario existente (interpretación: "el proveedor surte
     los productos que ya tenemos en inventario").
   - Ver `openProviderCatalog()` en `admin.js`.
5. **Rubros y su vocabulario** (no mezclar entre tipos):
   - Clínica → insumos, proveedores médicos (IMED, Dipromequi, DINVER, RIM,
     Mundo Médico Químico, Medical Systems El Salvador), clientes = pacientes.
   - Pupusería → ingredientes, proveedores de alimentos (Lácteos Esmeralda,
     Agrosalva, Sabor Amigo, MOLSAL), clientes = comensales.
   - Taller → repuestos, proveedores automotrices (Econoparts, Súper
     Repuestos, Impressa Repuestos, ROMAN AUTOMOTRIZ, INCAPRO), clientes =
     clientes.
   - Todo esto vive en `data.js` (`PRODUCTS`, `PROVIDERS`, `BUSINESS_TYPES`).

## Cómo previsualizar

No hay servidor de por sí — es estático. Levantar cualquier server simple
desde la carpeta `innovasistem/`:

```bash
python -m http.server 8765
```

y abrir `http://localhost:8765`. `admin.html` redirige a `login.html` si no
hay `innova_account` en localStorage.

## Pendientes / posibles próximos pasos

Nada pendiente confirmado por el usuario a la fecha de este commit — el
sistema cubre todo lo pedido (landing, login/registro por rubro, inventario,
ventas con gráficas, proveedores con catálogo+carrito, clientes/facturación,
ingresos, pagos, modo claro/oscuro). Si el usuario pide algo nuevo, agregarlo
respetando los 5 puntos de arriba antes de proponer cambios visuales o de
flujo por cuenta propia.

## Repositorio

- GitHub (privado): https://github.com/johansandoval2020-crypto/InnovaSistem
- Dueño: johansandoval2020-crypto
