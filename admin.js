(function(){
  "use strict";

  function safe(fn, name){ try{ return fn(); }catch(err){ console.warn('[InnovaSistem admin]', name, err); } }
  function money(n){ return '$' + (Math.round(n*100)/100).toFixed(2); }
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function isoDate(d){ return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }
  function todayISO(){ return isoDate(new Date()); }
  // Escapa texto que viene de la base antes de meterlo en innerHTML.
  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function norm(v){ return String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

  // Las ventas llegan una fila por producto; esto las junta por venta.
  function groupSales(rows){
    var map = {}; var list = [];
    rows.forEach(function(r){
      var g = map[r.saleId];
      if(!g){
        g = map[r.saleId] = {saleId:r.saleId, date:r.date, client:r.client, items:[], amount:0, method:r.method, status:r.status};
        list.push(g);
      }
      g.items.push(r.item + ' x' + r.qty);
      g.amount = Math.round((g.amount + r.amount)*100)/100;
    });
    return list;
  }

  var STATE = null;
  var TYPE = null;

  /* ---------------- estado desde la base de datos (api/negocio.php) ---------------- */
  function goLogin(){ window.location.href = 'login.html'; }

  // Trae el estado del negocio; si no hay sesión vuelve al login.
  function refresh(){
    return window.innovaApi('negocio.php').then(function(r){
      if(r.status === 401){ goLogin(); return Promise.reject('sin sesión'); }
      if(!r.ok){ toast(r.data.error || 'No se pudieron cargar los datos'); return Promise.reject(r.data.error); }
      STATE = r.data;
      TYPE = STATE.type;
    });
  }

  // Un negocio nuevo arranca con el inventario de su oficio en stock 0.
  function seedIfEmpty(){
    if(STATE.inventory.length) return Promise.resolve();
    var typeInfo = window.INNOVA_DATA.getType(TYPE);
    return window.innovaApi('negocio.php', {
      action:'seed',
      categoria: typeInfo.categoryLabel,
      products: window.INNOVA_DATA.productsFor(TYPE)
    }).then(refresh);
  }

  // Manda un cambio a la API, recarga el estado y vuelve a pintar.
  function act(file, body, okMsg){
    return window.innovaApi(file, body).then(function(r){
      if(r.status === 401){ goLogin(); return false; }
      if(!r.ok){ toast(r.data.error || 'No se pudo guardar'); return false; }
      return refresh().then(function(){
        if(okMsg) toast(okMsg);
        return true;
      });
    });
  }

  /* ---------------- topbar ---------------- */
  function renderTopbar(){
    var typeInfo = window.INNOVA_DATA.getType(TYPE);
    document.getElementById('bizName').textContent = STATE.name || 'Mi negocio';
    document.getElementById('bizTypeBadge').textContent = typeInfo.label;
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
      window.innovaApi('logout.php', {}).then(goLogin);
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
      days.push(isoDate(d));
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

    var recent = groupSales(STATE.sales).slice(0,6);
    document.getElementById('recentSalesTable').innerHTML = salesTableHTML(recent, false);
  }
  function kpi(lbl, val, deltaClass){
    return '<div class="kpi-card"><div class="lbl">'+lbl+'</div><div class="val">'+val+'</div>'+
      (deltaClass ? '<div class="delta '+deltaClass+'">Revisar pronto</div>' : '<div class="delta">Al día</div>')+'</div>';
  }

  /* ---------------- INVENTARIO ---------------- */
  function renderInventario(){
    var typeInfo = window.INNOVA_DATA.getType(TYPE);
    var owner = STATE.me.isOwner;
    document.getElementById('invTitle').textContent = 'Inventario de ' + typeInfo.unitPlural;
    document.getElementById('invSub').textContent = 'Stock y precio de cada ' + typeInfo.unit + '. Se abastece comprándole a tus proveedores.';

    var html = STATE.inventory.map(function(p, i){
      var low = p.stock < 30;
      var pct = Math.min(100, (p.stock/300)*100);
      return '<div class="item-card" style="animation-delay:'+(i*0.03)+'s">'+
        '<div class="name">'+esc(p.name)+'</div>'+
        '<div class="meta"><span>Stock: '+p.stock+'</span><span class="price">'+money(p.price)+'</span></div>'+
        '<div class="stock-bar"><i class="'+(low?'low':'')+'" style="width:'+pct+'%"></i></div>'+
        (low ? '<div style="font-size:.72rem;color:var(--rosy-dark);margin-top:8px;">⚠ Stock bajo — reabastecer</div>' : '') +
        (owner ? '<div class="card-actions"><button class="link-btn" data-edit-prod="'+p.id+'">Editar</button></div>' : '') +
      '</div>';
    }).join('');
    if(!STATE.inventory.length){
      html = '<div class="empty-note">Todavía no tenés '+typeInfo.unitPlural+'.</div>';
    }
    var grid = document.getElementById('inventoryGrid');
    grid.innerHTML = html;
    grid.querySelectorAll('[data-edit-prod]').forEach(function(btn){
      btn.onclick = function(){
        var id = btn.getAttribute('data-edit-prod');
        openProductModal(STATE.inventory.find(function(p){ return p.id === id; }));
      };
    });
  }

  // Editar / eliminar producto (solo el dueño).
  function openProductModal(prod){
    openModal(
      '<div class="modal-head"><h3>Editar producto</h3><button class="modal-close" id="mClose">✕</button></div>'+
      '<form id="prodForm" class="form-grid">'+
        '<div class="f-field full"><label>Nombre</label><input name="name" required maxlength="100" value="'+esc(prod.name)+'"></div>'+
        '<div class="f-field"><label>Precio ($)</label><input name="price" type="number" step="0.01" min="0" required value="'+prod.price+'"></div>'+
        '<div class="f-field"><label>Stock</label><input name="stock" type="number" step="1" min="0" required value="'+prod.stock+'"></div>'+
        '<div class="full"><p class="sub" style="font-size:.78rem;">Si cambiás el stock a mano queda registrado como movimiento de inventario.</p>'+
          '<button class="save-btn" type="submit">Guardar cambios</button>'+
          '<button class="danger-btn" type="button" id="prodDelete">Eliminar</button>'+
        '</div>'+
      '</form>'
    );
    document.getElementById('mClose').addEventListener('click', closeModal);
    document.getElementById('prodForm').addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(e.target);
      act('productos.php', {
        action: 'update', id: prod.id,
        name: fd.get('name'), price: parseFloat(fd.get('price')), stock: parseInt(fd.get('stock'), 10)
      }, 'Producto actualizado').then(function(ok){
        if(ok){ closeModal(); renderInventario(); }
      });
    });
    document.getElementById('prodDelete').addEventListener('click', function(){
      if(!confirm('¿Eliminar "'+prod.name+'"? Si ya se vendió, deja de aparecer pero sus ventas quedan en el historial.')) return;
      act('productos.php', {action:'delete', id:prod.id}, 'Producto eliminado').then(function(ok){
        if(ok){ closeModal(); renderInventario(); }
      });
    });
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
        var prov = STATE.providersAdded[parseInt(btn.getAttribute('data-rm'),10)];
        act('proveedores.php', {action:'remove', id:prov.id}, 'Proveedor quitado').then(renderProveedores);
      });
    });

    document.getElementById('addProviderTile').addEventListener('click', function(e){
      e.stopPropagation();
      var directory = window.INNOVA_DATA.providersFor(TYPE);
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
        btn.classList.add('added');
        act('proveedores.php', {action:'add', name:found.name, desc:found.desc}, 'Proveedor agregado a tu negocio').then(function(ok){
          if(ok) btn.textContent = 'Agregado ✓';
          else btn.classList.remove('added');
        });
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
      var items = Object.keys(cart).map(function(id){ return {id:id, qty:cart[id]}; });
      this.disabled = true;
      act('comprar.php', {providerId:provider.id, items:items}, 'Compra confirmada — tu inventario se actualizó').then(function(ok){
        if(!ok) return;
        closeModal();
        renderProveedores();
      });
    });
  }

  /* ---------------- CLIENTES ---------------- */
  var clientQuery = '';
  function renderClientes(){
    var typeInfo = window.INNOVA_DATA.getType(TYPE);
    var q = norm(clientQuery);
    var list = STATE.clients.filter(function(c){
      return !q || norm(c.name + ' ' + c.phone + ' ' + c.email).indexOf(q) !== -1;
    });
    var html = list.map(function(c, i){
      var initials = c.name.split(' ').map(function(w){return w[0];}).slice(0,2).join('');
      var hist = c.purchases.map(function(p){
        return '<div><span>'+p.date+' · '+esc(p.item)+' x'+p.qty+'</span><strong>'+money(p.amount)+'</strong></div>';
      }).join('') || '<div class="empty-note" style="padding:8px 0;">Sin compras registradas</div>';
      return '<div class="item-card client-card" data-id="'+c.id+'" style="animation-delay:'+(i*0.02)+'s">'+
        '<div class="row1"><div style="display:flex;align-items:center;gap:10px;"><div class="avatar">'+esc(initials)+'</div>'+
        '<div><div class="name" style="margin-bottom:0;">'+esc(c.name)+'</div><div class="meta" style="margin-top:2px;"><span>'+esc(c.phone)+'</span></div></div></div>'+
        '<span class="caret">▾</span></div>'+
        '<div class="meta" style="margin-top:12px;"><span>Total comprado</span><span class="price">'+money(c.total)+'</span></div>'+
        '<div class="card-actions"><button class="link-btn" data-edit-cli="'+c.id+'">Editar</button><button class="link-btn danger" data-del-cli="'+c.id+'">Eliminar</button></div>'+
        '<div class="hist">'+hist+'</div>'+
      '</div>';
    }).join('');
    if(q && !list.length) html = '<div class="empty-note">Ningún cliente coincide con “'+esc(clientQuery)+'”.</div>';
    html += '<div class="add-tile" id="addClientTile"><div class="plus-circle">+</div>Agregar '+typeInfo.clientNoun+'</div>';
    var grid = document.getElementById('clientsGrid');
    grid.innerHTML = html;

    grid.querySelectorAll('.client-card').forEach(function(card){
      card.addEventListener('click', function(){ card.classList.toggle('open'); });
    });
    function findClient(id){ return STATE.clients.find(function(c){ return c.id === id; }); }
    grid.querySelectorAll('[data-edit-cli]').forEach(function(btn){
      btn.addEventListener('click', function(e){ e.stopPropagation(); openClientModal(findClient(btn.getAttribute('data-edit-cli'))); });
    });
    grid.querySelectorAll('[data-del-cli]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var c = findClient(btn.getAttribute('data-del-cli'));
        if(!confirm('¿Eliminar a "'+c.name+'"? Si ya compró, deja de aparecer pero sus ventas quedan en el historial.')) return;
        act('clientes.php', {action:'delete', id:c.id}, 'Cliente eliminado').then(function(ok){ if(ok) renderClientes(); });
      });
    });
    document.getElementById('addClientTile').addEventListener('click', function(){ openClientModal(null); });

    var search = document.getElementById('clientSearch');
    search.oninput = function(){ clientQuery = search.value; renderClientes(); };
  }

  // Agregar / editar cliente. Al agregar se puede registrar su primera compra.
  function openClientModal(c){
    var typeInfo = window.INNOVA_DATA.getType(TYPE);
    var isNew = !c;
    var itemOptions = STATE.inventory.filter(function(p){ return p.stock > 0; }).map(function(p){
      return '<option value="'+p.id+'">'+esc(p.name)+' — '+money(p.price)+' (stock '+p.stock+')</option>';
    }).join('');
    openModal(
      '<div class="modal-head"><h3>'+(isNew ? 'Agregar ' : 'Editar ')+typeInfo.clientNoun+'</h3><button class="modal-close" id="mClose">✕</button></div>'+
      '<form id="cliForm" class="form-grid">'+
        '<div class="f-field full"><label>Nombre</label><input name="name" required maxlength="100" value="'+(isNew?'':esc(c.name))+'"></div>'+
        '<div class="f-field"><label>Teléfono</label><input name="phone" maxlength="20" value="'+(isNew||c.phone==='—'?'':esc(c.phone))+'"></div>'+
        '<div class="f-field"><label>Correo</label><input name="email" type="email" maxlength="100" value="'+(isNew?'':esc(c.email))+'"></div>'+
        '<div class="f-field full"><label>Dirección</label><input name="address" maxlength="150" value="'+(isNew?'':esc(c.address))+'"></div>'+
        (isNew ?
          '<div class="f-field full"><label>Primera compra (opcional)</label><select name="item"><option value="">— Sin compra por ahora —</option>'+itemOptions+'</select></div>'+
          '<div class="f-field"><label>Cantidad</label><input name="qty" type="number" min="1" value="1"></div>' : '')+
        '<div class="full"><button class="save-btn" type="submit">'+(isNew ? 'Guardar cliente' : 'Guardar cambios')+'</button></div>'+
      '</form>'
    );
    document.getElementById('mClose').addEventListener('click', closeModal);
    document.getElementById('cliForm').addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(e.target);
      act('clientes.php', {
        action: isNew ? 'create' : 'update', id: isNew ? null : c.id,
        name: fd.get('name'), phone: fd.get('phone'), email: fd.get('email'), address: fd.get('address'),
        item: isNew ? fd.get('item') : null, qty: isNew ? (parseInt(fd.get('qty'),10) || 1) : null
      }, isNew ? 'Cliente agregado' : 'Cliente actualizado').then(function(ok){
        if(ok){ closeModal(); renderAll(); }
      });
    });
  }

  /* ---------------- VENTAS ---------------- */
  function salesTableHTML(list, showAll){
    if(!list.length) return '<tr><td class="empty-note">Todavía no hay ventas registradas.</td></tr>';
    var rows = list.map(function(s){
      return '<tr><td>'+s.date+'</td><td>'+esc(s.client)+'</td><td>'+esc(s.items.join(', '))+'</td><td>'+money(s.amount)+'</td><td>'+esc(s.method)+'</td>'+
        '<td><span class="pill-status '+(s.status==='Pagado'?'pagado':'pendiente')+'">'+esc(s.status)+'</span></td>'+
        (showAll ? '<td><button class="link-btn" data-invoice="'+s.saleId+'">Factura</button></td>' : '')+'</tr>';
    }).join('');
    return '<thead><tr><th>Fecha</th><th>Cliente</th><th>Productos</th><th>Monto</th><th>Método</th><th>Estado</th>'+(showAll?'<th></th>':'')+'</tr></thead><tbody>'+rows+'</tbody>';
  }

  function filteredSales(){
    var q = norm(document.getElementById('salesSearch').value);
    var from = document.getElementById('salesFrom').value;
    var to = document.getElementById('salesTo').value;
    return groupSales(STATE.sales).filter(function(s){
      if(from && s.date < from) return false;
      if(to && s.date > to) return false;
      return !q || norm(s.client + ' ' + s.items.join(' ')).indexOf(q) !== -1;
    });
  }

  function renderSalesTable(){
    var table = document.getElementById('salesTable');
    var list = filteredSales();
    table.innerHTML = list.length || !STATE.sales.length ? salesTableHTML(list, true)
      : '<tr><td class="empty-note">Ninguna venta coincide con el filtro.</td></tr>';
    table.querySelectorAll('[data-invoice]').forEach(function(btn){
      btn.onclick = function(){ openInvoice(btn.getAttribute('data-invoice')); };
    });
  }

  function renderVentas(){
    var days7 = lastNDaysTotals(STATE.sales, 7);
    document.getElementById('barChart2').innerHTML = buildBarChart(days7, 'var(--dark-green)');
    var days14 = lastNDaysTotals(STATE.sales, 14);
    var run=0; var cum = days14.map(function(d){ run+=d.value; return {label:d.label, value:Math.round(run*100)/100}; });
    document.getElementById('lineChart2').innerHTML = buildLineChart(cum, 'var(--midnight)');
    renderSalesTable();
    ['salesSearch','salesFrom','salesTo'].forEach(function(id){
      document.getElementById(id).oninput = renderSalesTable;
    });
    document.querySelector('[data-modal="sale"]').onclick = openSaleModal;
  }

  // Venta con uno o varios productos (cada línea = producto + cantidad).
  function openSaleModal(){
    if(!STATE.clients.length){ toast('Primero agregá un cliente en la sección Clientes'); return; }
    var avail = STATE.inventory.filter(function(p){ return p.stock > 0; });
    if(!avail.length){ toast('No tenés stock. Comprale a un proveedor o ajustá el inventario.'); return; }
    var clientOptions = STATE.clients.map(function(c){ return '<option value="'+c.id+'">'+esc(c.name)+'</option>'; }).join('');
    var itemOptions = avail.map(function(p){
      return '<option value="'+p.id+'">'+esc(p.name)+' — '+money(p.price)+' (stock '+p.stock+')</option>';
    }).join('');
    openModal(
      '<div class="modal-head"><h3>Registrar venta</h3><button class="modal-close" id="mClose">✕</button></div>'+
      '<form id="saleForm" class="form-grid">'+
        '<div class="f-field full"><label>Cliente</label><select name="client" required>'+clientOptions+'</select></div>'+
        '<div class="f-field full"><label>Productos</label><div class="sale-lines" id="saleLines"></div>'+
          '<button type="button" class="add-line" id="addLine">+ Agregar otro producto</button></div>'+
        '<div class="f-field"><label>Método</label><select name="method"><option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option></select></div>'+
        '<div class="f-field"><label>Estado</label><select name="status"><option>Pagado</option><option>Pendiente</option></select></div>'+
        '<div class="full cart-total">Total: <strong id="saleTotal">$0.00</strong></div>'+
        '<div class="full"><button class="save-btn" type="submit" style="margin-top:0;">Guardar venta</button></div>'+
      '</form>'
    );
    var lines = document.getElementById('saleLines');
    function priceOf(id){ var p = STATE.inventory.find(function(x){ return x.id === id; }); return p ? p.price : 0; }
    function recalc(){
      var total = 0;
      lines.querySelectorAll('.sale-line').forEach(function(l){
        total += priceOf(l.querySelector('select').value) * (parseInt(l.querySelector('input').value, 10) || 0);
      });
      document.getElementById('saleTotal').textContent = money(total);
    }
    function addLine(){
      var div = document.createElement('div');
      div.className = 'sale-line';
      div.innerHTML = '<select>'+itemOptions+'</select><input type="number" min="1" value="1" aria-label="Cantidad"><button type="button" class="cart-rm" title="Quitar">✕</button>';
      div.querySelector('.cart-rm').onclick = function(){
        if(lines.children.length > 1){ div.remove(); recalc(); }
      };
      div.querySelector('select').onchange = recalc;
      div.querySelector('input').oninput = recalc;
      lines.appendChild(div);
      recalc();
    }
    addLine();
    document.getElementById('addLine').onclick = addLine;
    document.getElementById('mClose').addEventListener('click', closeModal);
    document.getElementById('saleForm').addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(e.target);
      var items = [].map.call(lines.querySelectorAll('.sale-line'), function(l){
        return {id: l.querySelector('select').value, qty: parseInt(l.querySelector('input').value, 10) || 1};
      });
      act('ventas.php', {client: fd.get('client'), items: items, method: fd.get('method'), status: fd.get('status')}, 'Venta registrada').then(function(ok){
        if(ok){ closeModal(); renderAll(); }
      });
    });
  }

  /* ---------------- FACTURA ---------------- */
  function invoiceHTML(f){
    var rows = f.items.map(function(it){
      return '<tr><td>'+esc(it.name)+'</td><td>'+it.qty+'</td><td>'+money(it.price)+'</td><td>'+money(it.subtotal)+'</td></tr>';
    }).join('');
    return '<div class="invoice">'+
      '<div class="inv-head"><div><h4>'+esc(f.business.name)+'</h4>'+
        '<div class="muted">'+esc(f.business.address || '')+(f.business.phone ? ' · Tel. '+esc(f.business.phone) : '')+'</div></div>'+
        '<div class="inv-num"><div class="muted">Factura N°</div><b>'+pad(f.number)+'</b><div class="muted">'+f.date+'</div></div></div>'+
      '<div style="margin-bottom:10px;"><div class="muted">Cliente</div><strong>'+esc(f.client.name)+'</strong>'+
        (f.client.phone ? ' · '+esc(f.client.phone) : '')+(f.client.address ? '<div class="muted">'+esc(f.client.address)+'</div>' : '')+'</div>'+
      '<table class="data-table"><thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      '<div class="inv-total"><span>Total</span><span>'+money(f.total)+'</span></div>'+
      '<div class="muted" style="margin-top:8px;">Pago: '+esc(f.method)+' · '+esc(f.status)+' · Atendió: '+esc(f.servedBy)+' · Venta #'+f.saleId+'</div>'+
    '</div>';
  }

  function printInvoice(f){
    var w = window.open('', '_blank', 'width=720,height=900');
    if(!w){ toast('Permití las ventanas emergentes para imprimir la factura'); return; }
    w.document.write('<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Factura N° '+pad(f.number)+'</title><style>'+
      'body{font-family:Segoe UI,Arial,sans-serif;color:#1C1830;padding:32px;max-width:680px;margin:auto;}'+
      'h4{font-size:20px;margin:0 0 4px;}.muted{color:#666;font-size:12px;}'+
      '.inv-head{display:flex;justify-content:space-between;border-bottom:2px dashed #ccc;padding-bottom:12px;margin-bottom:14px;}'+
      '.inv-num{text-align:right;}.inv-num b{font-size:20px;}'+
      'table{width:100%;border-collapse:collapse;font-size:14px;margin-top:8px;}th,td{text-align:left;padding:8px;border-bottom:1px solid #ddd;}'+
      'th{font-size:11px;text-transform:uppercase;color:#666;}'+
      '.inv-total{display:flex;justify-content:space-between;font-weight:700;font-size:18px;margin-top:14px;}'+
      '</style></head><body>'+invoiceHTML(f)+'</body></html>');
    w.document.close();
    w.focus();
    w.print();
  }

  function openInvoice(saleId){
    window.innovaApi('factura.php?venta=' + encodeURIComponent(saleId)).then(function(r){
      if(!r.ok){ toast(r.data.error || 'No se pudo abrir la factura'); return; }
      var f = r.data;
      openModal(
        '<div class="modal-head"><h3>Factura</h3><button class="modal-close" id="mClose">✕</button></div>'+
        invoiceHTML(f)+
        '<button class="save-btn" id="printInvoice">Imprimir</button>'
      );
      document.getElementById('mClose').addEventListener('click', closeModal);
      document.getElementById('printInvoice').addEventListener('click', function(){ printInvoice(f); });
    });
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
      return '<tr><td>'+p.date+'</td><td>'+esc(p.client)+'</td><td>'+money(p.amount)+'</td><td>'+esc(p.method)+'</td>'+
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
  }

  /* ---------------- CORREO del negocio (tipo Gmail) ----------------
     Recibidos: avisos de InnovaSistem, respuestas y avisos de pedidos.
     Enviados: consultas a InnovaSistem (le llegan al Correo de admin24). */
  var BOX = {inbox:[], sent:[], unread:0};
  var gmFolder = 'inbox';
  var gmSel = null;       // id del mensaje abierto, o 'compose'
  var GM_TYPES = {
    aviso:     {label:'Aviso',     cls:'t-negocio',  icon:'<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>'},
    respuesta: {label:'Respuesta', cls:'t-consulta', icon:'<path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v6"/>'},
    pedido:    {label:'Pedido',    cls:'t-pedido',   icon:'<path d="M3 8l9-5 9 5-9 5-9-5Z"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/>'},
    enviado:   {label:'Enviado',   cls:'t-proveedor',icon:'<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>'}
  };
  function gmDate(d){
    var day = d.slice(0,10), hour = d.slice(11,16);
    return day === todayISO() ? hour : day.slice(8,10) + '/' + day.slice(5,7);
  }

  function loadBox(){
    return window.innovaApi('buzon.php').then(function(r){
      if(!r.ok) return;
      BOX = r.data;
      ['supportBadge','dockMailBadge'].forEach(function(id){
        var b = document.getElementById(id);
        b.textContent = BOX.unread > 99 ? '99+' : BOX.unread;
        b.hidden = BOX.unread === 0;
      });
      document.getElementById('gmInboxCount').textContent = BOX.unread || '';
    });
  }
  function boxAct(body, msg){
    return window.innovaApi('buzon.php', body).then(function(r){
      if(!r.ok){ toast(r.data.error || 'No se pudo guardar'); return false; }
      if(msg) toast(msg);
      return loadBox().then(function(){ return true; });
    });
  }

  function renderCorreo(){
    document.querySelectorAll('.gm-folder').forEach(function(f){
      f.classList.toggle('active', f.getAttribute('data-folder') === gmFolder);
      f.onclick = function(){ gmFolder = f.getAttribute('data-folder'); gmSel = null; renderCorreo(); };
    });
    document.getElementById('gmCompose').onclick = function(){ gmSel = 'compose'; renderCorreo(); };

    var items = gmFolder === 'inbox' ? BOX.inbox : BOX.sent.map(function(m){
      return {id:m.id, type:'enviado', from:'Para: InnovaSistem', subject:m.subject, body:m.body, date:m.date, read:true, reply:m.reply, replyDate:m.replyDate};
    });
    var list = document.getElementById('gmList');
    list.innerHTML = items.length ? items.map(function(m){
      var t = GM_TYPES[m.type] || GM_TYPES.aviso;
      return '<button type="button" class="gm-item'+(m.read ? '' : ' unread')+(gmSel === m.id ? ' sel' : '')+'" data-open="'+m.id+'">'+
        '<span class="mail-ico '+t.cls+'"><svg viewBox="0 0 24 24">'+t.icon+'</svg></span>'+
        '<span class="gm-item-main"><span class="gm-item-top"><span class="gm-from">'+esc(m.from)+'</span><span class="gm-date">'+esc(gmDate(m.date))+'</span></span>'+
        '<span class="gm-subject">'+esc(m.subject)+'</span>'+
        '<span class="gm-snippet">'+esc(m.body.replace(/\s+/g,' ').slice(0,90))+'</span></span>'+
      '</button>';
    }).join('') : '<div class="empty-note">'+(gmFolder === 'inbox' ? 'No tenés mensajes todavía. Acá te llegan las noticias de InnovaSistem y los avisos de tus pedidos.' : 'Todavía no le escribiste a InnovaSistem.')+'</div>';

    list.querySelectorAll('[data-open]').forEach(function(b){
      b.onclick = function(){
        var id = b.getAttribute('data-open');
        gmSel = id;
        var m = items.find(function(x){ return x.id === id; });
        if(gmFolder === 'inbox' && m && !m.read){ boxAct({action:'read', id:id, read:true}).then(renderCorreo); }
        else renderCorreo();
      };
    });

    var read = document.getElementById('gmRead');
    document.querySelector('.gmail').classList.toggle('reading', !!gmSel);
    if(gmSel === 'compose'){
      read.innerHTML =
        '<div class="gm-read-head"><button type="button" class="gm-back" id="gmBack">←</button><h3>Mensaje nuevo</h3></div>'+
        '<div class="gm-to">Para: <b>InnovaSistem</b> (soporte)</div>'+
        '<form id="gmForm" class="form-grid">'+
          '<div class="f-field full"><label>Asunto</label><input name="subject" required maxlength="200"></div>'+
          '<div class="f-field full"><label>Mensaje</label><textarea name="message" rows="8" required maxlength="3000"></textarea></div>'+
          '<div class="full"><button class="save-btn" type="submit">Enviar</button></div>'+
        '</form>';
      document.getElementById('gmForm').onsubmit = function(e){
        e.preventDefault();
        var f = e.target;
        boxAct({action:'send', subject:f.subject.value, message:f.message.value}, 'Consulta enviada a InnovaSistem').then(function(ok){
          if(ok){ gmFolder = 'sent'; gmSel = null; renderCorreo(); }
        });
      };
    } else {
      var m = gmSel && items.find(function(x){ return x.id === gmSel; });
      if(!m){
        read.innerHTML = '<div class="gm-empty"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg><p>Elegí un mensaje para leerlo</p></div>';
      } else {
        var t = GM_TYPES[m.type] || GM_TYPES.aviso;
        read.innerHTML =
          '<div class="gm-read-head"><button type="button" class="gm-back" id="gmBack">←</button><h3>'+esc(m.subject)+'</h3></div>'+
          '<div class="gm-meta"><span class="mail-ico '+t.cls+'"><svg viewBox="0 0 24 24">'+t.icon+'</svg></span>'+
            '<div><b>'+esc(m.from)+'</b><div class="gm-date">'+esc(m.date.slice(0,16))+'</div></div>'+
            '<span class="mail-tag '+t.cls+'">'+t.label+'</span></div>'+
          '<div class="gm-body">'+esc(m.body)+'</div>'+
          (m.type === 'enviado' ? (m.reply
            ? '<div class="mail-reply"><div class="mail-reply-head">Respuesta de InnovaSistem · '+esc(m.replyDate.slice(0,16))+'</div>'+esc(m.reply)+'</div>'
            : '<div class="s-wait">Esperando respuesta…</div>') : '')+
          (gmFolder === 'inbox' ? '<div class="mail-actions"><button type="button" class="link-btn" id="gmUnread">Marcar como no leído</button><button type="button" class="link-btn danger" id="gmDelete">Eliminar</button></div>' : '');
        if(gmFolder === 'inbox'){
          document.getElementById('gmUnread').onclick = function(){ var id = gmSel; gmSel = null; boxAct({action:'read', id:id, read:false}).then(renderCorreo); };
          document.getElementById('gmDelete').onclick = function(){
            if(!confirm('¿Eliminar este mensaje?')) return;
            var id = gmSel; gmSel = null;
            boxAct({action:'delete', id:id}, 'Mensaje eliminado').then(renderCorreo);
          };
        }
      }
    }
    var back = document.getElementById('gmBack');
    if(back) back.onclick = function(){ gmSel = null; renderCorreo(); };
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
    else if(id === 'view-correo') loadBox().then(renderCorreo);
  }

  /* ---------------- init ---------------- */
  function boot(){
    refresh().then(seedIfEmpty).then(function(){
      safe(renderTopbar, 'topbar');
      safe(initNav, 'nav');
      safe(initModalBase, 'modalBase');
      safe(renderResumen, 'resumen');
      // el botón "Correo" de arriba abre la misma sección que el del dock
      document.getElementById('supportBtn').addEventListener('click', function(){
        document.querySelector('.dock-btn[data-view="correo"]').click();
      });
      loadBox();
      setInterval(function(){
        loadBox().then(function(){
          var active = document.querySelector('.view.active');
          if(active && active.id === 'view-correo' && gmSel === null) renderCorreo();
        });
      }, 60000);
    }).catch(function(err){ console.warn('[InnovaSistem admin] boot', err); });
  }

  safe(boot, 'boot');
})();
