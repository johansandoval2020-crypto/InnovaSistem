# InnovaSistem — Contexto del proyecto

Sistema de gestión para negocios locales de El Salvador (más de 280 oficios):
HTML/CSS/JS puro + **PHP + MySQL (XAMPP)**, sin build ni npm.

Si estás retomando esto en una conversación nueva de Claude: leé este archivo
completo antes de tocar código. Resume decisiones ya tomadas para no repetir
preguntas ni deshacer trabajo. Las secciones de más abajo están en orden
cronológico; si algo se contradice, vale lo más nuevo (y esta primera sección).

## ▶ Dónde quedamos (2026-10-06) — empezar por acá

**Rama de trabajo: `php-mysql`** (NO `main`). `main` es la versión vieja con
localStorage que sigue publicada en Vercel (https://innovasistem.vercel.app);
Vercel no corre PHP, así que no mergear a `main` sin decidir el hosting.

### Cómo levantarlo en otra compu (casa)
1. Instalar XAMPP (Apache + MySQL + PHP 8).
2. `git clone https://github.com/johansandoval2020-crypto/InnovaSistem.git`
   y después `git checkout php-mysql`.
3. Poner la carpeta en `C:\xampp\htdocs\innovasistem` (copiarla, o crear un
   junction desde PowerShell:
   `New-Item -ItemType Junction -Path C:\xampp\htdocs\innovasistem -Target <carpeta del repo>`).
4. Encender Apache y MySQL en el XAMPP Control Panel.
5. En phpMyAdmin: crear la base `sistema_multinegocios` e importar
   **`database/hosting_completo.sql`** (base completa y actual, en cero).
   Alternativa: importar `database/sistema_multinegocios.sql` (el SQL
   original de la clase) y después `database/innovasistem_extra.sql`.
6. Abrir `http://localhost/innovasistem`. Usuarios de prueba del .sql:
   `mchayo`, `ngomez`, `dpirilin`, etc. con contraseña `1234`.
   Administrador general: `admin24@gmail.com` (cualquier contraseña).
7. Sin `api/config.php` se usan los datos de XAMPP (root sin contraseña).
   Al hacer commits, el autor tiene que ser la cuenta de GitHub
   `johansandoval2020-crypto` (Vercel bloquea commits de otros autores):
   `git config user.name "johansandoval2020-crypto"` y
   `git config user.email "258474288+johansandoval2020-crypto@users.noreply.github.com"`.

### Estado actual (todo funcionando en XAMPP)
- Landing (5 páginas), login/registro con buscador de 286 oficios, panel del
  negocio y panel de admin24, todo contra MySQL vía `api/*.php`.
- Tuerca ⚙ en todas las páginas: tema claro/oscuro, zoom, idioma ES/EN.
- Modo claro "Vivo" en todo el sitio (ver punto 15); sin mini-orbes.
- Correo de admin24 + correo tipo Gmail de cada negocio (ver punto 15).
- La base está **en cero** (sin ventas, pagos, pedidos, correos ni stock),
  con 13 negocios (los 10 del .sql + 3 creados por el usuario: Nataly
  Daniela, LAGALGA, Carlanguas) y 10 clientes.
  `database/reiniciar_en_cero.sql` vuelve a dejar los movimientos en cero.
- Los campos de los formularios **no tienen textos de ejemplo**
  (placeholders), a pedido del usuario; solo quedan los de los dos
  buscadores ("Buscar cliente…", "Buscar cliente o producto…").

### Pendiente / preguntas abiertas
1. **Eliminar en la base de datos:** el usuario pidió "poder eliminar". Ya se
   pueden borrar clientes, productos, proveedores del negocio, negocios
   (admin24) y correos. Falta confirmar si quiere **eliminar ventas** (con su
   factura y pago, devolviendo stock) y/o **pedidos**. Se le preguntó; sin
   respuesta todavía.
2. **Agregar productos:** el botón "Nuevo producto" se quitó a pedido del
   usuario; se le preguntó si lo quiere de vuelta.
3. **Publicar en línea:** se eligió **InfinityFree** (gratis, PHP + MySQL).
   Ya están listos `database/hosting_completo.sql` y
   `api/config.example.php` (copiar a `api/config.php` con los datos del
   hosting; ese archivo está en .gitignore). Falta que el usuario cree la
   cuenta y pase hostname / nombre de base / usuario (la contraseña la pone
   él). El `.zip` para subir se arma sin `database/`, `.git` ni notas.
4. Los buscadores todavía tienen texto; se ofreció cambiarlo por un ícono de
   lupa si lo quiere sin texto.

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

**Backend PHP + MySQL (desde 2026-10-05).** Ya NO se usa `localStorage`
para los datos (solo para `innova_theme`, el tema claro/oscuro). Todo vive
en la base MySQL `sistema_multinegocios` de XAMPP:
- `database/sistema_multinegocios.sql` — el SQL ORIGINAL del usuario (tarea
  de clase): 11 tablas (negocios, roles, usuarios, categorias, proveedores,
  productos, clientes, ventas, detalle_venta, facturas,
  inventario_movimientos) + datos de ejemplo (Pupusería Doña Chayo, Taller
  Don Natalio, Clínica El Pirilin; usuarios `mchayo`, `ngomez`, `dpirilin`…
  con contraseña `1234`). **No modificar ese archivo.**
- `database/innovasistem_extra.sql` — lo que la web agrega encima, sin
  borrar nada y re-ejecutable: `negocios.tipo` (id del oficio) +
  `fecha_registro`, `usuarios.usuario_login` hasta 100 (guarda el correo) y
  `contrasena` 255 (password_hash), `proveedores.descripcion` + `activo`
  (quitar proveedor = activo 0, no se borra), `clientes.id_negocio`,
  `ventas.metodo_pago` + `estado`, y tablas nuevas `pagos`, `pedidos`,
  `detalle_pedido`.
- `api/*.php` — API JSON con PDO y sesiones PHP: `conexion.php` (config,
  `ADMIN_EMAIL`, helpers), `registro.php`, `login.php` (acepta correo o
  usuario; las contraseñas en texto plano del .sql se aceptan una vez y se
  re-guardan con password_hash), `admin_login.php` (solo valida el correo,
  igual que antes), `logout.php`, `negocio.php` (GET = estado del panel en
  el mismo formato que usaba admin.js; POST seed = inventario inicial del
  oficio), `proveedores.php`, `comprar.php` (pedido + ENTRADA de
  inventario), `clientes.php`, `ventas.php` (+ `funciones_venta.php`:
  venta + detalle + factura + pago + SALIDA + stock), `pagos.php`,
  `superadmin.php` (GET todo / POST delete negocio en cascada).
- `api.js` — helper `window.innovaApi(file, body?)` que usan login.js,
  admin.js y superadmin.js. admin.js mantiene `STATE` con la misma forma,
  pero lo trae de `negocio.php` (`refresh()`) y cada cambio pasa por
  `act(file, body, msg)`.
- `data.js` sigue siendo el catálogo (oficios/categorías/proveedores
  sugeridos/productos de ejemplo) del lado del navegador; `ALIASES` mapea
  los tipos del .sql ('Comida', 'Taller Mecanico', 'Salud').
- El super-admin ahora ve TODOS los negocios de la base (ya no depende del
  navegador). Borrar un negocio borra también ventas/pedidos de otros
  negocios que apunten a sus productos/usuarios/clientes (pasa con los datos
  de ejemplo del .sql, que se cruzan entre negocios).
- **Funciones del panel (2026-10-05, pedidas por el usuario):**
  - Clientes: crear (con primera compra opcional), editar (nombre, tel,
    correo, dirección), eliminar y buscador. `api/clientes.php`
    (`action` create/update/delete). Eliminar = DELETE si no tiene ventas
    ni pagos; si tiene, `clientes.activo = 0`.
  - Productos (solo dueño): editar nombre/precio/stock (cambiar el stock a
    mano registra ENTRADA/SALIDA en inventario_movimientos) y eliminar (o
    `productos.activo = 0` si ya se vendió). `api/productos.php`. **NO hay
    botón "Nuevo producto"**: el usuario lo pidió quitar.
  - Venta con varios productos (una fila de detalle_venta por producto),
    valida stock suficiente. `api/ventas.php` + `funciones_venta.php`.
  - Factura de cada venta (modal + imprimir en ventana nueva).
    `api/factura.php?venta=ID`.
  - Buscador y filtro por fechas en Ventas.
  - Pagos: **se registran solos con cada venta** (no hay "Nuevo pago"; el
    usuario lo pidió quitar y se borró `api/pagos.php`).
  - **Se quitaron a pedido del usuario** (no volver a agregar sin que lo
    pida): la vista Reportes, la vista "Mi negocio" (datos del negocio +
    usuarios/roles; se borró `api/usuarios.php` y la acción update de
    `negocio.php`), el botón "Nuevo producto" y el botón "Nuevo pago".
  - `database/reiniciar_en_cero.sql`: deja ventas, facturas, pagos,
    pedidos, movimientos y stock en 0, conservando negocios, usuarios,
    clientes, productos y proveedores. El usuario pidió arrancar así; la
    base quedó en cero el 2026-10-05.
  - El usuario planea después una "contraparte": la vista del CLIENTE que
    compra en un negocio y ve sus compras. `clientes.correo` existe para eso.
- **Vercel no corre PHP**: la versión de Vercel quedó con localStorage
  (commit 67b3289). Si se sube esta versión a `main`, el login/panel en
  Vercel deja de funcionar — para tenerlo en línea hace falta un hosting con
  PHP + MySQL.

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
     `--radius-lg/md/sm` (32/22/14px). El `.section-head` (landing) SÍ sigue
     siendo un panel de vidrio oscuro (`--glass-dark`, `rgba(22,28,58,.82)` +
     `backdrop-filter:blur`), pero el `.hero-inner` **YA NO tiene fondo**
     (2026-09-11, a pedido explícito del usuario: "este cuadro quitalo") —
     el h1/botones/stat del hero van directo sobre el fondo satín, sin panel
     detrás. Si se vuelve a pedir un fondo ahí, usar `--glass-dark` para
     mantener consistencia con `.section-head`. Mismo patrón glass+blur en
     kpi-card/panel-box/item-card/modal-box (admin) y auth-form-panel
     (login) — esos SÍ siguen con su panel de vidrio, no se tocaron.
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
5. **Oficios, categorías y proveedores (2026-10-05)** — ya NO hay solo 3
   rubros. El usuario pidió quitar las 3 tarjetas Clínica/Pupusería/Taller
   del registro y poder elegir "todos los trabajos del mundo".
   - `data.js` tiene `CATEGORIES` (30: salud, farmacia, odontologia, optica,
     laboratorio, comida, panaderia, cafeteria, carnes, abarrotes, belleza,
     automotriz, motos, transporte, construccion, electricidad, carpinteria,
     vidrio, moda, tecnologia, educacion, papeleria, agro, mascotas,
     limpieza, eventos, hoteleria, fitness, servicios, general) y
     `OCCUPATIONS` (~286 oficios `[id, nombre, categoría]`).
   - La CATEGORÍA define vocabulario (`unit`/`unitPlural`/`clientNoun`),
     productos del inventario y directorio de proveedores. Un oficio hereda
     todo de su categoría (barbería y salón ven los mismos proveedores).
   - Los proveedores son **empresas reales de El Salvador** investigadas en
     la web (~135 únicos). El usuario pidió "todos los del mundo"; se acordó
     limitar a El Salvador + grandes que venden en el país, y **solo
     empresas cuya existencia se confirmó** (no inventar nombres). Los
     productos y precios SÍ son de ejemplo.
   - Ids viejos `clinica`/`pupuseria`/`taller` se mantienen como oficios
     (categorías salud/comida/automotriz) para no romper cuentas existentes.
   - "Otro": el registro permite escribir un oficio que no está; se guarda
     como `type:'otro:<texto>'` y usa la categoría `general`.
   - API: `INNOVA_DATA.getType(id)`, `productsFor(id)`, `providersFor(id)`,
     `businessTypes`, `categories`. Ya no existen `products[TYPE]`,
     `providers[TYPE]`, `buildClients`, `buildSales` ni los iconos emoji.
   - Registro (`login.html`/`login.js`): buscador con lista agrupada por
     categoría (`#typeSearch` + oculto `#typeValue`, `initTypeSelect()`);
     `login.html` ahora carga `data.js`.
   - Landing: "Tres rubros" → "Cualquier oficio…" en `sectores.html` (las 3
     tarjetas ahora son Salud y belleza / Comida y comercio / Oficios y
     servicios), footer y textos dicen "oficio" en vez de "rubro", y el
     stat del hero dice 135 proveedores aliados.
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

9. **Hero simplificado (2026-09-11)** — el hero de `index.html` ya solo
   muestra UN dato destacado: `<div class="stat"><b data-count="135">0</b>
   <span>Tenemos 135 proveedores aliados</span></div>` dentro de
   `.stats.stats-single` (grid de 1 columna). Los otros tres contadores que
   había antes (rubros listos, clientes por negocio, % en tu control) se
   eliminaron a pedido del usuario — no volver a agregarlos sin que lo pida.
10. **Botón "eliminar negocio" en super-admin (2026-09-11)** — la vista
    Clientes de `superadmin.js` (`renderClientes()`) ahora tiene un botón ✕
    (`.del-biz-btn`) en cada tarjeta de negocio. Al hacer click, con
    `confirm()` de por medio, llama a `deleteBusiness(accId)`, que:
    - saca la cuenta de `innova_accounts`,
    - borra `innova_business_<id>`,
    - borra los pedidos de `innova_orders` que le pertenecían a ese negocio,
    y vuelve a pintar la lista sin recargar la página. Esto se agregó porque
    el usuario tenía negocios de prueba (duplicados de "ELpollasmetalicas",
    "El jajas") que quería limpiar y no había manera de hacerlo desde la UI.
11. **Documentación adicional para la tarea escolar del usuario** — existe
    `ESTRUCTURA_SITIO.md` en la raíz con un desglose de la estructura del
    sitio (páginas, secciones, menús, formularios, encabezado, footer,
    organización de contenidos, estructura de archivos) — lo pidió el
    usuario para un trabajo/documento sobre "Estructuración del sitio web"
    (parece un punto 9.1 de una rúbrica de clase). Si pide algo similar para
    otros puntos de esa rúbrica (9.2 HTML5 semántico, 9.3 CSS), respondé
    directamente en el chat basándote en el código real (no inventar) —
    ya se hizo una vez para 9.2 y 9.3 sin crear archivo nuevo.
12. **Respaldo del proyecto (2026-09-11)** — además de GitHub, todo el
    código (los 21 archivos de texto: html/css/js/md) está subido a una
    carpeta de Google Drive llamada "Innova sistem"
    (https://drive.google.com/drive/folders/1-npWslf-sSgctvZ6nj-VE9rz_oALVs0G).
    Las 5 imágenes de `imagenes/` NO se pudieron subir ahí (muy pesadas para
    la herramienta de texto de Drive) — hay una subcarpeta "imagenes" vacía
    esperando que el usuario las arrastre manualmente si quiere el respaldo
    completo.

13. **Cambios del 2026-10-05**:
    - Arreglos móviles: en <=640px el nav muestra solo logo + burger (los
      botones viven en `#mobileMenu`), h1 del hero más chico, y `initReveal`
      en `main.js` revela al instante lo que ya está en pantalla (en algunos
      celulares el hero quedaba invisible esperando al IntersectionObserver).
    - La píldora del nav y el `#mobileMenu` pasaron de claros a vidrio
      oscuro (`--glass-dark`), texto claro, botones violeta (`--moss`); el
      logo lleva un aro violeta. El `.btn-outline` del nav tiene override.
    - Se quitó el reloj "HORA LOCAL" del hero (HTML, CSS y `initClock`).
    - Al cambiar CSS/JS, subir el `?v=` en los HTML: los celulares cachean.

14. **Tuerca de ajustes en todas las páginas (2026-10-06)** — `ajustes.js` +
    `ajustes.css` + `i18n.js`, cargados en el `<head>` de las 8 páginas.
    - Botón tuerca arriba a la derecha: en la landing dentro de la barra
      (`<span data-ajustes-slot>` antes del burger), en los paneles al lado
      de "Cerrar sesión" (`.topbar-right`), en el login fijo arriba a la
      derecha. Abre un panel con **Tema** (claro/oscuro), **Zoom**
      (80–150 %, `html.style.zoom`) e **Idioma** (español/inglés).
    - Se guarda en localStorage: `innova_theme`, `innova_zoom`,
      `innova_lang`. Si no hay tema guardado se usa `data-default-theme`
      del `<html>`: landing = dark, login/paneles = light.
    - Se sacó el botón de tema del dock de admin/superadmin (y su
      `initTheme`): el tema ahora vive solo en la tuerca.
    - La landing ahora tiene modo claro y el login modo oscuro (overrides
      `html[data-theme=...]` al final de styles.css / login.css). La barra
      de la landing sigue oscura en los dos modos (pedido del usuario).
    - Traducción: `i18n.js` tiene `strings` (texto exacto ES → EN) y
      `patterns` (textos armados con datos). `ajustes.js` recorre los
      nodos de texto y un MutationObserver traduce lo que los paneles
      pintan después. **Si se agrega un texto nuevo a la web, sumarlo a
      i18n.js.** Nombres de productos, proveedores, oficios y las
      descripciones de proveedores quedan en español (son datos).
    - El "correo" que pidió el usuario terminó siendo la bandeja de admin24
      (ver punto 15), no una opción de la tuerca.

15. **Modo claro "Vivo" en todo el sitio + Correo de admin24 (2026-10-06)**
    - Modo claro elegido por el usuario: opción C "Vivo" (se probaron A
      "Perla" y B "Hielo"; no le gustaba el claro pálido). Fondo #F4F6FC con
      manchas radiales violeta/azul (sin la foto cromo), textos #0F1A3D,
      acentos con degradé #6C5CE7→#2B5BD7, tarjetas blancas con sombra.
      Aplicado en styles.css (landing; footer blanco SIN línea arriba, el
      usuario la pidió quitar; cta-band con degradé brillante y botón
      blanco), login.css (las 3 pantallas) y admin.css (paneles). El satín
      oscuro (cromo.png) queda solo en modo oscuro.
    - **Se quitaron los mini-orbes** de todas las páginas (pedido del
      usuario); orbe.png queda en imagenes/ sin usar.
    - **Correo** (solo panel de admin24, sección en el dock con contador de
      no leídos): tabla `correos` (tipo negocio/consulta/proveedor/pedido).
      Llegan solos: negocio nuevo (registro.php), aviso de proveedor cuando un
      negocio lo agrega (proveedores.php; texto aclara que es un aviso
      automático, NO un mensaje de la empresa real), pedido a proveedor
      (comprar.php) y consultas de los negocios (api/soporte.php, botón
      "Soporte" en el topbar del panel del negocio). admin24 filtra, marca
      leído/no leído, borra y responde consultas (api/correo.php).
      Helper: funciones_correo.php.
    - **Correo del negocio, tipo Gmail** (pedido del usuario: "que se abra
      como otro frame como un Gmail lite"): vista `view-correo` en admin.html
      (dock + botón "Correo" del topbar, ambos con contador). Carpetas
      Recibidos / Enviados, botón Redactar (consulta a InnovaSistem), lista y
      panel de lectura. Tabla `buzon_negocio` (tipo aviso/respuesta/pedido).
      Llegan: avisos que manda admin24 ("Nuevo aviso": a todos, a los que
      usan un proveedor, o a uno; atajo "Avisar a los negocios que lo usan"
      en los correos de proveedor — ej. "MOLSAL tiene problemas para
      enviar"), respuestas a consultas, "Pedido confirmado" (comprar.php) y
      "Tu pedido llegó" (se genera al abrir la bandeja cuando
      pedidos.fecha_llegada <= hoy; flag `pedidos.aviso_llegada`).
      API: api/buzon.php (reemplazó a soporte.php, que se borró).

## Deploy

- Vercel: https://innovasistem.vercel.app (se publica desde `main` de GitHub).

## Cómo correrlo (XAMPP)

1. Abrir el XAMPP Control Panel y encender **Apache** y **MySQL**.
2. La primera vez, en phpMyAdmin importar `database/sistema_multinegocios.sql`
   y después `database/innovasistem_extra.sql` (en esta PC ya están).
3. `C:\xampp\htdocs\innovasistem` es un *junction* que apunta a esta
   carpeta del repo, así que no hay que copiar archivos: abrir
   `http://localhost/innovasistem`.
4. Para la vista previa de Claude se usa el servidor embebido de PHP
   (`C:/xampp/php/php.exe -S localhost:5601`), configurado en
   `Proyecto fina/.claude/launch.json`.

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
