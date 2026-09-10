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
2. **Rediseño visual "cromático/pastel" (2026-09-09)** — el usuario pidió
   cambiar todo el aspecto visual: nuevo fondo, nueva paleta, cuadros
   redondeados, orbes decorativos animados. Reemplaza el look "ink-wash
   japonés" anterior (cerezos/koi/bonsái) que ya no aplica. Detalles:
   - **Paleta** — variables CSS `--dark-green`, `--moss`, `--midnight`,
     `--rosy` mantienen esos NOMBRES por legado (arrastrados de la paleta
     original) pero ahora son tonos violeta/azul/rosa cromáticos, NO verdes
     ni cafés/terracota:
     - `--dark-green` → `#221A3D` (índigo oscuro, antes tinta `#1E1712`)
     - `--moss` → `#6C5CE7` (violeta-azul vívido, antes terracota `#A9714F`)
     - `--midnight` → `#4A3F91` (azul-violeta profundo, antes vino `#6B2A45`)
     - `--rosy` → `#FFB8DD` (rosa pastel, antes rosado cálido `#D3968C`)
     - `--beige` → `#F1EEFF` (lavanda muy claro, antes crema `#F7F4D5`)
     - `--ink`/`--paper` también migraron a tonos fríos (`#1C1830` / `#FCFBFF`).
     Nuevas variables de tarjetas pastel/cromáticas en `styles.css`:
     `--p-lav`, `--p-sky`, `--p-rose`, `--p-mint`, `--p-butter`, `--p-peach` —
     se usan para rotar el fondo de step-cards/offer-cards/problem-cards.
     Seguir sin reintroducir verdes en ningún lado.
   - **Imágenes** (en `imagenes/`, usadas literalmente, NO recreadas en SVG):
     - `cromo.png` — tela/satín azul metálico abstracto. Es el **fondo fijo
       de TODO el sitio** (landing `.page-bg`, login `body`, admin
       `.bg-texture`) — reemplaza a los antiguos `fondo.png`/`koi.png`/
       `fondos.png` (ELIMINADOS del proyecto, ya no existen en `imagenes/`).
     - `orbe.png` — esfera de cristal violeta/dorada. Se usa en dos lugares:
       (a) como imagen del panel derecho del login (`.auth-art-panel`,
       reemplaza a `login.png`, también eliminado — el usuario pidió
       explícitamente este cambio, anulando la instrucción anterior de
       "dejalo así"); (b) como textura de los **mini-orbes decorativos**
       (`.mini-orb`, clase `.orb-field`) repartidos y animados
       (`@keyframes orb-float`) en las tres páginas (index/login/admin).
     - `ois.png` — dos peces (betta) japoneses con caracteres 五条夏油. Subida
       por el usuario junto con las otras dos pero **no se usó** en ningún
       lado (no fue mencionada en las instrucciones de rediseño) — queda en
       `imagenes/` disponible por si se pide usarla después.
   - **Overlay del fondo fijo**: gradiente oscuro translúcido
     (`rgba(10,8,30,…)` / `rgba(6,4,20,…)` en modo oscuro del admin) sobre
     `cromo.png`, mucho más sutil que la paleta anterior — la imagen debe
     notarse fuerte, el overlay solo da legibilidad de fondo.
   - **"Cuadros redondeados" en toda la información ya existente**: se subió
     `--radius-lg/md/sm` (32/22/14px) y además el `.hero-inner` y
     `.section-head` (landing) ahora son paneles de vidrio pastel
     (`background:rgba(252,251,255,.82)` + `backdrop-filter:blur`) en vez de
     texto flotando directo sobre el fondo — así el texto sigue con tinta
     oscura legible aunque el fondo de página ahora es oscuro. Mismo patrón
     glass+blur en kpi-card/panel-box/item-card/modal-box (admin) y
     auth-form-panel (login). Si se agregan bloques de info nuevos, seguir
     este patrón (glass pastel + radio grande), no texto plano sobre imagen.
   - Se eliminaron los pétalos de sakura cayendo (`.petals`/`initPetals` en
     login) y el SVG de pétalos del panel de login (`.art-petals-svg`) —
     sustituidos por los mini-orbes, que son el nuevo motivo decorativo del
     sitio.
3. **Imágenes anteriores (ELIMINADAS, ya no existen)**: `fondo.png`,
   `fondos.png`, `login.png`, `koi.png` — si algún commit viejo o memoria
   previa las menciona, ignorar esa referencia; el fondo del sitio es
   `cromo.png` en todos lados desde el rediseño del punto 2.
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
6. **Panel arranca en cero (2026-09-09)** — `seedState()` en `admin.js` ya no
   llama a `buildClients`/`buildSales`: un negocio nuevo arranca con
   `clients:[]`, `sales:[]`, `payments:[]` y el inventario con `stock:0` en
   todos los productos (antes tenía stock inicial y 20 clientes/ventas de
   ejemplo). El inventario solo sube al comprarle a un proveedor. Esto
   aplica solo a cuentas nuevas — `login.js` borra
   `innova_business_<tipo>` al registrar, así que siempre re-siembra en 0.
7. **Se eliminó la sección "Mi negocio"** — el botón del dock
   (`data-view="negocio"`), la `<section id="view-negocio">`, la función
   `renderNegocio()` y la clase CSS `.locked-type` ya no existen. El nombre
   del negocio se sigue mostrando en el topbar (`#bizName`) desde
   `STATE.name`, pero no hay pantalla para editarlo — si el usuario pide
   poder cambiar nombre/teléfono/dirección después, hay que crear una
   pantalla nueva (no revivir la vieja).

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
