/* ==========================================================================
   InnovaSistem — catálogo de oficios, categorías, productos y proveedores

   Cada OFICIO (lo que el usuario elige al registrarse) pertenece a una
   CATEGORÍA. La categoría define el vocabulario del panel (insumos /
   ingredientes / repuestos…), los productos del inventario y el directorio
   de proveedores. Los proveedores son empresas reales de El Salvador
   (investigadas en oct-2026); los productos y precios son de ejemplo.

   Los ids 'clinica', 'pupuseria' y 'taller' se mantienen tal cual para no
   romper las cuentas creadas antes de este cambio.
   Un oficio escrito a mano ("Otro") se guarda como 'otro:<texto>' y usa la
   categoría 'general'.
   ========================================================================== */
(function(){
  "use strict";

  /* ---------------- categorías ---------------- */
  var CATEGORIES = {
    salud: {
      label:'Salud y medicina', unit:'insumo', unitPlural:'insumos', clientNoun:'paciente',
      products:[
        {name:'Jeringa desechable 5ml', price:0.35},
        {name:'Guantes de nitrilo (caja x100)', price:8.50},
        {name:'Gasas estériles 10x10', price:0.20},
        {name:'Alcohol gel 500ml', price:3.75},
        {name:'Termómetro digital', price:6.90},
        {name:'Mascarilla quirúrgica (caja x50)', price:5.20},
        {name:'Suero fisiológico 1000ml', price:2.10},
        {name:'Baja lenguas (paquete x100)', price:1.60},
        {name:'Algodón hidrófilo 500g', price:2.90},
        {name:'Cinta adhesiva médica', price:1.25}
      ],
      providers:[
        {name:'Importaciones Médicas de El Salvador (IMED)', desc:'Importador y distribuidor de insumos médicos generales.'},
        {name:'Mundo Médico Químico', desc:'Suministro de reactivos, insumos y equipo médico-químico.'},
        {name:'Medical Systems El Salvador', desc:'Equipos y sistemas médicos para clínicas y hospitales.'},
        {name:'Dipromequi', desc:'Insumos y dispositivos médicos; también ofrecen capacitaciones.'},
        {name:'DINVER', desc:'Insumos médicos y hospitalarios al por mayor.'},
        {name:'RIM', desc:'Distribución mayorista de jeringas, agujas, gasas y otros insumos médicos.'},
        {name:'Droguería Santa Lucía', desc:'Distribuidora de productos de salud a hospitales, farmacias y clínicas desde hace más de 90 años.'}
      ]
    },
    farmacia: {
      label:'Farmacias y droguerías', unit:'medicamento', unitPlural:'medicamentos', clientNoun:'cliente',
      products:[
        {name:'Acetaminofén 500mg (caja x100)', price:3.50},
        {name:'Ibuprofeno 400mg (caja x50)', price:4.25},
        {name:'Amoxicilina 500mg (caja x21)', price:6.80},
        {name:'Loratadina 10mg (caja x10)', price:2.40},
        {name:'Omeprazol 20mg (caja x14)', price:3.10},
        {name:'Suero oral (sobre)', price:0.60},
        {name:'Vitamina C 1g (tubo x10)', price:2.90},
        {name:'Alcohol 70% 1 litro', price:3.20},
        {name:'Curitas (caja x100)', price:2.75},
        {name:'Jarabe para la tos 120ml', price:4.60}
      ],
      providers:[
        {name:'Droguería Americana', desc:'Una de las distribuidoras farmacéuticas más grandes de El Salvador.'},
        {name:'Droguería Santa Lucía', desc:'Distribuye medicamentos a hospitales, farmacias, supermercados y tiendas.'},
        {name:'Droguería Divepharma', desc:'Droguería autorizada para distribución de medicamentos.'},
        {name:'Droguería Morazán', desc:'Laboratorio farmacéutico y droguería en San Salvador.'},
        {name:'Droguería Integral', desc:'Distribución de productos farmacéuticos.'}
      ]
    },
    odontologia: {
      label:'Odontología', unit:'insumo dental', unitPlural:'insumos dentales', clientNoun:'paciente',
      products:[
        {name:'Resina compuesta (jeringa 4g)', price:18.00},
        {name:'Anestesia local (caja x50 cartuchos)', price:32.00},
        {name:'Agujas dentales (caja x100)', price:12.50},
        {name:'Brackets metálicos (kit)', price:25.00},
        {name:'Guantes de látex (caja x100)', price:7.50},
        {name:'Baberos desechables (paquete x125)', price:6.00},
        {name:'Ionómero de vidrio', price:22.00},
        {name:'Fresas de diamante (kit)', price:15.00},
        {name:'Alginato 450g', price:9.50},
        {name:'Eyectores de saliva (bolsa x100)', price:4.25}
      ],
      providers:[
        {name:'Orthodent & Suministros', desc:'Distribuidor de insumos dentales y ortodoncia en Medicentro La Esperanza.'},
        {name:'StarDent', desc:'Distribuidor oficial de 3M Solventum: resinas, implantes e insumos clínicos.'},
        {name:'Promadent', desc:'Insumos, equipos y materiales para clínicas dentales (Santa Ana).'},
        {name:'Corpodent', desc:'Importa y distribuye marcas dentales internacionales; sedes en San Salvador y San Miguel.'},
        {name:'Suministros Dentales de El Salvador', desc:'Depósito dental en Medicentro La Esperanza.'}
      ]
    },
    optica: {
      label:'Óptica', unit:'producto óptico', unitPlural:'productos ópticos', clientNoun:'paciente',
      products:[
        {name:'Armazón metálico', price:18.00},
        {name:'Armazón de acetato', price:22.00},
        {name:'Lente monofocal (par)', price:20.00},
        {name:'Lente bifocal (par)', price:35.00},
        {name:'Lente de policarbonato (par)', price:30.00},
        {name:'Lentes de contacto mensuales (caja)', price:24.00},
        {name:'Solución para lentes de contacto 360ml', price:9.50},
        {name:'Estuche para lentes', price:2.50},
        {name:'Paño de microfibra', price:0.80},
        {name:'Cordón para lentes', price:1.50}
      ],
      providers:[
        {name:'Prolens Laboratorio Óptico', desc:'Laboratorio óptico con lentes y armazones.'},
        {name:'LOMED Laboratorio Óptico', desc:'Produce y distribuye lentes de fabricantes internacionales.'},
        {name:'INVERLENS', desc:'Laboratorio óptico con más de 31 años; lentes Free Form y policarbonato.'},
        {name:'Contacto Óptico', desc:'Distribuidor de armazones y lentes de contacto para ópticas.'},
        {name:'Optilab', desc:'Fabricación y distribución de productos ópticos.'}
      ]
    },
    laboratorio: {
      label:'Laboratorio clínico', unit:'reactivo', unitPlural:'reactivos', clientNoun:'paciente',
      products:[
        {name:'Tubos al vacío tapón rojo (caja x100)', price:14.00},
        {name:'Tubos al vacío tapón lila (caja x100)', price:15.00},
        {name:'Reactivo de glucosa', price:28.00},
        {name:'Tiras reactivas de orina (frasco x100)', price:18.00},
        {name:'Prueba rápida de embarazo (caja x50)', price:22.00},
        {name:'Lancetas (caja x200)', price:8.00},
        {name:'Portaobjetos (caja x72)', price:4.50},
        {name:'Puntas para micropipeta (bolsa x1000)', price:9.00},
        {name:'Frascos para muestra de orina (x100)', price:11.00},
        {name:'Alcohol isopropílico 1 galón', price:12.00}
      ],
      providers:[
        {name:'Distribuidora Vidlab', desc:'Equipos, insumos y reactivos para laboratorios clínicos.'},
        {name:'Analítica Salvadoreña', desc:'Insumos e instrumentos para control de calidad de laboratorios.'},
        {name:'Labindustrias', desc:'Soluciones para laboratorios clínicos en Centroamérica.'},
        {name:'FALMAR', desc:'Reactivos químicos para análisis.'}
      ]
    },
    comida: {
      label:'Restaurantes y comida', unit:'ingrediente', unitPlural:'ingredientes', clientNoun:'comensal',
      products:[
        {name:'Masa de maíz (lb)', price:0.55},
        {name:'Queso duro (lb)', price:3.20},
        {name:'Frijol refrito (lb)', price:1.10},
        {name:'Crema fresca (lb)', price:2.40},
        {name:'Arroz (quintal)', price:48.00},
        {name:'Pollo entero (lb)', price:1.65},
        {name:'Tomate (lb)', price:0.65},
        {name:'Aceite vegetal (galón)', price:6.30},
        {name:'Gas propano (cilindro 25lb)', price:14.00},
        {name:'Platos desechables (paquete x50)', price:2.80}
      ],
      providers:[
        {name:'Lácteos Esmeralda', desc:'Mayorista de comestibles en Soyapango.'},
        {name:'Agrosalva', desc:'Distribuidor de quesos y cremas para restaurantes.'},
        {name:'Sabor Amigo', desc:'Condimentos, especias y otros ingredientes para la industria alimentaria.'},
        {name:'MOLSAL', desc:'Más de 400 productos para food service: restaurantes, hoteles, panaderías y cafeterías.'},
        {name:'DISZASA (Distribuidora Zablah)', desc:'Distribución nacional de abarrotes, refrigerados y congelados desde 1969.'},
        {name:'THE MEAT SHOP (ALINSA)', desc:'Importa y distribuye carnes de res, cerdo y pollo para restaurantes.'},
        {name:'Diasa Empaques', desc:'Empaques y desechables para comida (San Salvador, San Miguel, Santa Tecla).'},
        {name:'Carvajal Empaques', desc:'Vasos, platos, bandejas y contenedores para foodservice.'}
      ]
    },
    panaderia: {
      label:'Panadería y repostería', unit:'ingrediente', unitPlural:'ingredientes', clientNoun:'cliente',
      products:[
        {name:'Harina de trigo fuerte (quintal)', price:42.00},
        {name:'Harina suave para repostería (quintal)', price:40.00},
        {name:'Azúcar (quintal)', price:46.00},
        {name:'Levadura instantánea 500g', price:3.80},
        {name:'Manteca vegetal (cubeta 50lb)', price:52.00},
        {name:'Huevos (cartón x30)', price:4.50},
        {name:'Mantequilla (lb)', price:3.10},
        {name:'Polvo de hornear 1kg', price:4.20},
        {name:'Cajas para pastel (x25)', price:9.00},
        {name:'Bolsas para pan (x100)', price:2.40}
      ],
      providers:[
        {name:'Molinos San Luis', desc:'Producción y venta de harinas para panadería.'},
        {name:'Molsa (Molinos de El Salvador)', desc:'Harinas como Molsa Fuerte para pan francés, bollería y pan dulce.'},
        {name:'Harinas El Salvador (Distribuidora Chavarría)', desc:'Harinas, grasas, desechables y domos para panaderías.'},
        {name:'Distribuidora Molina', desc:'Materias primas para panadería en el centro de San Salvador.'},
        {name:'MOLSAL', desc:'Insumos food service para panaderías y cafeterías.'},
        {name:'Corruplesa', desc:'Cajas de cartón para pasteles, panes y alimentos.'}
      ]
    },
    cafeteria: {
      label:'Cafeterías y bebidas', unit:'insumo', unitPlural:'insumos', clientNoun:'cliente',
      products:[
        {name:'Café en grano tostado (lb)', price:7.50},
        {name:'Leche entera (galón)', price:4.20},
        {name:'Azúcar (bolsa 5lb)', price:2.60},
        {name:'Jarabe saborizante 750ml', price:8.50},
        {name:'Vasos para café 12oz (x50)', price:4.00},
        {name:'Tapas para vaso (x50)', price:2.20},
        {name:'Gaseosa 600ml (fardo x12)', price:8.40},
        {name:'Agua embotellada 600ml (fardo x24)', price:6.00},
        {name:'Chocolate en polvo 1kg', price:7.80},
        {name:'Pajillas (paquete x500)', price:3.50}
      ],
      providers:[
        {name:'Academia Barista Pro', desc:'Café de especialidad al mayoreo con tueste artesanal y asesoría.'},
        {name:'Café de Don Justo', desc:'Productores y tostadores de café salvadoreño.'},
        {name:'Finca La Fortuna', desc:'Café orgánico de Concepción de Ataco con venta por mayor.'},
        {name:'Industrias La Constancia', desc:'Cervezas, gaseosas, agua, jugos y bebidas energéticas.'},
        {name:'Crio', desc:'Distribución de vinos, licores, bebidas y alimentos.'},
        {name:'Carvajal Empaques', desc:'Vasos, tapas y empaques para bebidas.'}
      ]
    },
    carnes: {
      label:'Carnicería, pollería y mariscos', unit:'producto', unitPlural:'productos', clientNoun:'cliente',
      products:[
        {name:'Carne de res para asar (lb)', price:4.25},
        {name:'Carne molida (lb)', price:3.10},
        {name:'Costilla de cerdo (lb)', price:2.90},
        {name:'Pechuga de pollo (lb)', price:2.40},
        {name:'Muslos de pollo (lb)', price:1.60},
        {name:'Chorizo (lb)', price:3.00},
        {name:'Salchicha (paquete x10)', price:2.20},
        {name:'Camarón (lb)', price:6.50},
        {name:'Bolsas para carne (x100)', price:1.80},
        {name:'Hielo (bolsa 10lb)', price:1.25}
      ],
      providers:[
        {name:'THE MEAT SHOP (ALINSA)', desc:'Carnes de res, cerdo y pollo por volumen con entrega en todo el país.'},
        {name:'Carnes y Embutidos La Anexión', desc:'Carnes y embutidos.'},
        {name:'Carnes San Mateo', desc:'Cortes de res, cerdo, pollo, pescado y embutidos.'},
        {name:'DISZASA (Distribuidora Zablah)', desc:'Almacenaje y distribución refrigerada y congelada.'},
        {name:'TOTO Plásticos', desc:'Empaques plásticos flexibles fabricados en El Salvador.'}
      ]
    },
    abarrotes: {
      label:'Tiendas y abarrotes', unit:'producto', unitPlural:'productos', clientNoun:'cliente',
      products:[
        {name:'Arroz (bolsa 5lb)', price:3.40},
        {name:'Frijol rojo (bolsa 5lb)', price:5.20},
        {name:'Azúcar (bolsa 5lb)', price:2.60},
        {name:'Aceite (botella 1L)', price:2.90},
        {name:'Huevos (cartón x30)', price:4.50},
        {name:'Gaseosa 2.5L', price:1.75},
        {name:'Pan de caja', price:2.10},
        {name:'Jabón de lavar (barra)', price:0.75},
        {name:'Papel higiénico (paquete x4)', price:1.90},
        {name:'Boquitas surtidas (caja x24)', price:6.00}
      ],
      providers:[
        {name:'DISZASA (Distribuidora Zablah)', desc:'Distribución nacional a supermercados, tiendas y conveniencias.'},
        {name:'Distribuidora Nacional', desc:'Abarrotes, bebidas, vinos, papelería, hogar y limpieza.'},
        {name:'La Mejor', desc:'Distribuidora de productos esenciales para tiendas pequeñas.'},
        {name:'Crio', desc:'Alimentos, bebidas, vinos y licores para tiendas y supermercados.'},
        {name:'Industrias La Constancia', desc:'Cervezas, gaseosas, agua y jugos.'},
        {name:'Todo Mayoreo El Salvador', desc:'Productos al por mayor con envíos a todo el país.'}
      ]
    },
    belleza: {
      label:'Belleza y cuidado personal', unit:'producto', unitPlural:'productos', clientNoun:'cliente',
      products:[
        {name:'Shampoo profesional 1L', price:9.50},
        {name:'Acondicionador profesional 1L', price:9.50},
        {name:'Tinte para cabello (tubo)', price:6.20},
        {name:'Peróxido 20 vol 1L', price:4.80},
        {name:'Gel para cabello 1kg', price:4.00},
        {name:'Navajas de afeitar (caja x100)', price:7.00},
        {name:'Esmalte de uñas', price:3.50},
        {name:'Acetona 1L', price:3.20},
        {name:'Toallas desechables (paquete x50)', price:6.50},
        {name:'Cera depilatoria 400g', price:5.80}
      ],
      providers:[
        {name:'El Rosal Beauty Supply', desc:'Más de 70 años distribuyendo productos para salones, mayoreo y detalle.'},
        {name:'La Latina Beauty', desc:'Productos profesionales al mayoreo para salones, barberías y tiendas.'},
        {name:'Grupo PROBE', desc:'Marcas profesionales como Schwarzkopf, Framesi, Tec Italy y Moroccanoil.'},
        {name:'Grupo ARYSA', desc:'Insumos para barberías, salones, uñas y spa (Wahl, VGR, KOKO Nails).'},
        {name:'Probelleza', desc:'Tienda en línea de productos profesionales para salones.'},
        {name:'Zoe Cosmetics El Salvador', desc:'Equipos y productos para salones y barberías con precio de mayoreo.'}
      ]
    },
    automotriz: {
      label:'Automotriz', unit:'repuesto', unitPlural:'repuestos', clientNoun:'cliente',
      products:[
        {name:'Batería 12V 650A', price:78.00},
        {name:'Amortiguador delantero', price:45.00},
        {name:'Aceite de motor 5W-30 (galón)', price:24.50},
        {name:'Filtro de aceite', price:6.50},
        {name:'Filtro de aire', price:8.90},
        {name:'Banda de distribución', price:32.00},
        {name:'Bujía de encendido', price:4.20},
        {name:'Pastillas de freno (juego)', price:28.00},
        {name:'Líquido de frenos 500ml', price:5.60},
        {name:'Refrigerante 1 galón', price:9.80}
      ],
      providers:[
        {name:'Econoparts • Soyapango', desc:'Repuestos, lubricantes, baterías, amortiguadores y equipo de diagnóstico. Venta al mayoreo.'},
        {name:'Súper Repuestos | Soyapango', desc:'Repuestos automotrices.'},
        {name:'Impressa Repuestos • Soyapango', desc:'Repuestos automotrices.'},
        {name:'ROMAN AUTOMOTRIZ SOYAPANGO', desc:'Accesorios automotrices al por mayor.'},
        {name:'INCAPRO', desc:'Importador y distribuidor de repuestos industriales y automotrices.'},
        {name:'CEMCOL', desc:'Distribuidor autorizado de lubricantes Mobil y llantas Michelin.'},
        {name:'DIPARVEL AutoCenter', desc:'Más de 50 años en venta y distribución de llantas.'},
        {name:'Unillantas', desc:'Distribuidor exclusivo de Dunlop, Falken y Sumitomo con departamento de mayoreo.'}
      ]
    },
    motos: {
      label:'Motos', unit:'repuesto', unitPlural:'repuestos', clientNoun:'cliente',
      products:[
        {name:'Llanta para moto 2.75-18', price:22.00},
        {name:'Cadena de transmisión', price:12.50},
        {name:'Kit de arrastre', price:28.00},
        {name:'Aceite 4T 20W-50 (litro)', price:5.50},
        {name:'Bujía para moto', price:2.80},
        {name:'Pastillas de freno para moto', price:6.00},
        {name:'Batería 12V para moto', price:24.00},
        {name:'Cable de clutch', price:4.50},
        {name:'Casco certificado', price:35.00},
        {name:'Espejos (par)', price:7.00}
      ],
      providers:[
        {name:'Moto Repuestos SV', desc:'Distribuidor exclusivo de NRP, CAMEL, RIDER y VOLT.'},
        {name:'Tecno Accesorios', desc:'Repuestos, accesorios, lubricantes y equipo de protección al mayoreo.'},
        {name:'Motocity El Salvador', desc:'Repuestos, lubricantes y accesorios de marcas reconocidas.'},
        {name:'Moto Centro Repuestos', desc:'Llantas, baterías y repuestos japoneses.'},
        {name:'René Repuestos', desc:'Distribuidor exclusivo de DURO, IMBRA, Vini, TECH y SPARK.'}
      ]
    },
    transporte: {
      label:'Transporte y logística', unit:'insumo', unitPlural:'insumos', clientNoun:'cliente',
      products:[
        {name:'Llanta para camión 11R22.5', price:285.00},
        {name:'Llanta rin 15', price:85.00},
        {name:'Aceite diésel 15W-40 (cubeta 5gal)', price:72.00},
        {name:'Filtro de combustible', price:14.00},
        {name:'Batería de camión 12V', price:145.00},
        {name:'Cinta de amarre con ratchet', price:18.00},
        {name:'Cajas de cartón para envío (x25)', price:15.00},
        {name:'Cinta de embalaje (x6)', price:6.00},
        {name:'Plástico stretch film', price:12.00},
        {name:'Chaleco reflectivo', price:4.50}
      ],
      providers:[
        {name:'MOTORED', desc:'Repuestos, llantas y aceites para vehículos pesados.'},
        {name:'CEMCOL', desc:'Camiones International, lubricantes Mobil y llantas Michelin.'},
        {name:'DIPARVEL AutoCenter', desc:'Llantas, servicio a flotas y reencauche en frío.'},
        {name:'American Petroleum', desc:'Aceites y lubricantes al por mayor para motores y maquinaria.'},
        {name:'RAC Llantas', desc:'Llantas, lubricantes y servicio a flotas.'},
        {name:'Corruplesa', desc:'Cajas de cartón y empaques.'}
      ]
    },
    construccion: {
      label:'Construcción y ferretería', unit:'material', unitPlural:'materiales', clientNoun:'cliente',
      products:[
        {name:'Cemento gris (bolsa 42.5kg)', price:9.25},
        {name:'Varilla de hierro 3/8 (6m)', price:5.60},
        {name:'Block de concreto 15x20x40', price:0.65},
        {name:'Arena (m³)', price:28.00},
        {name:'Clavos 2½" (libra)', price:1.10},
        {name:'Tubo PVC 1/2" (6m)', price:3.40},
        {name:'Pintura látex (galón)', price:18.50},
        {name:'Lámina galvanizada (12 pies)', price:14.00},
        {name:'Pegamento PVC 1/4 galón', price:6.80},
        {name:'Martillo de uña', price:9.00}
      ],
      providers:[
        {name:'Vidrí', desc:'Almacenes de ferretería y materiales de construcción.'},
        {name:'VIDUC', desc:'Herramientas, materiales y pinturas; representante exclusivo de Makita.'},
        {name:'Ferreterías Lemus', desc:'Herramientas, maquinaria, materiales, pinturas y material eléctrico.'},
        {name:'SUMERSA', desc:'Materiales de construcción, fontanería, techos y pintura; seis sucursales.'},
        {name:'Ferretería ADIMACON', desc:'Siete ferreterías con venta al detalle y mayoreo.'},
        {name:'Importaciones UNITEC', desc:'Fabricación y distribución mayorista de productos de ferretería.'},
        {name:'Sherwin Williams de Centro América', desc:'Pinturas, barnices y texturas.'}
      ]
    },
    electricidad: {
      label:'Electricidad e iluminación', unit:'material', unitPlural:'materiales', clientNoun:'cliente',
      products:[
        {name:'Cable THHN #12 (rollo 100m)', price:58.00},
        {name:'Cable THHN #14 (rollo 100m)', price:42.00},
        {name:'Tomacorriente doble', price:2.20},
        {name:'Interruptor sencillo', price:1.80},
        {name:'Breaker 20A', price:7.50},
        {name:'Caja térmica 8 espacios', price:32.00},
        {name:'Bombillo LED 9W', price:1.60},
        {name:'Lámpara LED panel 60x60', price:24.00},
        {name:'Tubo conduit 1/2"', price:2.30},
        {name:'Cinta aislante', price:0.90}
      ],
      providers:[
        {name:'JBatres Lighting', desc:'Iluminación LED y material eléctrico de baja tensión.'},
        {name:'MADESA El Salvador', desc:'Cables, postes, transformadores, conductores y herramientas.'},
        {name:'DIEXFE', desc:'Material eléctrico al por mayor con más de 43 años.'},
        {name:'ADMA Distribuidora', desc:'Materiales eléctricos e iluminación para instaladores y comercios.'},
        {name:'CELASA', desc:'Materiales eléctricos e iluminación.'},
        {name:'PELSA', desc:'Transformadores, conductores, canalización e iluminación.'},
        {name:'SESA de C.V.', desc:'Equipos y materiales eléctricos de media y alta tensión.'}
      ]
    },
    carpinteria: {
      label:'Carpintería y muebles', unit:'material', unitPlural:'materiales', clientNoun:'cliente',
      products:[
        {name:'Plywood de pino 4x8 (3/4")', price:38.00},
        {name:'MDF 4x8 (15mm)', price:29.00},
        {name:'Melamina blanca 4x8', price:42.00},
        {name:'Tabla de cedro (pie tablar)', price:3.80},
        {name:'Pegamento para madera (galón)', price:14.00},
        {name:'Barniz (galón)', price:22.00},
        {name:'Tinte para madera (litro)', price:8.50},
        {name:'Lija #120 (pliego)', price:0.60},
        {name:'Bisagras (par)', price:1.50},
        {name:'Tornillos para madera (caja x100)', price:3.20}
      ],
      providers:[
        {name:'Maderas La Oriental', desc:'Madera, plywood, MDF, melamina, barniz, tintes y molduras.'},
        {name:'Aserradero San Antonio', desc:'Cedro, caoba, tableros alistonados y plywood (Santa Tecla).'},
        {name:'Los Abetos', desc:'Importación y venta de maderas y productos para carpintería.'},
        {name:'SERMA', desc:'Maderas y tableros para carpintería y diseño.'},
        {name:'Ferreterías Lemus', desc:'Herramientas y ferretería en general.'}
      ]
    },
    vidrio: {
      label:'Vidrio y aluminio', unit:'material', unitPlural:'materiales', clientNoun:'cliente',
      products:[
        {name:'Vidrio claro 5mm (m²)', price:18.00},
        {name:'Vidrio templado 10mm (m²)', price:65.00},
        {name:'Espejo 4mm (m²)', price:22.00},
        {name:'Perfil de aluminio (6m)', price:16.00},
        {name:'Silicón transparente', price:4.50},
        {name:'Felpa para ventana (rollo)', price:6.00},
        {name:'Rodos para ventana corrediza (par)', price:3.00},
        {name:'Cerradura para vitrina', price:5.50},
        {name:'Tornillos autorroscantes (x100)', price:3.00},
        {name:'Ventosa para vidrio', price:12.00}
      ],
      providers:[
        {name:'Vidriería Los Ángeles', desc:'Importadora y procesadora de vidrios y espejos.'},
        {name:'Centro de Vidrio', desc:'Vidrio templado, laminado, insulado y aluminio.'},
        {name:'TINSA', desc:'Aluminio, PVC, vidrio, tabla roca y cielo falso al detalle y mayoreo.'},
        {name:'Vidriería Jerusalén', desc:'Vidriería en El Salvador.'}
      ]
    },
    moda: {
      label:'Moda, textiles y calzado', unit:'material', unitPlural:'materiales', clientNoun:'cliente',
      products:[
        {name:'Tela de algodón (yarda)', price:3.50},
        {name:'Tela de mezclilla (yarda)', price:4.80},
        {name:'Tela para uniforme (yarda)', price:3.90},
        {name:'Hilo de coser (cono)', price:2.20},
        {name:'Botones (bolsa x100)', price:2.50},
        {name:'Zíperes (paquete x12)', price:3.60},
        {name:'Elástico (rollo)', price:4.00},
        {name:'Agujas para máquina (x10)', price:2.80},
        {name:'Bolsas para tienda (x100)', price:5.50},
        {name:'Ganchos para ropa (x50)', price:6.00}
      ],
      providers:[
        {name:'Casatex', desc:'Distribuidor mayorista de telas para confección y hogar.'},
        {name:'Depósito de Telas', desc:'Telas y mercería con 32 sucursales en el país.'},
        {name:'El Centro Textil', desc:'Telas y toallas al mayoreo y detalle (Avenida Olímpica).'},
        {name:'Grupo Vazatex', desc:'Telas para uniformes industriales, escolares, ejecutivos y deportivos.'},
        {name:'Publiexport', desc:'Prendas textiles y artículos promocionales para distribuidores.'}
      ]
    },
    tecnologia: {
      label:'Tecnología y electrónica', unit:'producto', unitPlural:'productos', clientNoun:'cliente',
      products:[
        {name:'Cargador USB-C 20W', price:6.50},
        {name:'Cable USB-C (1m)', price:2.50},
        {name:'Protector de pantalla', price:1.20},
        {name:'Funda para celular', price:2.80},
        {name:'Audífonos inalámbricos', price:14.00},
        {name:'Memoria USB 64GB', price:7.00},
        {name:'Mouse inalámbrico', price:8.50},
        {name:'Pantalla de repuesto para celular', price:35.00},
        {name:'Batería de repuesto para celular', price:15.00},
        {name:'Cartucho de tinta', price:18.00}
      ],
      providers:[
        {name:'Tecno Avance', desc:'Distribuidor mayorista de computación con 30 años; sedes en San Salvador, San Miguel y Santa Ana.'},
        {name:'Intelmax', desc:'Distribuidor de Lenovo, HP, Dell, Asus, Acer, Samsung y más.'},
        {name:'Totalynk', desc:'Mayorista de celulares y electrónica (Samsung, Xiaomi, Motorola, Apple).'},
        {name:'TS Store (Computer Trading)', desc:'Tecnología con más de 30 años en el mercado salvadoreño.'},
        {name:'Steren El Salvador', desc:'Electrónica, cables y accesorios.'},
        {name:'Grupo Computodo', desc:'Consumibles de impresión: tintas, tóneres y papel.'}
      ]
    },
    educacion: {
      label:'Educación', unit:'material', unitPlural:'materiales', clientNoun:'alumno',
      products:[
        {name:'Cuadernos (paquete x10)', price:6.50},
        {name:'Lápices (caja x12)', price:1.80},
        {name:'Plumones para pizarra (x4)', price:3.20},
        {name:'Resma de papel bond carta', price:4.75},
        {name:'Folders (paquete x25)', price:3.50},
        {name:'Marcadores permanentes (x12)', price:5.00},
        {name:'Tóner para impresora', price:45.00},
        {name:'Borrador para pizarra', price:1.50},
        {name:'Pegamento en barra (x12)', price:4.80},
        {name:'Papel construcción (paquete)', price:3.00}
      ],
      providers:[
        {name:'Librería Moderna', desc:'Más de 3,500 productos escolares y de arte; más de un siglo de historia.'},
        {name:'Librería Cervantes', desc:'Útiles escolares, oficina, tecnología y arte.'},
        {name:'PaperPlus El Salvador', desc:'Productos de oficina y útiles escolares.'},
        {name:'Librería Emporium', desc:'Útiles escolares y de oficina con envíos a todo el país.'},
        {name:'Office Depot El Salvador', desc:'Papelería, oficina, impresión y tecnología.'}
      ]
    },
    papeleria: {
      label:'Librería e imprenta', unit:'insumo', unitPlural:'insumos', clientNoun:'cliente',
      products:[
        {name:'Resma de papel bond carta', price:4.75},
        {name:'Cartulina (pliego)', price:0.45},
        {name:'Papel couché (resma)', price:28.00},
        {name:'Tinta para impresora (botella)', price:9.00},
        {name:'Tóner para impresora', price:45.00},
        {name:'Folders (paquete x25)', price:3.50},
        {name:'Lapiceros (caja x12)', price:2.40},
        {name:'Engrapadora', price:5.50},
        {name:'Papel para sublimación (x100)', price:12.00},
        {name:'Sobres manila (x50)', price:4.00}
      ],
      providers:[
        {name:'ACOACEIG', desc:'Cooperativa de la industria gráfica: papel, cartón e insumos de impresión.'},
        {name:'REFILL El Salvador', desc:'Tintas, impresoras y productos de sublimación.'},
        {name:'Grupo Computodo', desc:'Cartuchos, tóneres y papel de impresión.'},
        {name:'Office Depot El Salvador', desc:'Papel, impresión y suministros de oficina.'},
        {name:'Librería Moderna', desc:'Papelería, útiles y artículos de arte.'},
        {name:'Importaciones Carranza P', desc:'Papelería, decoración y manualidades.'}
      ]
    },
    agro: {
      label:'Agro y ganadería', unit:'insumo', unitPlural:'insumos', clientNoun:'cliente',
      products:[
        {name:'Fertilizante 15-15-15 (quintal)', price:38.00},
        {name:'Urea (quintal)', price:34.00},
        {name:'Semilla de maíz (bolsa)', price:48.00},
        {name:'Herbicida (litro)', price:9.50},
        {name:'Insecticida (litro)', price:12.00},
        {name:'Concentrado para aves (quintal)', price:29.00},
        {name:'Concentrado para ganado (quintal)', price:26.00},
        {name:'Vitaminas para ganado (frasco)', price:14.00},
        {name:'Bomba de mochila 16L', price:45.00},
        {name:'Manguera de riego (rollo 50m)', price:22.00}
      ],
      providers:[
        {name:'El Surco', desc:'Productos agrícolas y asesoría especializada en sus agroservicios.'},
        {name:'La Casa del Agricultor', desc:'Insumos agrícolas, semillas y farmacia veterinaria desde 1980.'},
        {name:'Agroservicio La Finca', desc:'Productos veterinarios y concentrados al detalle y mayoreo.'},
        {name:'Agroservicio San Nicolás', desc:'Insumos agrícolas y veterinarios.'},
        {name:'Concentrados Agroamigo', desc:'Alimento balanceado para aves, ganado, cerdos, caballos y tilapia.'},
        {name:'Disagro El Salvador', desc:'Fertilizantes, agroquímicos y químicos industriales.'}
      ]
    },
    mascotas: {
      label:'Mascotas y veterinaria', unit:'producto', unitPlural:'productos', clientNoun:'cliente',
      products:[
        {name:'Concentrado para perro adulto (bolsa 20kg)', price:38.00},
        {name:'Concentrado para gato (bolsa 10kg)', price:28.00},
        {name:'Arena para gato 10kg', price:9.00},
        {name:'Desparasitante (tableta)', price:3.50},
        {name:'Vacuna antirrábica (dosis)', price:6.00},
        {name:'Shampoo para perro 500ml', price:5.50},
        {name:'Collar antipulgas', price:7.50},
        {name:'Correa para perro', price:6.00},
        {name:'Juguete para mascota', price:3.00},
        {name:'Jeringas desechables (caja x100)', price:9.00}
      ],
      providers:[
        {name:'Insagro', desc:'Alimentos, medicamentos y accesorios para mascotas con envío a todo el país.'},
        {name:'GoPet', desc:'Alimento, juguetes, medicinas y accesorios para mascotas.'},
        {name:'La Casa del Agricultor', desc:'Farmacia veterinaria para mascotas y animales de granja.'},
        {name:'Agroservicio La Finca', desc:'Productos veterinarios y concentrados.'}
      ]
    },
    limpieza: {
      label:'Limpieza y lavandería', unit:'insumo', unitPlural:'insumos', clientNoun:'cliente',
      products:[
        {name:'Detergente en polvo (bolsa 5kg)', price:9.50},
        {name:'Lejía (galón)', price:2.80},
        {name:'Desinfectante (galón)', price:4.50},
        {name:'Suavizante de ropa (galón)', price:5.20},
        {name:'Jabón líquido para manos (galón)', price:6.00},
        {name:'Papel higiénico institucional (x12)', price:18.00},
        {name:'Toallas de papel (x6)', price:12.00},
        {name:'Escoba', price:3.50},
        {name:'Trapeador', price:4.00},
        {name:'Bolsas para basura (x100)', price:8.00}
      ],
      providers:[
        {name:'DIPROBA', desc:'Productos de limpieza, desechables, papel institucional y bioseguridad.'},
        {name:'Disquinsa', desc:'Limpieza institucional; distribuidor de Ecolab, Kimberly Clark y 3M.'},
        {name:'DUISA', desc:'Productos de limpieza y químicos industriales desde 1979.'},
        {name:'Macroclean', desc:'Desinfectantes, detergentes y papel institucional con cobertura nacional.'},
        {name:'Brenntag El Salvador', desc:'Distribución de químicos para limpieza e industria.'}
      ]
    },
    eventos: {
      label:'Eventos, flores y decoración', unit:'insumo', unitPlural:'insumos', clientNoun:'cliente',
      products:[
        {name:'Rosas (docena)', price:9.00},
        {name:'Follaje (manojo)', price:2.50},
        {name:'Espuma floral (bloque)', price:1.80},
        {name:'Globos de látex (x50)', price:5.00},
        {name:'Helio (tanque pequeño)', price:45.00},
        {name:'Manteles (unidad)', price:8.00},
        {name:'Cinta decorativa (rollo)', price:2.00},
        {name:'Velas decorativas (x12)', price:6.50},
        {name:'Flores artificiales (ramo)', price:7.00},
        {name:'Platos y vasos desechables (kit x50)', price:6.00}
      ],
      providers:[
        {name:'Alejandra Distribuidora de Flores', desc:'Importa y distribuye flores al detalle y mayoreo (Boulevard Venezuela).'},
        {name:'Blossom Distribuidora Floral', desc:'Flores, follajes e insumos para floristerías.'},
        {name:"Castro's Flowers", desc:'Distribución floral con sedes en San Salvador, San Miguel y Santa Ana.'},
        {name:'Coccó Accesorios', desc:'Flores artificiales, decoración y productos OASIS.'},
        {name:'Carvajal Empaques', desc:'Desechables para eventos.'}
      ]
    },
    hoteleria: {
      label:'Hotelería y turismo', unit:'insumo', unitPlural:'insumos', clientNoun:'huésped',
      products:[
        {name:'Juego de sábanas matrimonial', price:22.00},
        {name:'Toalla de baño', price:7.50},
        {name:'Almohada', price:9.00},
        {name:'Shampoo de cortesía (x100)', price:18.00},
        {name:'Jabón de cortesía (x100)', price:14.00},
        {name:'Papel higiénico institucional (x12)', price:18.00},
        {name:'Detergente para lavandería (5kg)', price:9.50},
        {name:'Agua embotellada (fardo x24)', price:6.00},
        {name:'Café para habitaciones (x50 sobres)', price:8.00},
        {name:'Desinfectante (galón)', price:4.50}
      ],
      providers:[
        {name:'Consulta Corp', desc:'Amenidades, blancos y accesorios de baño y habitación.'},
        {name:'Blancos & Blancos', desc:'Sábanas, toallas y blancos para hoteles y Airbnb.'},
        {name:'Disquinsa', desc:'Limpieza institucional y protección de alimentos.'},
        {name:'MOLSAL', desc:'Insumos food service para hoteles.'},
        {name:'Industrias La Constancia', desc:'Bebidas y agua para huéspedes.'}
      ]
    },
    fitness: {
      label:'Gimnasios y deportes', unit:'producto', unitPlural:'productos', clientNoun:'socio',
      products:[
        {name:'Mancuernas (par 10lb)', price:24.00},
        {name:'Disco olímpico 25lb', price:35.00},
        {name:'Colchoneta de ejercicio', price:12.00},
        {name:'Liga de resistencia', price:6.00},
        {name:'Proteína en polvo 2lb', price:38.00},
        {name:'Bebida isotónica (fardo x12)', price:9.00},
        {name:'Toallas pequeñas (x12)', price:15.00},
        {name:'Desinfectante para equipos (galón)', price:6.00},
        {name:'Cuerda para saltar', price:5.00},
        {name:'Guantes de entrenamiento', price:10.00}
      ],
      providers:[
        {name:'USA FITNESS El Salvador', desc:'Venta de maquinaria para gimnasio.'},
        {name:'EB Fitness', desc:'Máquinas profesionales para gimnasio en San Salvador.'},
        {name:'El Salvador Fitness', desc:'Equipos fitness para negocios, oficinas y clubes.'},
        {name:'GNC El Salvador', desc:'Vitaminas y suplementos deportivos.'},
        {name:'Industrias La Constancia', desc:'Bebidas isotónicas y agua.'}
      ]
    },
    servicios: {
      label:'Servicios profesionales', unit:'insumo', unitPlural:'insumos', clientNoun:'cliente',
      products:[
        {name:'Resma de papel bond carta', price:4.75},
        {name:'Tóner para impresora', price:45.00},
        {name:'Folders (paquete x25)', price:3.50},
        {name:'Archivador de palanca', price:3.80},
        {name:'Lapiceros (caja x12)', price:2.40},
        {name:'Sellos y almohadilla', price:12.00},
        {name:'Memoria USB 64GB', price:7.00},
        {name:'Café para oficina (lb)', price:6.50},
        {name:'Agua embotellada (garrafón)', price:2.50},
        {name:'Papel higiénico (paquete x12)', price:6.00}
      ],
      providers:[
        {name:'Office Depot El Salvador', desc:'Papelería, oficina, impresión y tecnología.'},
        {name:'Grupo Computodo', desc:'Consumibles de impresión.'},
        {name:'Tecno Avance', desc:'Equipos de computación al por mayor.'},
        {name:'Intelmax', desc:'Computadoras y equipos de marcas reconocidas.'},
        {name:'DIPROBA', desc:'Limpieza y papel institucional para oficinas.'}
      ]
    },
    general: {
      label:'Otro tipo de negocio', unit:'producto', unitPlural:'productos', clientNoun:'cliente',
      products:[
        {name:'Producto genérico A', price:5.00},
        {name:'Producto genérico B', price:10.00},
        {name:'Producto genérico C', price:20.00},
        {name:'Bolsas para despacho (x100)', price:5.50},
        {name:'Resma de papel bond carta', price:4.75},
        {name:'Desinfectante (galón)', price:4.50},
        {name:'Cinta de embalaje (x6)', price:6.00},
        {name:'Cajas de cartón (x25)', price:15.00}
      ],
      providers:[
        {name:'DISZASA (Distribuidora Zablah)', desc:'Distribución nacional de consumo masivo.'},
        {name:'Distribuidora Nacional', desc:'Abarrotes, bebidas, papelería, hogar y limpieza.'},
        {name:'Office Depot El Salvador', desc:'Papelería, oficina y tecnología.'},
        {name:'DIPROBA', desc:'Productos de limpieza y desechables.'},
        {name:'Corruplesa', desc:'Cajas de cartón y empaques.'},
        {name:'Todo Mayoreo El Salvador', desc:'Productos al por mayor con envíos a todo el país.'}
      ]
    }
  };

  /* ---------------- oficios (lo que se elige al registrarse) ----------------
     [id, nombre, categoría]. Ordenados por categoría para el buscador. */
  var OCCUPATIONS = [
    // Salud y medicina
    ['clinica','Clínica','salud'], ['consultorio-medico','Consultorio médico','salud'], ['hospital','Hospital','salud'],
    ['clinica-pediatrica','Clínica pediátrica','salud'], ['ginecologia','Ginecología','salud'], ['dermatologia','Dermatología','salud'],
    ['fisioterapia','Fisioterapia','salud'], ['psicologia','Consultorio de psicología','salud'], ['nutricionista','Nutricionista','salud'],
    ['enfermeria-domicilio','Enfermería a domicilio','salud'], ['clinica-estetica','Clínica estética','salud'], ['ortopedia','Ortopedia','salud'],
    ['cardiologia','Cardiología','salud'], ['ambulancias','Servicio de ambulancias','salud'], ['asilo','Asilo / hogar de ancianos','salud'],
    ['acupuntura','Acupuntura y medicina natural','salud'], ['quiropractico','Quiropráctico','salud'], ['podologia','Podología','salud'],
    // Farmacias
    ['farmacia','Farmacia','farmacia'], ['drogueria','Droguería','farmacia'], ['farmacia-natural','Tienda naturista','farmacia'],
    ['venta-equipo-medico','Venta de equipo médico','farmacia'],
    // Odontología
    ['clinica-dental','Clínica dental','odontologia'], ['ortodoncia','Ortodoncia','odontologia'], ['laboratorio-dental','Laboratorio dental','odontologia'],
    // Óptica
    ['optica','Óptica','optica'], ['optometrista','Optometrista','optica'], ['oftalmologia','Oftalmología','optica'],
    // Laboratorio
    ['laboratorio-clinico','Laboratorio clínico','laboratorio'], ['rayos-x','Rayos X y ultrasonido','laboratorio'], ['banco-sangre','Banco de sangre','laboratorio'],
    // Restaurantes y comida
    ['pupuseria','Pupusería','comida'], ['restaurante','Restaurante','comida'], ['comedor','Comedor','comida'],
    ['comida-rapida','Comida rápida','comida'], ['pizzeria','Pizzería','comida'], ['pollo-frito','Pollo frito','comida'],
    ['marisqueria','Marisquería','comida'], ['taqueria','Taquería','comida'], ['venta-tamales','Venta de tamales','comida'],
    ['food-truck','Food truck','comida'], ['catering','Catering y banquetes','comida'], ['asaderos','Asadero / carnes a la parrilla','comida'],
    ['comida-china','Comida china','comida'], ['sushi','Sushi y comida japonesa','comida'], ['hamburgueseria','Hamburguesería','comida'],
    ['venta-yuca-frita','Venta de yuca y antojitos','comida'], ['cocina-economica','Cocina económica','comida'], ['bar','Bar','comida'],
    ['cocteleria','Coctelería y licorería','comida'], ['comida-vegana','Comida vegana / saludable','comida'], ['cocina-oculta','Cocina para delivery (dark kitchen)','comida'],
    // Panadería
    ['panaderia','Panadería','panaderia'], ['pasteleria','Pastelería','panaderia'], ['reposteria','Repostería','panaderia'],
    ['tortilleria','Tortillería','panaderia'], ['venta-pan-dulce','Venta de pan dulce','panaderia'], ['galletas','Fábrica de galletas','panaderia'],
    // Cafeterías y bebidas
    ['cafeteria','Cafetería','cafeteria'], ['heladeria','Heladería','cafeteria'], ['juguera','Jugos y licuados','cafeteria'],
    ['venta-minutas','Minutas y raspados','cafeteria'], ['cerveceria-artesanal','Cervecería artesanal','cafeteria'], ['distribuidora-agua','Distribuidora de agua purificada','cafeteria'],
    ['tostaduria-cafe','Tostaduría de café','cafeteria'], ['te-boba','Té y bubble tea','cafeteria'],
    // Carnes
    ['carniceria','Carnicería','carnes'], ['polleria','Pollería','carnes'], ['pescaderia','Pescadería','carnes'],
    ['embutidos','Fábrica de embutidos','carnes'], ['venta-huevos','Venta de huevos','carnes'],
    // Tiendas y abarrotes
    ['tienda','Tienda de barrio','abarrotes'], ['minisuper','Minisúper','abarrotes'], ['supermercado','Supermercado','abarrotes'],
    ['abarroteria','Abarrotería','abarrotes'], ['mayoreo','Venta al por mayor','abarrotes'], ['frutas-verduras','Frutas y verduras','abarrotes'],
    ['venta-mercado','Puesto de mercado','abarrotes'], ['dulceria','Dulcería','abarrotes'], ['tienda-conveniencia','Tienda de conveniencia','abarrotes'],
    ['bodega','Bodega','abarrotes'], ['venta-por-catalogo','Venta por catálogo','abarrotes'], ['tienda-en-linea','Tienda en línea','abarrotes'],
    ['tienda-regalos','Tienda de regalos','abarrotes'], ['bazar','Bazar / variedades','abarrotes'], ['juguetes','Juguetería','abarrotes'],
    ['productos-artesanales','Artesanías','abarrotes'], ['tabaqueria','Venta de cigarros y snacks','abarrotes'],
    // Belleza
    ['salon-belleza','Salón de belleza','belleza'], ['barberia','Barbería','belleza'], ['spa','Spa','belleza'],
    ['unas','Salón de uñas','belleza'], ['maquillaje','Maquillista','belleza'], ['pestanas','Pestañas y cejas','belleza'],
    ['depilacion','Depilación','belleza'], ['masajes','Masajes','belleza'], ['tatuajes','Estudio de tatuajes','belleza'],
    ['cosmeticos','Tienda de cosméticos','belleza'], ['perfumeria','Perfumería','belleza'], ['estilista-domicilio','Estilista a domicilio','belleza'],
    // Automotriz
    ['taller','Taller automotriz','automotriz'], ['lubricentro','Lubricentro / cambio de aceite','automotriz'], ['car-wash','Car wash / autolavado','automotriz'],
    ['llanteria','Llantería','automotriz'], ['enderezado-pintura','Enderezado y pintura','automotriz'], ['venta-repuestos','Venta de repuestos','automotriz'],
    ['electricidad-automotriz','Electricidad automotriz','automotriz'], ['venta-autos','Venta de autos','automotriz'], ['alquiler-autos','Alquiler de autos','automotriz'],
    ['grua','Servicio de grúa','automotriz'], ['polarizado','Polarizado y accesorios','automotriz'], ['aire-acondicionado-auto','Aire acondicionado automotriz','automotriz'],
    ['estacion-servicio','Gasolinera','automotriz'], ['parqueo','Parqueo','automotriz'],
    // Motos
    ['taller-motos','Taller de motos','motos'], ['repuestos-motos','Repuestos para motos','motos'], ['venta-motos','Venta de motos','motos'],
    ['bicicletas','Venta y taller de bicicletas','motos'],
    // Transporte
    ['transporte-carga','Transporte de carga','transporte'], ['mudanzas','Mudanzas','transporte'], ['mensajeria','Mensajería y delivery','transporte'],
    ['taxi','Taxi','transporte'], ['microbus','Microbús / transporte escolar','transporte'], ['encomiendas','Encomiendas','transporte'],
    ['courier','Courier internacional','transporte'], ['buses','Línea de buses','transporte'], ['turismo-transporte','Transporte turístico','transporte'],
    // Construcción y ferretería
    ['ferreteria','Ferretería','construccion'], ['constructora','Constructora','construccion'], ['albanileria','Albañilería','construccion'],
    ['fontaneria','Fontanería','construccion'], ['pintor','Pintor de casas','construccion'], ['herreria','Herrería y soldadura','construccion'],
    ['venta-materiales','Venta de materiales de construcción','construccion'], ['arquitectura','Arquitectura','construccion'], ['ingenieria-civil','Ingeniería civil','construccion'],
    ['remodelaciones','Remodelaciones','construccion'], ['pisos-ceramica','Pisos y cerámica','construccion'], ['tablaroca','Tablaroca y cielo falso','construccion'],
    ['techos','Techos y láminas','construccion'], ['bloquera','Bloquera','construccion'], ['cerrajeria','Cerrajería','construccion'],
    ['pozos-cisternas','Pozos y cisternas','construccion'], ['jardineria','Jardinería y paisajismo','construccion'], ['piscinas','Piscinas','construccion'],
    // Electricidad
    ['electricista','Electricista','electricidad'], ['iluminacion','Venta de iluminación','electricidad'], ['paneles-solares','Paneles solares','electricidad'],
    ['aire-acondicionado','Aire acondicionado y refrigeración','electricidad'], ['reparacion-electrodomesticos','Reparación de electrodomésticos','electricidad'],
    ['camaras-seguridad','Cámaras de seguridad y alarmas','electricidad'], ['venta-electrodomesticos','Venta de electrodomésticos','electricidad'],
    // Carpintería
    ['carpinteria','Carpintería','carpinteria'], ['muebleria','Mueblería','carpinteria'], ['ebanisteria','Ebanistería','carpinteria'],
    ['tapiceria','Tapicería','carpinteria'], ['cocinas-closets','Cocinas y closets','carpinteria'], ['colchones','Colchonería','carpinteria'],
    ['decoracion-interiores','Decoración de interiores','carpinteria'],
    // Vidrio y aluminio
    ['vidrieria','Vidriería','vidrio'], ['aluminio','Ventanas y puertas de aluminio','vidrio'], ['espejos','Espejos y vitrinas','vidrio'],
    // Moda y textiles
    ['boutique','Boutique','moda'], ['tienda-ropa','Tienda de ropa','moda'], ['ropa-usada','Ropa americana / de segunda','moda'],
    ['zapateria','Zapatería','moda'], ['reparacion-calzado','Reparación de calzado','moda'], ['sastreria','Sastrería','moda'],
    ['costureria','Costurería','moda'], ['uniformes','Uniformes','moda'], ['serigrafia','Serigrafía y estampado','moda'],
    ['bordados','Bordados','moda'], ['accesorios-moda','Accesorios y bisutería','moda'], ['joyeria','Joyería','moda'],
    ['relojeria','Relojería','moda'], ['ropa-bebe','Ropa de bebé','moda'], ['lenceria','Lencería','moda'],
    ['maquila','Maquila / confección','moda'], ['carteras','Carteras y mochilas','moda'],
    // Tecnología
    ['reparacion-celulares','Reparación de celulares','tecnologia'], ['venta-celulares','Venta de celulares','tecnologia'], ['reparacion-computadoras','Reparación de computadoras','tecnologia'],
    ['tienda-tecnologia','Tienda de tecnología','tecnologia'], ['ciber','Cibercafé','tecnologia'], ['desarrollo-software','Desarrollo de software','tecnologia'],
    ['diseno-web','Diseño web','tecnologia'], ['soporte-tecnico','Soporte técnico','tecnologia'], ['internet-cable','Internet y cable','tecnologia'],
    ['videojuegos','Videojuegos','tecnologia'], ['electronica','Electrónica','tecnologia'], ['marketing-digital','Marketing digital','tecnologia'],
    ['community-manager','Community manager','tecnologia'], ['fotografia','Fotografía y video','tecnologia'], ['estudio-grabacion','Estudio de grabación','tecnologia'],
    // Educación
    ['colegio','Colegio','educacion'], ['escuela','Escuela','educacion'], ['guarderia','Guardería','educacion'],
    ['academia-ingles','Academia de inglés','educacion'], ['academia-computacion','Academia de computación','educacion'], ['tutorias','Tutorías / clases particulares','educacion'],
    ['escuela-musica','Escuela de música','educacion'], ['escuela-manejo','Escuela de manejo','educacion'], ['academia-belleza','Academia de belleza','educacion'],
    ['escuela-danza','Escuela de danza','educacion'], ['academia-cocina','Academia de cocina','educacion'], ['universidad','Universidad / instituto','educacion'],
    // Librería e imprenta
    ['libreria','Librería','papeleria'], ['papeleria','Papelería','papeleria'], ['imprenta','Imprenta','papeleria'],
    ['fotocopias','Centro de fotocopias','papeleria'], ['diseno-grafico','Diseño gráfico','papeleria'], ['sublimacion','Sublimación y personalizados','papeleria'],
    ['rotulos','Rótulos y publicidad','papeleria'], ['editorial','Editorial','papeleria'],
    // Agro
    ['agroservicio','Agroservicio','agro'], ['finca','Finca agrícola','agro'], ['ganaderia','Ganadería','agro'],
    ['granja-avicola','Granja avícola','agro'], ['porcicultura','Granja de cerdos','agro'], ['vivero','Vivero','agro'],
    ['cafetalero','Productor de café','agro'], ['apicultura','Apicultura / miel','agro'], ['acuicultura','Acuicultura / tilapia','agro'],
    ['lacteos','Lácteos artesanales','agro'], ['hortalizas','Producción de hortalizas','agro'], ['cana','Caña de azúcar','agro'],
    // Mascotas
    ['veterinaria','Veterinaria','mascotas'], ['pet-shop','Tienda de mascotas','mascotas'], ['grooming','Grooming / estética canina','mascotas'],
    ['guarderia-mascotas','Hotel / guardería de mascotas','mascotas'], ['adiestramiento','Adiestramiento canino','mascotas'],
    // Limpieza
    ['lavanderia','Lavandería','limpieza'], ['tintoreria','Tintorería','limpieza'], ['limpieza-casas','Limpieza de casas y oficinas','limpieza'],
    ['fumigacion','Fumigación','limpieza'], ['lavado-muebles','Lavado de muebles y alfombras','limpieza'], ['venta-productos-limpieza','Venta de productos de limpieza','limpieza'],
    ['recoleccion-basura','Recolección de desechos','limpieza'], ['reciclaje','Reciclaje','limpieza'],
    // Eventos
    ['floristeria','Floristería','eventos'], ['decoracion-eventos','Decoración de eventos','eventos'], ['alquiler-sillas','Alquiler de sillas y mesas','eventos'],
    ['salon-eventos','Salón de eventos','eventos'], ['dj','DJ y sonido','eventos'], ['wedding-planner','Organización de bodas','eventos'],
    ['pinateria','Piñatería','eventos'], ['animacion-infantil','Animación infantil','eventos'], ['grupo-musical','Grupo musical / mariachi','eventos'],
    ['funeraria','Funeraria','eventos'], ['inflables','Alquiler de inflables','eventos'],
    // Hotelería
    ['hotel','Hotel','hoteleria'], ['hostal','Hostal','hoteleria'], ['airbnb','Alquiler vacacional / Airbnb','hoteleria'],
    ['motel','Motel','hoteleria'], ['agencia-viajes','Agencia de viajes','hoteleria'], ['tour-operador','Tour operador','hoteleria'],
    ['turicentro','Turicentro / balneario','hoteleria'], ['glamping','Glamping / cabañas','hoteleria'], ['escuela-surf','Escuela de surf','hoteleria'],
    // Fitness
    ['gimnasio','Gimnasio','fitness'], ['crossfit','Box de CrossFit','fitness'], ['yoga','Estudio de yoga / pilates','fitness'],
    ['artes-marciales','Artes marciales','fitness'], ['entrenador-personal','Entrenador personal','fitness'], ['cancha-futbol','Cancha de fútbol rápido','fitness'],
    ['tienda-deportes','Tienda de deportes','fitness'], ['suplementos','Venta de suplementos','fitness'], ['natacion','Academia de natación','fitness'],
    // Servicios profesionales
    ['despacho-contable','Despacho contable','servicios'], ['abogado','Bufete de abogados','servicios'], ['notario','Notaría','servicios'],
    ['consultoria','Consultoría','servicios'], ['bienes-raices','Bienes raíces','servicios'], ['seguros','Agencia de seguros','servicios'],
    ['agencia-publicidad','Agencia de publicidad','servicios'], ['recursos-humanos','Recursos humanos / reclutamiento','servicios'], ['traduccion','Traducción','servicios'],
    ['tramites','Gestoría de trámites','servicios'], ['seguridad-privada','Seguridad privada','servicios'], ['call-center','Call center','servicios'],
    ['coworking','Coworking','servicios'], ['remesas','Remesas y envío de dinero','servicios'], ['cooperativa','Cooperativa / caja de crédito','servicios'],
    ['iglesia','Iglesia / ministerio','servicios'], ['ong','ONG / fundación','servicios'], ['casa-empeno','Casa de empeño','servicios']
  ];

  /* ---------------- índices ---------------- */
  var BY_ID = {};
  var BUSINESS_TYPES = OCCUPATIONS.map(function(o){
    var cat = CATEGORIES[o[2]];
    var t = {
      id:o[0], label:o[1], category:o[2], categoryLabel:cat.label,
      unit:cat.unit, unitPlural:cat.unitPlural, clientNoun:cat.clientNoun
    };
    BY_ID[t.id] = t;
    return t;
  });

  // 'otro:<texto>' → oficio escrito a mano, categoría general
  function getType(id){
    if(!id) return null;
    if(BY_ID[id]) return BY_ID[id];
    var cat = CATEGORIES.general;
    var label = id.indexOf('otro:') === 0 ? id.slice(5) : id;
    return {
      id:id, label:label || cat.label, category:'general', categoryLabel:cat.label,
      unit:cat.unit, unitPlural:cat.unitPlural, clientNoun:cat.clientNoun
    };
  }
  function categoryOf(id){ return CATEGORIES[getType(id).category]; }
  function productsFor(id){ return categoryOf(id).products; }
  function providersFor(id){ return categoryOf(id).providers; }

  // proveedores únicos en todo el catálogo (para estadísticas de la landing)
  function providerCount(){
    var seen = {};
    Object.keys(CATEGORIES).forEach(function(k){
      CATEGORIES[k].providers.forEach(function(p){ seen[p.name] = true; });
    });
    return Object.keys(seen).length;
  }

  window.INNOVA_DATA = {
    categories: CATEGORIES,
    businessTypes: BUSINESS_TYPES,
    getType: getType,
    productsFor: productsFor,
    providersFor: providersFor,
    providerCount: providerCount
  };
})();
