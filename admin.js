(function(){
  "use strict";

  function safe(fn, name){ try{ return fn(); }catch(err){ console.warn('[InnovaSistem admin]', name, err); } }
  function uid(prefix){ return prefix + '-' + Math.random().toString(36).slice(2,9); }
  function money(n){ return '$' + (Math.round(n*100)/100).toFixed(2); }
  function todayISO(){ return new Date().toISOString().slice(0,10); }

  var account = null;
  var STATE = null;
  var TYPE = null;

  /* ---------------- boot / account guard ---------------- */
  function loadAccount(){
    var raw = localStorage.getItem('innova_account');
    if(!raw){ window.location.href = 'login.html'; return false; }
    account = JSON.parse(raw);
    TYPE = account.type;
    return true;
  }

  function seedState(){
    var products = window.INNOVA_DATA.products[TYPE].map(function(p,i){
      return {id:'inv-'+i, name:p.name, price:p.price, stock:0};
    });
    return {
      name: account.businessName || 'Mi negocio',
      phone:'', address:'',
      inventory: products,
      providersAdded: [],
      clients: [],
      sales: [],
      payments: []
    };
  }

  function loadState(){
    var key = 'innova_business_' + TYPE;
    var raw = localStorage.getItem(key);
    if(raw){ STATE = JSON.parse(raw); }
    else { STATE = seedState(); saveState(); }
  }
  function saveState(){
    localStorage.setItem('innova_business_' + TYPE, JSON.stringify(STATE));
  }

  /* ---------------- topbar ---------------- */
  function renderTopbar(){
    var typeInfo = window.INNOVA_DATA.getType(TYPE);
    document.getElementById('bizName').textContent = STATE.name || 'Mi negocio';
    document.getElementById('bizTypeBadge').textContent = (typeInfo.icon + ' ' + typeInfo.label);
  }

  /* ---------------- theme ---------------- */
  var MOON_SVG = '<svg viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>';
  var SUN_SVG = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M4 12H1M23 12h-3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>';
  function initTheme(){
    var saved = localStorage.getItem('innova_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeIcon').innerHTML = saved === 'dark' ? SUN_SVG : MOON_SVG;
    document.getElementById('themeToggle').addEventListener('click', function(){
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('innova_theme', next);
      document.getElementById('themeIcon').innerHTML = next === 'dark' ? SUN_SVG : MOON_SVG;
    });
  }

  /* ---------------- navigation ---------------- */
  function initNav(){
    var btns = document.querySelectorAll('.dock-btn[data-view]');
    btns.forEach(function(btn){
      btn.addEventListener('click', function(){
        btns.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('.view').forEach(function(v){ v.classList.remove('active'); });
        var target = document.getElementById('view-' + btn.getAttribute('data-view'));
        if(target) target.classList.add('active');
        renderAll();
      });
    });
    function logout(){
      window.location.href = 'login.html';
    }
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('logoutBtn2').addEventListener('click', logout);
  }

  /* ---------------- toast ---------------- */
  function toast(msg){
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function(){ el.classList.remove('show'); }, 2600);
  }

  /* ---------------- modal helpers ---------------- */
  function openModal(html){
    document.getElementById('modalBox').innerHTML = html;
    document.getElementById('modalBackdrop').classList.add('show');
  }
  function closeModal(){
    document.getElementById('modalBackdrop').classList.remove('show');
  }
  function initModalBase(){
    document.getElementById('modalBackdrop').addEventListener('click', function(e){
      if(e.target === this) closeModal();
    });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeModal(); });
  }

  /* ---------------- charts (inline SVG, no libs) ---------------- */
  function lastNDaysTotals(sales, n){
    var days = [];
    for(var i=n-1;i>=0;i--){
      var d = new Date(); d.setDate(d.getDate()-i);
      days.push(d.toISOString().slice(0,10));
    }
    return days.map(function(day){
      var total = sales.filter(function(s){ return s.date === day; })
                        .reduce(function(a,s){ return a+s.amount; }, 0);
      return {label: day.slice(5), value: Math.round(total*100)/100};
    });
  }

  function buildBarChart(points, colorVar){
    var w = 560, h = 220, pad = 30;
    var max = Math.max.apply(null, points.map(function(p){ return p.value; }).concat([1]));
    var barW = (w - pad*2) / points.length - 10;
    var bars = points.map(function(p, i){
      var bh = Math.max(4, (p.value / max) * (h - 60));
      var x = pad + i * ((w-pad*2)/points.length) + 5;
      var y = h - 34 - bh;
      return '<rect class="bar" x="'+x+'" y="'+y+'" width="'+barW+'" height="'+bh+'" rx="6" fill="'+colorVar+'" style="animation-delay:'+(i*0.06)+'s"></rect>'+
             '<text x="'+(x+barW/2)+'" y="'+(h-14)+'" text-anchor="middle" font-size="10" fill="currentColor" opacity=".55">'+p.label+'</text>'+
             '<text x="'+(x+barW/2)+'" y="'+(y-6)+'" text-anchor="middle" font-size="10" fill="currentColor" opacity=".7">'+(p.value>0?'$'+p.value.toFixed(0):'')+'</text>';
    }).join('');
    return '<svg viewBox="0 0 '+w+' '+h+'" style="color:inherit"><line x1="'+pad+'" y1="'+(h-34)+'" x2="'+(w-10)+'" y2="'+(h-34)+'" stroke="currentColor" opacity=".15"/>'+bars+'</svg>';
  }

  function buildLineChart(points, colorVar){
    var w = 560, h = 220, pad = 30;
    var max = Math.max.apply(null, points.map(function(p){ return p.value; }).concat([1]));
    var stepX = (w - pad*2) / (points.length - 1 || 1);
    var coords = points.map(function(p,i){
      var x = pad + i*stepX;
      var y = h - 34 - (p.value/max) * (h-60);
      return {x:x,y:y,v:p.value,label:p.label};
    });
    var path = coords.map(function(c,i){ return (i===0?'M':'L') + c.x.toFixed(1) + ' ' + c.y.toFixed(1); }).join(' ');
    var area = path + ' L' + coords[coords.length-1].x + ' ' + (h-34) + ' L' + coords[0].x + ' ' + (h-34) + ' Z';
    var dots = coords.map(function(c,i){
      return '<circle class="dot-pop" cx="'+c.x+'" cy="'+c.y+'" r="4" fill="'+colorVar+'" style="animation-delay:'+(1.2+i*0.04)+'s"></circle>';
    }).join('');
    var labels = coords.filter(function(_,i){ return i % Math.ceil(coords.length/7) === 0; })
      .map(function(c){ return '<text x="'+c.x+'" y="'+(h-14)+'" text-anchor="middle" font-size="10" fill="currentColor" opacity=".55">'+c.label+'</text>'; }).join('');
    return '<svg viewBox="0 0 '+w+' '+h+'" style="color:inherit">'+
      '<line x1="'+pad+'" y1="'+(h-34)+'" x2="'+(w-10)+'" y2="'+(h-34)+'" stroke="currentColor" opacity=".15"/>'+
      '<path d="'+area+'" fill="'+colorVar+'" opacity=".12"></path>'+
      '<path class="line-path" d="'+path+'" fill="none" stroke="'+colorVar+'" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>'+
      dots + labels + '</svg>';
  }

  /* ---------------- RESUMEN ---------------- */
  function renderResumen(){
    var totalIngresos = STATE.sales.reduce(function(a,s){ return a+s.amount; }, 0);
    var thisMonth = todayISO().slice(0,7);
    var ventasMes = STATE.sales.filter(function(s){ return s.date.slice(0,7)===thisMonth; })
                                .reduce(function(a,s){ return a+s.amount; }, 0);
    var lowStock = STATE.inventory.filter(function(p){ return p.stock < 30; }).length;

    document.getElementById('kpiRow').innerHTML = [
      kpi('Ingresos totales', money(totalIngresos), null),
      kpi('Ventas este mes', money(ventasMes), null),
      kpi('Clientes registrados', STATE.clients.length, null),
      kpi('Stock bajo', lowStock + ' ítems', lowStock>0?'down':null)
    ].join('');

    var days7 = lastNDaysTotals(STATE.sales, 7);
    document.getElementById('barChart').innerHTML = buildBarChart(days7, 'var(--midnight)');
    var cumulative = []; var run = 0;
    days7.forEach(function(d){ run += d.value; cumulative.push({label:d.label, value:Math.round(run*100)/100}); });
    document.getElementById('lineChartSmall').innerHTML = buildLineChart(cumulative, 'var(--rosy-dark)');

    var recent = STATE.sales.slice(0,6);
    document.getElementById('recentSalesTable').innerHTML = salesTableHTML(recent, false);
  }
  function kpi(lbl, val, deltaClass){
    return '<div class="kpi-card"><div class="lbl">'+lbl+'</div><div class="val">'+val+'</div>'+
      (deltaClass ? '<div class="delta '+deltaClass+'">Revisar pronto</div>' : '<div class="delta">Al día</div>')+'</div>';
  }

  /* ---------------- INVENTARIO ---------------- */
  function renderInventario(){
    var typeInfo = window.INNOVA_DATA.getType(TYPE);
    document.getElementById('invTitle').textContent = 'Inventario de ' + typeInfo.unitPlural;
    document.getElementById('invSub').textContent = 'Stock y precio de cada ' + typeInfo.unit + '. Se abastece comprándole a tus proveedores.';

    var html = STATE.inventory.map(function(p, i){
      var low = p.stock < 30;
      var pct = Math.min(100, (p.stock/300)*100);
      return '<div class="item-card" style="animation-delay:'+(i*0.03)+'s">'+
        '<div class="name">'+p.name+'</div>'+
        '<div class="meta"><span>Stock: '+p.stock+'</span><span class="price">'+money(p.price)+'</span></div>'+
        '<div class="stock-bar"><i class="'+(low?'low':'')+'" style="width:'+pct+'%"></i></div>'+
        (low ? '<div style="font-size:.72rem;color:var(--rosy-dark);margin-top:8px;">⚠ Stock bajo — reabastecer</div>' : '') +
      '</div>';
    }).join('');
    if(!STATE.inventory.length){
      html = '<div class="empty-note">Todavía no tenés '+typeInfo.unitPlural+'. Comprale a un proveedor en la sección Proveedores para abastecer tu inventario.</div>';
    }
    document.getElementById('inventoryGrid').innerHTML = html;
  }

  /* ---------------- PROVEEDORES ---------------- */
  function renderProveedores(){
    var typeInfo = window.INNOVA_DATA.getType(TYPE);
    document.getElementById('provSub').textContent = 'Proveedores de ' + typeInfo.unitPlural + ' cerca de tu negocio. Tocá uno para ver y comprar su catálogo.';
    var html = STATE.providersAdded.map(function(p, i){
      return '<div class="item-card provider-card" data-idx="'+i+'" style="animation-delay:'+(i*0.03)+'s"><span class="tag-sm"><svg viewBox="0 0 24 24"><path d="M2 7h11v9H2z"/><path d="M13 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg></span>'+
        '<div class="name">'+p.name+'</div><div class="desc">'+p.desc+'</div>'+
        '<div class="see-catalog">Ver catálogo y comprar →</div>'+
        '<button class="rm" data-rm="'+i+'">Quitar de mis proveedores</button></div>';
    }).join('');
    html += '<div class="add-tile" id="addProviderTile"><div class="plus-circle">+</div>Agregar proveedor</div>';
    document.getElementById('providersGrid').innerHTML = html;

    document.querySelectorAll('.provider-card').forEach(function(card){
      card.addEventListener('click', function(){
        var idx = parseInt(card.getAttribute('data-idx'), 10);
        openProviderCatalog(STATE.providersAdded[idx]);
      });
    });

    document.querySelectorAll('[data-rm]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        STATE.providersAdded.splice(parseInt(btn.getAttribute('data-rm'),10), 1);
        saveState(); renderProveedores(); toast('Proveedor quitado');
      });
    });

    document.getElementById('addProviderTile').addEventListener('click', function(e){
      e.stopPropagation();
      var directory = window.INNOVA_DATA.providers[TYPE];
      var items = directory.map(function(p){
        var already = STATE.providersAdded.some(function(a){ return a.name === p.name; });
        return '<div class="provider-list-item">'+
          '<div><div class="pname">'+p.name+'</div><div class="pdesc">'+p.desc+'</div></div>'+
          '<button class="mini-add '+(already?'added':'')+'" data-add="'+encodeURIComponent(p.name)+'">'+(already?'Agregado ✓':'+ Agregar')+'</button>'+
        '</div>';
      }).join('');
      openModal(
        '<div class="modal-head"><h3>Proveedores de '+typeInfo.label+'</h3><button class="modal-close" id="mClose">✕</button></div>'+
        '<p class="sub" style="margin-bottom:6px;">Elegí los proveedores que querés conectar a tu negocio.</p>'+
        '<div id="providerDirList">'+items+'</div>'
      );
      document.getElementById('mClose').addEventListener('click', function(){ closeModal(); renderProveedores(); });
      document.getElementById('providerDirList').addEventListener('click', function(e){
        var btn = e.target.closest('[data-add]');
        if(!btn || btn.classList.contains('added')) return;
        var name = decodeURIComponent(btn.getAttribute('data-add'));
        var found = directory.find(function(p){ return p.name === name; });
        STATE.providersAdded.push(found);
        saveState();
        btn.textContent = 'Agregado ✓'; btn.classList.add('added');
        toast('Proveedor agregado a tu negocio');
      });
    });
  }

  /* ---------------- catálogo de proveedor + carrito ---------------- */
  function openProviderCatalog(provider){
    var typeInfo = window.INNOVA_DATA.getType(TYPE);
    var cart = {}; // productId -> qty

    function renderCatalogRows(){
      return STATE.inventory.map(function(p){
        return '<div class="provider-list-item catalog-row">'+
          '<div><div class="pname">'+p.name+'</div><div class="pdesc">'+money(p.price)+' · stock actual: '+p.stock+'</div></div>'+
          '<div style="display:flex;align-items:center;gap:8px;">'+
            '<input type="number" class="qty-input" min="1" value="1" data-qty="'+p.id+'">'+
            '<button class="mini-add" data-buy="'+p.id+'">+ Agregar</button>'+
          '</div>'+
        '</div>';
      }).join('');
    }

    function renderCart(){
      var ids = Object.keys(cart);
      var total = 0;
      var rows = ids.map(function(id){
        var prod = STATE.inventory.find(function(p){ return p.id===id; });
        var qty = cart[id];
        var subtotal = prod.price*qty;
        total += subtotal;
        return '<div class="cart-item"><span>'+prod.name+' x'+qty+'</span><span>'+money(subtotal)+' <button class="cart-rm" data-cartrm="'+id+'">✕</button></span></div>';
      }).join('') || '<div class="empty-note" style="padding:10px 0;">Tu carrito está vacío.</div>';
      document.getElementById('cartItems').innerHTML = rows;
      document.getElementById('cartTotal').textContent = money(total);
      document.getElementById('confirmPurchase').disabled = ids.length === 0;
    }

    openModal(
      '<div class="modal-head"><h3>Catálogo de '+provider.name+'</h3><button class="modal-close" id="mClose">✕</button></div>'+
      '<p class="sub" style="margin-bottom:6px;">Elegí '+typeInfo.unitPlural+' para comprar. Se agregan a tu carrito.</p>'+
      '<div id="catalogList">'+renderCatalogRows()+'</div>'+
      '<div class="cart-box">'+
        '<h4>Carrito</h4>'+
        '<div id="cartItems"></div>'+
        '<div class="cart-total">Total: <strong id="cartTotal">$0.00</strong></div>'+
        '<button class="save-btn" id="confirmPurchase" disabled>Confirmar compra</button>'+
      '</div>'
    );
    renderCart();

    document.getElementById('mClose').addEventListener('click', closeModal);

    document.getElementById('catalogList').addEventListener('click', function(e){
      var btn = e.target.closest('[data-buy]');
      if(!btn) return;
      var id = btn.getAttribute('data-buy');
      var qtyInput = document.querySelector('[data-qty="'+id+'"]');
      var qty = Math.max(1, parseInt(qtyInput.value, 10) || 1);
      cart[id] = (cart[id] || 0) + qty;
      renderCart();
      toast('Agregado al carrito');
    });

    document.getElementById('cartItems').addEventListener('click', function(e){
      var btn = e.target.closest('[data-cartrm]');
      if(!btn) return;
      delete cart[btn.getAttribute('data-cartrm')];
      renderCart();
    });

    document.getElementById('confirmPurchase').addEventListener('click', function(){
      Object.keys(cart).forEach(function(id){
        var prod = STATE.inventory.find(function(p){ return p.id===id; });
        if(prod) prod.stock += cart[id];
      });
      saveState();
      closeModal();
      toast('Compra confirmada — tu inventario se actualizó');
      renderProveedores();
    });
  }

  /* ---------------- CLIENTES ---------------- */
  function renderClientes(){
    var typeInfo = window.INNOVA_DATA.getType(TYPE);
    var html = STATE.clients.map(function(c, i){
      var initials = c.name.split(' ').map(function(w){return w[0];}).slice(0,2).join('');
      var hist = c.purchases.map(function(p){
        return '<div><span>'+p.date+' · '+p.item+' x'+p.qty+'</span><strong>'+money(p.amount)+'</strong></div>';
      }).join('') || '<div class="empty-note" style="padding:8px 0;">Sin compras registradas</div>';
      return '<div class="item-card client-card" data-idx="'+i+'" style="animation-delay:'+(i*0.02)+'s">'+
        '<div class="row1"><div style="display:flex;align-items:center;gap:10px;"><div class="avatar">'+initials+'</div>'+
        '<div><div class="name" style="margin-bottom:0;">'+c.name+'</div><div class="meta" style="margin-top:2px;"><span>'+c.phone+'</span></div></div></div>'+
        '<span class="caret">▾</span></div>'+
        '<div class="meta" style="margin-top:12px;"><span>Total comprado</span><span class="price">'+money(c.total)+'</span></div>'+
        '<div class="hist">'+hist+'</div>'+
      '</div>';
    }).join('');
    html += '<div class="add-tile" id="addClientTile"><div class="plus-circle">+</div>Agregar '+typeInfo.clientNoun+'</div>';
    document.getElementById('clientsGrid').innerHTML = html;

    document.querySelectorAll('.client-card').forEach(function(card){
      card.addEventListener('click', function(){ card.classList.toggle('open'); });
    });

    document.getElementById('addClientTile').addEventListener('click', function(){
      var itemOptions = STATE.inventory.map(function(p){ return '<option value="'+p.id+'">'+p.name+' — '+money(p.price)+'</option>'; }).join('');
      openModal(
        '<div class="modal-head"><h3>Agregar '+typeInfo.clientNoun+'</h3><button class="modal-close" id="mClose">✕</button></div>'+
        '<form id="cliForm" class="form-grid">'+
          '<div class="f-field full"><label>Nombre</label><input name="name" required></div>'+
          '<div class="f-field full"><label>Teléfono</label><input name="phone" placeholder="7000-0000"></div>'+
          '<div class="f-field full"><label>Primera compra (opcional)</label><select name="item"><option value="">— Sin compra por ahora —</option>'+itemOptions+'</select></div>'+
          '<div class="f-field"><label>Cantidad</label><input name="qty" type="number" min="1" value="1"></div>'+
          '<div class="full"><button class="save-btn" type="submit">Guardar cliente</button></div>'+
        '</form>'
      );
      document.getElementById('mClose').addEventListener('click', closeModal);
      document.getElementById('cliForm').addEventListener('submit', function(e){
        e.preventDefault();
        var fd = new FormData(e.target);
        var newClient = {id:uid('cli'), name:fd.get('name'), phone:fd.get('phone')||'—', purchases:[], total:0};
        var itemId = fd.get('item');
        if(itemId){
          var prod = STATE.inventory.find(function(p){ return p.id===itemId; });
          var qty = parseInt(fd.get('qty'),10)||1;
          if(prod){
            var amount = Math.round(prod.price*qty*100)/100;
            newClient.purchases.push({item:prod.name, qty:qty, amount:amount, date:todayISO()});
            newClient.total = amount;
            STATE.sales.unshift({id:uid('sale'), client:newClient.name, item:prod.name, qty:qty, amount:amount, date:todayISO(), method:'Efectivo', status:'Pagado'});
            STATE.payments.unshift({id:uid('pay'), client:newClient.name, amount:amount, method:'Efectivo', status:'Pagado', date:todayISO()});
          }
        }
        STATE.clients.unshift(newClient);
        saveState(); closeModal(); toast('Cliente agregado'); renderAll();
      });
    });
  }

  /* ---------------- VENTAS ---------------- */
  function salesTableHTML(list, showAll){
    if(!list.length) return '<tr><td class="empty-note">Todavía no hay ventas registradas.</td></tr>';
    var rows = list.map(function(s){
      return '<tr><td>'+s.date+'</td><td>'+s.client+'</td><td>'+s.item+' x'+s.qty+'</td><td>'+money(s.amount)+'</td><td>'+s.method+'</td>'+
        '<td><span class="pill-status '+(s.status==='Pagado'?'pagado':'pendiente')+'">'+s.status+'</span></td></tr>';
    }).join('');
    return '<thead><tr><th>Fecha</th><th>Cliente</th><th>Ítem</th><th>Monto</th><th>Método</th><th>Estado</th></tr></thead><tbody>'+rows+'</tbody>';
  }

  function renderVentas(){
    var days7 = lastNDaysTotals(STATE.sales, 7);
    document.getElementById('barChart2').innerHTML = buildBarChart(days7, 'var(--dark-green)');
    var days14 = lastNDaysTotals(STATE.sales, 14);
    var run=0; var cum = days14.map(function(d){ run+=d.value; return {label:d.label, value:Math.round(run*100)/100}; });
    document.getElementById('lineChart2').innerHTML = buildLineChart(cum, 'var(--midnight)');
    document.getElementById('salesTable').innerHTML = salesTableHTML(STATE.sales, true);

    var saleModalBtn = document.querySelector('[data-modal="sale"]');
    saleModalBtn.onclick = function(){
      var clientOptions = STATE.clients.map(function(c){ return '<option value="'+c.id+'">'+c.name+'</option>'; }).join('');
      var itemOptions = STATE.inventory.map(function(p){ return '<option value="'+p.id+'">'+p.name+' — '+money(p.price)+'</option>'; }).join('');
      openModal(
        '<div class="modal-head"><h3>Registrar venta</h3><button class="modal-close" id="mClose">✕</button></div>'+
        '<form id="saleForm" class="form-grid">'+
          '<div class="f-field full"><label>Cliente</label><select name="client" required>'+clientOptions+'</select></div>'+
          '<div class="f-field full"><label>Producto</label><select name="item" required>'+itemOptions+'</select></div>'+
          '<div class="f-field"><label>Cantidad</label><input name="qty" type="number" min="1" value="1" required></div>'+
          '<div class="f-field"><label>Método</label><select name="method"><option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option></select></div>'+
          '<div class="f-field full"><label>Estado</label><select name="status"><option>Pagado</option><option>Pendiente</option></select></div>'+
          '<div class="full"><button class="save-btn" type="submit">Guardar venta</button></div>'+
        '</form>'
      );
      document.getElementById('mClose').addEventListener('click', closeModal);
      document.getElementById('saleForm').addEventListener('submit', function(e){
        e.preventDefault();
        var fd = new FormData(e.target);
        var client = STATE.clients.find(function(c){ return c.id===fd.get('client'); });
        var prod = STATE.inventory.find(function(p){ return p.id===fd.get('item'); });
        var qty = parseInt(fd.get('qty'),10)||1;
        var amount = Math.round(prod.price*qty*100)/100;
        var date = todayISO();
        var method = fd.get('method'); var status = fd.get('status');
        STATE.sales.unshift({id:uid('sale'), client:client.name, item:prod.name, qty:qty, amount:amount, date:date, method:method, status:status});
        STATE.payments.unshift({id:uid('pay'), client:client.name, amount:amount, method:method, status:status, date:date});
        client.purchases.unshift({item:prod.name, qty:qty, amount:amount, date:date});
        client.total = Math.round((client.total+amount)*100)/100;
        prod.stock = Math.max(0, prod.stock-qty);
        saveState(); closeModal(); toast('Venta registrada'); renderAll();
      });
    };
  }

  /* ---------------- INGRESOS ---------------- */
  function renderIngresos(){
    var total = STATE.sales.reduce(function(a,s){ return a+s.amount; }, 0);
    var days14 = lastNDaysTotals(STATE.sales, 14);
    var avg = days14.reduce(function(a,d){return a+d.value;},0) / days14.length;
    var best = days14.reduce(function(a,d){ return d.value>a.value?d:a; }, {value:0,label:'—'});
    document.getElementById('incomeKpiRow').innerHTML = [
      kpi('Ingresos totales', money(total), null),
      kpi('Promedio diario (14d)', money(avg), null),
      kpi('Mejor día', best.label + ' · ' + money(best.value), null)
    ].join('');
    document.getElementById('lineChartBig').innerHTML = buildLineChart(days14, 'var(--moss)');
  }

  /* ---------------- PAGOS ---------------- */
  var paymentFilter = 'Todos';
  function paymentsTableHTML(){
    var list = STATE.payments.filter(function(p){ return paymentFilter==='Todos' || p.status===paymentFilter; });
    if(!list.length) return '<tr><td class="empty-note">No hay pagos en este filtro.</td></tr>';
    var rows = list.map(function(p){
      return '<tr><td>'+p.date+'</td><td>'+p.client+'</td><td>'+money(p.amount)+'</td><td>'+p.method+'</td>'+
        '<td><span class="pill-status '+(p.status==='Pagado'?'pagado':'pendiente')+'">'+p.status+'</span></td></tr>';
    }).join('');
    return '<thead><tr><th>Fecha</th><th>Cliente</th><th>Monto</th><th>Método</th><th>Estado</th></tr></thead><tbody>'+rows+'</tbody>';
  }
  function renderPagos(){
    document.getElementById('paymentsTable').innerHTML = paymentsTableHTML();
    document.querySelectorAll('#paymentChips .chip').forEach(function(chip){
      chip.classList.toggle('active', chip.getAttribute('data-filter')===paymentFilter);
      chip.onclick = function(){
        paymentFilter = chip.getAttribute('data-filter');
        renderPagos();
      };
    });
    var btn = document.querySelector('[data-modal="payment"]');
    btn.onclick = function(){
      var clientOptions = STATE.clients.map(function(c){ return '<option value="'+c.name+'">'+c.name+'</option>'; }).join('');
      openModal(
        '<div class="modal-head"><h3>Registrar pago</h3><button class="modal-close" id="mClose">✕</button></div>'+
        '<form id="payForm" class="form-grid">'+
          '<div class="f-field full"><label>Cliente</label><select name="client">'+clientOptions+'</select></div>'+
          '<div class="f-field"><label>Monto ($)</label><input name="amount" type="number" step="0.01" min="0" required></div>'+
          '<div class="f-field"><label>Método</label><select name="method"><option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option></select></div>'+
          '<div class="f-field full"><label>Estado</label><select name="status"><option>Pagado</option><option>Pendiente</option></select></div>'+
          '<div class="full"><button class="save-btn" type="submit">Guardar pago</button></div>'+
        '</form>'
      );
      document.getElementById('mClose').addEventListener('click', closeModal);
      document.getElementById('payForm').addEventListener('submit', function(e){
        e.preventDefault();
        var fd = new FormData(e.target);
        STATE.payments.unshift({id:uid('pay'), client:fd.get('client'), amount:parseFloat(fd.get('amount'))||0, method:fd.get('method'), status:fd.get('status'), date:todayISO()});
        saveState(); closeModal(); toast('Pago registrado'); renderPagos();
      });
    };
  }

  /* ---------------- render dispatcher ---------------- */
  function renderAll(){
    var activeView = document.querySelector('.view.active');
    if(!activeView) return;
    var id = activeView.id;
    if(id === 'view-resumen') renderResumen();
    else if(id === 'view-inventario') renderInventario();
    else if(id === 'view-ventas') renderVentas();
    else if(id === 'view-proveedores') renderProveedores();
    else if(id === 'view-clientes') renderClientes();
    else if(id === 'view-ingresos') renderIngresos();
    else if(id === 'view-pagos') renderPagos();
  }

  /* ---------------- init ---------------- */
  function boot(){
    if(!loadAccount()) return;
    loadState();
    safe(initTheme, 'theme');
    safe(renderTopbar, 'topbar');
    safe(initNav, 'nav');
    safe(initModalBase, 'modalBase');
    safe(renderResumen, 'resumen');
  }

  safe(boot, 'boot');
})();
