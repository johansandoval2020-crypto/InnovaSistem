/* ==========================================================================
   InnovaSistem — datos semilla por tipo de negocio
   ========================================================================== */
(function(){
  "use strict";

  var BUSINESS_TYPES = [
    {id:'clinica',    label:'Clínica',            icon:'🩺', unit:'insumo',      unitPlural:'insumos',      clientNoun:'paciente'},
    {id:'pupuseria',  label:'Pupusería',           icon:'🫓', unit:'ingrediente', unitPlural:'ingredientes', clientNoun:'comensal'},
    {id:'taller',     label:'Taller automotriz',   icon:'🔧', unit:'repuesto',    unitPlural:'repuestos',    clientNoun:'cliente'}
  ];

  var PRODUCTS = {
    clinica: [
      {name:'Jeringa desechable 5ml', price:0.35, stock:420},
      {name:'Guantes de nitrilo (caja x100)', price:8.50, stock:60},
      {name:'Gasas estériles 10x10', price:0.20, stock:800},
      {name:'Alcohol gel 500ml', price:3.75, stock:140},
      {name:'Termómetro digital', price:6.90, stock:35},
      {name:'Mascarilla quirúrgica (caja x50)', price:5.20, stock:90},
      {name:'Suero fisiológico 1000ml', price:2.10, stock:75},
      {name:'Baja lenguas (paquete x100)', price:1.60, stock:130},
      {name:'Algodón hidrófilo 500g', price:2.90, stock:55},
      {name:'Cinta adhesiva médica', price:1.25, stock:200}
    ],
    pupuseria: [
      {name:'Masa de maíz (lb)', price:0.55, stock:300},
      {name:'Queso duro (lb)', price:3.20, stock:80},
      {name:'Frijol refrito (lb)', price:1.10, stock:120},
      {name:'Crema fresca (lb)', price:2.40, stock:60},
      {name:'Curtido (lb)', price:0.90, stock:70},
      {name:'Chicharrón molido (lb)', price:3.80, stock:45},
      {name:'Loroco (lb)', price:4.50, stock:25},
      {name:'Tomate (lb)', price:0.65, stock:150},
      {name:'Aceite vegetal (galón)', price:6.30, stock:40},
      {name:'Gas propano (cilindro 25lb)', price:14.00, stock:12}
    ],
    taller: [
      {name:'Batería 12V 650A', price:78.00, stock:22},
      {name:'Amortiguador delantero', price:45.00, stock:30},
      {name:'Aceite de motor 5W-30 (galón)', price:24.50, stock:40},
      {name:'Filtro de aceite', price:6.50, stock:65},
      {name:'Filtro de aire', price:8.90, stock:50},
      {name:'Banda de distribución', price:32.00, stock:18},
      {name:'Bujía de encendido', price:4.20, stock:120},
      {name:'Pastillas de freno (juego)', price:28.00, stock:35},
      {name:'Líquido de frenos 500ml', price:5.60, stock:44},
      {name:'Refrigerante 1 galón', price:9.80, stock:38}
    ]
  };

  var PROVIDERS = {
    clinica: [
      {name:'Importaciones Médicas de El Salvador (IMED)', desc:'Importador y distribuidor de insumos médicos generales.'},
      {name:'Mundo Médico Químico', desc:'Suministro de reactivos, insumos y equipo médico-químico.'},
      {name:'Medical Systems El Salvador', desc:'Equipos y sistemas médicos para clínicas y hospitales.'},
      {name:'Dipromequi', desc:'Insumos y dispositivos médicos; también ofrecen capacitaciones.'},
      {name:'DINVER', desc:'Insumos médicos y hospitalarios al por mayor.'},
      {name:'RIM', desc:'Distribución mayorista de jeringas, agujas, gasas y otros insumos médicos.'}
    ],
    pupuseria: [
      {name:'Lácteos Esmeralda', desc:'Mayorista de comestibles en Soyapango.'},
      {name:'Agrosalva', desc:'Distribuidor de quesos y cremas para restaurantes.'},
      {name:'Sabor Amigo', desc:'Condimentos, especias y otros ingredientes para la industria alimentaria.'},
      {name:'MOLSAL', desc:'Distribuye más de 400 productos para food service: restaurantes, hoteles, panaderías y cafeterías.'}
    ],
    taller: [
      {name:'Econoparts • Soyapango', desc:'Repuestos, lubricantes, baterías, amortiguadores y equipo de diagnóstico. Venta al mayoreo.'},
      {name:'Súper Repuestos | Soyapango', desc:'Repuestos automotrices.'},
      {name:'Impressa Repuestos • Soyapango', desc:'Repuestos automotrices.'},
      {name:'ROMAN AUTOMOTRIZ SOYAPANGO', desc:'Accesorios automotrices al por mayor.'},
      {name:'INCAPRO', desc:'Importador y distribuidor de repuestos industriales y automotrices.'}
    ]
  };

  var FIRST_NAMES = ['María','José','Ana','Carlos','Gabriela','Luis','Fátima','Óscar','Elena','Ricardo','Patricia','Miguel','Daniela','Francisco','Karla','Rodrigo','Sofía','Antonio','Verónica','Nelson'];
  var LAST_NAMES = ['Hernández','Rivera','García','Martínez','López','Alvarado','Ramírez','Cortez','Escobar','Guardado','Menjívar','Flores','Portillo','Aguilar','Chávez','Rodríguez','Reyes','Zelaya','Pineda','Sánchez'];

  function seededRand(seed){
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function(){
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function buildClients(typeId){
    var products = PRODUCTS[typeId];
    var rand = seededRand(typeId.length * 97 + 13);
    var clients = [];
    for(var i=0;i<20;i++){
      var name = FIRST_NAMES[i % FIRST_NAMES.length] + ' ' + LAST_NAMES[(i*3+1) % LAST_NAMES.length];
      var purchaseCount = 2 + Math.floor(rand()*3); // 2-4
      var purchases = [];
      var total = 0;
      for(var p=0;p<purchaseCount;p++){
        var prod = products[Math.floor(rand()*products.length)];
        var qty = 1 + Math.floor(rand()*4);
        var daysAgo = Math.floor(rand()*75);
        var d = new Date(); d.setDate(d.getDate()-daysAgo);
        var amount = Math.round(prod.price*qty*100)/100;
        total += amount;
        purchases.push({item:prod.name, qty:qty, amount:amount, date:d.toISOString().slice(0,10)});
      }
      purchases.sort(function(a,b){ return a.date < b.date ? 1 : -1; });
      clients.push({
        id:'cli-'+typeId+'-'+i,
        name:name,
        phone:'7' + (100+ i) + '-' + (1000 + i*37 % 9000),
        purchases:purchases,
        total: Math.round(total*100)/100
      });
    }
    return clients;
  }

  function buildSales(typeId){
    var clients = buildClients(typeId);
    var sales = [];
    clients.forEach(function(c){
      c.purchases.forEach(function(p, idx){
        sales.push({
          id:'sale-'+c.id+'-'+idx,
          client:c.name,
          item:p.item,
          qty:p.qty,
          amount:p.amount,
          date:p.date,
          method: (idx % 3 === 0) ? 'Efectivo' : (idx % 3 === 1 ? 'Tarjeta' : 'Transferencia'),
          status: (idx % 4 === 3) ? 'Pendiente' : 'Pagado'
        });
      });
    });
    sales.sort(function(a,b){ return a.date < b.date ? 1 : -1; });
    return sales;
  }

  window.INNOVA_DATA = {
    businessTypes: BUSINESS_TYPES,
    getType: function(id){ return BUSINESS_TYPES.find(function(t){ return t.id===id; }); },
    products: PRODUCTS,
    providers: PROVIDERS,
    buildClients: buildClients,
    buildSales: buildSales
  };
})();
