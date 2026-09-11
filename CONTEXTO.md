# InnovaSistem — Contexto del proyecto

Sitio estático (HTML/CSS/JS puro, sin build, sin npm) para un sistema de gestión
pensado para tres rubros: **Clínica**, **Pupusería** y **Taller automotriz**.

Si estás retomando esto en una conversación nueva de Claude: leé este archivo
completo antes de tocar código. Resume decisiones ya tomadas para no repetir
preguntas ni deshacer trabajo.

## Estructura de archivos

- `index.html` / `styles.css` / `main.js` — landing pública. **Desde
  2026-09-11 el index SOLO tiene el hero** (título + CTA + 1 stat) más el
  cta-band final y el footer — ya NO es una sola página larga con scroll.
  Las 4 secciones que antes eran anchors (`#funciona`/`#problemas`/
  `#ofrecemos`/`#sectores`) ahora son páginas HTML independientes:
  `como-funciona.html`, `problemas.html`, `que-ofrecemos.html`,
  `sectores.html`. Cada una reutiliza el mismo `styles.css`, el mismo
  nav/mobileMenu/footer (con los links ya apuntando a los `.html`
  correspondientes en vez de a anchors), y termina con el mismo
  cta-band antes del footer. Si se agrega una sección nueva a la
  landing, seguir este mismo patrón (página propia, no anchor) — el
  usuario pidió explícitamente que el menú navegara a páginas
  distintas en vez de hacer scroll dentro de una sola página.
- `login.html` / `login.css` / `login.js` — login (negocio + administrador) y
  registro (con selector de tipo de negocio).
- `admin.html` / `admin.css` / `admin.js` — panel de administración de UN
  negocio (SPA con vistas por `data-view`, todo en localStorage, sin backend
  real).
- `superadmin.html` / `superadmin.js` — panel de administración GENERAL de la
  plataforma (ve todos los negocios registrados). Reutiliza `admin.css`
  directamente (no tiene su propio CSS) — mismo dock, mismas kpi-card/
  panel-box/item-card/data-table, mismo fondo. Ver punto 8 más abajo.
- `data.js` — datos semilla: productos, proveedores y tipos de negocio
  (`PRODUCTS`, `PROVIDERS`, `BUSINESS_TYPES`). Ya no genera clientes/ventas
  de ejemplo (ver punto 6).
- `imagenes/` — assets reales que el usuario proveyó (ver abajo).

No hay backend. Todo vive en `localStorage`:
- `innova_accounts` — **array** con TODOS los negocios registrados en el
  navegador: `{id, businessName, ownerName, email, password, type,
  createdAt}`. Es la "base de datos" de clientes de la plataforma.
- `innova_account` — snapshot del negocio con la sesión ACTIVA en este
  momento (uno de los objetos de `innova_accounts`, copiado ahí al hacer
  login). `admin.js` lo lee para saber quién entró.
- `innova_business_<id>` — el estado completo de un negocio (inventario,
  proveedores agregados, clientes, ventas, pagos), donde `<id>` es el
  `account.id` generado al registrarse (NO el tipo — ver punto 8, antes era
  por tipo y chocaban negocios del mismo rubro).
- `innova_orders` — array global de pedidos a proveedores hechos por
  cualquier negocio (lo lee `superadmin.html`). Ver punto 8.
- `innova_admin_session` — `'1'` cuando hay una sesión de administrador de
  plataforma activa (gate de `superadmin.html`).
- `innova_theme` — tema claro/oscuro (compartido por `admin.html` y
  `superadmin.html`).

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
     Tarjetas de la landing en `styles.css` — pasaron por DOS ajustes de
     paleta después del rediseño inicial, hasta llegar al estado final
     (2026-09-11): primero se probó una mezcla de pasteles claros +
     algunas oscuras, pero el usuario mandó capturas mostrando que
     quedaba desordenado ("cámbiame todo esto") y pidió explícitamente
     el MISMO azul oscuro en TODAS las tarjetas de la landing, sin
     mezclar con claros. Estado final: `--p-navy` (#1E2A52) y `--p-deep`
     (#223159) — dos tonos de azul oscuro casi iguales, alternados por
     `:nth-child(even)` solo para dar textura sutil — son el ÚNICO fondo
     de `.step-card`, `.problem-card` y `.offer-card`, y también de
     `.hero-inner`/`.section-head` (como `--glass-dark`, una versión con
     `rgba(22,28,58,.82)` + `backdrop-filter:blur` en vez de sólido).
     Todo el texto dentro de estas tarjetas/paneles es CLARO
     (`var(--beige)` / `rgba(241,238,255,.7-.75)`), nunca oscuro — si se
     agrega una tarjeta nueva a esta familia, seguir ese patrón (fondo
     `--p-navy` o `--p-deep`, texto beige/claro, nunca texto oscuro ni
     fondo pastel claro). Las variables intermedias de la primera
     iteración (`--p-lav`, `--p-ice`, `--p-steel`, y las de la MUY
     primera iteración `--p-rose`/`--p-mint`/`--p-butter`/`--p-peach`)
     ya NO EXISTEN — no reintroducirlas. `--p-sky` (#DCEEFF) sigue
     viva pero solo como color de ACENTO (texto de `.tag`, `.hero .sub`,
     iconos), no como fondo de tarjeta. También se quitó el rosa
     (`var(--rosy-dark)`) del `.seal` de las offer-cards y del `.rule`
     de las sector-cards, ahora usan `var(--moss)`/`var(--p-sky)`, y el
     wash de `.sector-band` pasó de lavanda claro a oscuro
     (`rgba(10,8,30,.25)`) para no cortar el mood oscuro. El botón
     "Ver cómo funciona" (`.hero-cta .btn-outline`) tiene su propio
     override de color porque el genérico `.btn-outline` asume fondo
     claro (se usa también en el nav, que sigue siendo una píldora
     clara) — si el hero-inner vuelve a ser claro algún día, revisar
     ese override. Seguir sin reintroducir verdes ni amarillos/rosas/
     naranjas/pasteles claros en los fondos de tarjetas de la landing.
   - **Imágenes** (en `imagenes/`, usadas literalmente, NO recreadas en SVG):
     - `cromo.png` — tela/satín azul metálico abstracto. Es el **fondo fijo
       de TODO el sitio**, aplicado directo en `body` (`background-image` +
       `background-attachment:fixed`) en `styles.css`/`login.css`/`admin.css`
       — reemplaza a los antiguos `fondo.png`/`koi.png`/`fondos.png`
       (ELIMINADOS del proyecto, ya no existen en `imagenes/`). NO se usa un
       div `.page-bg`/`.bg-texture` separado — se probó y en algunos motores
       de render (headless) un div fijo aparte no pintaba bien al hacer
       scroll; ponerlo directo en `body` es más confiable. No revertir a un
       div separado sin probar bien el scroll primero.
     - `cuadro.png` — textura metálica azul/plata (distinta de `cromo.png`,
       más plateada). Fondo de las `.sector-card` (Clínica/Pupusería/Taller)
       en `styles.css`, con un degradado oscuro encima para legibilidad.
     - `orbe.png` — esfera de cristal violeta/dorada. Se usa en dos lugares:
       (a) como imagen del panel derecho del login (`.auth-art-panel`,
       reemplaza a `login.png`, también eliminado — el usuario pidió
       explícitamente este cambio, anulando la instrucción anterior de
       "dejalo así"); (b) como textura de los **mini-orbes decorativos**
       (`.mini-orb`, clase `.orb-field`) repartidos y animados
       (`@keyframes orb-float`) en index/login/admin/superadmin. Los tamaños
       (`.mini-orb.oN{width;height}`) se redujeron el 2026-09-10 a pedido del
       usuario ("más pequeños") — son sutiles a propósito, no agrandarlos.
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
   ejemplo). El inventario solo sube al comprarle a un proveedor. Se
   re-siembra automáticamente en 0 la primera vez que `admin.js` no
   encuentra `innova_business_<id>` para ese negocio (ver punto 8 para cómo
   se genera `<id>` ahora).
7. **Se eliminó la sección "Mi negocio"** — el botón del dock
   (`data-view="negocio"`), la `<section id="view-negocio">`, la función
   `renderNegocio()` y la clase CSS `.locked-type` ya no existen. El nombre
   del negocio se sigue mostrando en el topbar (`#bizName`) desde
   `STATE.name`, pero no hay pantalla para editarlo — si el usuario pide
   poder cambiar nombre/teléfono/dirección después, hay que crear una
   pantalla nueva (no revivir la vieja).
8. **Multi-negocio + panel de super-admin (2026-09-10)** — antes solo podía
   existir UN negocio por browser por rubro (`innova_account` único,
   `innova_business_<tipo>` compartido). Ahora hay un modelo de varias
   cuentas y un segundo rol de administrador de plataforma:
   - **Registro ya NO inicia sesión.** `panelRegister` en `login.js` guarda
     la cuenta en el array `innova_accounts` (con un `id` único
     `uid('biz')`) y devuelve a la pestaña de login con un mensaje — el
     usuario tiene que iniciar sesión con el correo/contraseña que acaba de
     crear. No usar `admin.html` como destino directo del registro.
   - **Login de negocio** (`panelLogin`) busca en `innova_accounts` por
     email+password, y si matchea guarda ese objeto en `innova_account`
     (sesión activa) y va a `admin.html`.
   - **Login de administrador** es un tercer panel (`panelAdminLogin`) al
     que se llega con el link "¿Sos administrador de la plataforma?" debajo
     del login normal (no es una pestaña principal, es un sub-estado dentro
     de "Iniciar sesión"; `initTabs()` en `login.js` maneja el show/hide de
     los 3 panels: login / register / adminLogin). Solo valida
     **el correo**, hardcodeado como `admin24@gmail.com`
     (`ADMIN_EMAIL` en `login.js`) — la contraseña no se verifica contra
     nada real, es solo de forma. Si matchea, pone
     `innova_admin_session='1'` y va a `superadmin.html`. Si el usuario
     pide cambiar ese correo o agregar contraseña real, es un cambio de una
     línea en `login.js` (`ADMIN_EMAIL`).
   - **`admin.js` ya no usa `TYPE` como clave de storage** — usa
     `BIZ_ID = account.id || account.type` (el fallback a `type` es solo
     para no romper una sesión vieja de antes de este cambio). Todo
     `loadState()`/`saveState()` usa `'innova_business_' + BIZ_ID`. Esto es
     lo que permite que dos negocios del mismo rubro (dos "Clínica", por
     ejemplo) tengan inventario/ventas totalmente independientes.
   - **Pedidos a proveedores → visibles para el super-admin.** Cuando un
     negocio confirma una compra en `openProviderCatalog()` (admin.js), ya
     no solo suma stock: también llama a `pushOrder()`, que agrega un
     registro a `innova_orders` con negocio, dueño, proveedor, ítems
     comprados, total, fecha del pedido y una fecha de llegada simulada
     (`arrivalDate`, hoy + 2 a 6 días al azar). `superadmin.html` calcula el
     estado como "En camino" o "Entregado" comparando `arrivalDate` con la
     fecha de hoy — no hay un tercer estado ni back-office real de logística,
     es solo una simulación de seguimiento.
   - **`superadmin.html`** — mismo dock visual que `admin.html` (reutiliza
     `admin.css`), pero con 4 vistas propias, guardadas por
     `innova_admin_session` (si no está seteado, redirige a `login.html`):
     - `Resumen`: KPIs agregados de TODOS los negocios (cuántos negocios,
       ingresos generados sumando `sales` de cada uno, "tu comisión" —
       un **10% fijo hardcodeado** en `COMMISSION_RATE` en
       `superadmin.js`, es un valor de ejemplo, no un dato real del
       negocio — y pedidos en camino) + gráfica agregada + últimos
       movimientos de cualquier negocio.
     - `Ingresos`: tabla de negocio → dueño → rubro → ingresos generados,
       ordenada de mayor a menor.
     - `Clientes`: en este panel "cliente" = un NEGOCIO registrado en la
       plataforma (no un cliente final) — tarjetas con nombre del negocio,
       nombre del dueño, rubro, correo y fecha de registro, leídas de
       `innova_accounts`.
     - `Pedidos`: tabla de `innova_orders` con negocio, productos, total,
       fecha del pedido, días restantes para llegar y estado.
     - `superadmin.js` duplica un puñado de helpers pequeños de `admin.js`
       (charts SVG, `money`, tema, nav) porque no hay sistema de módulos —
       es intencional, no un descuido; si se edita un chart hay que
       replicar el cambio en ambos archivos.
   - Como esto es 100% localStorage sin backend, el super-admin **solo ve
     negocios registrados en el mismo navegador/dispositivo** donde se abre
     `superadmin.html`. No hay sincronización entre dispositivos — es una
     limitación conocida de la arquitectura, no un bug.

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
sistema cubre todo lo pedido (landing, login/registro multi-cuenta, login de
administrador de plataforma, panel por negocio, panel general de super-admin,
inventario, ventas con gráficas, proveedores con catálogo+carrito+pedidos
rastreables, clientes/facturación, ingresos, pagos, modo claro/oscuro). Si el
usuario pide algo nuevo, agregarlo respetando los 8 puntos de arriba antes de
proponer cambios visuales o de flujo por cuenta propia.

## Repositorio

- GitHub (privado): https://github.com/johansandoval2020-crypto/InnovaSistem
- Dueño: johansandoval2020-crypto
