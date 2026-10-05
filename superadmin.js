(function(){
  "use strict";

  var COMMISSION_RATE = 0.10;

  function safe(fn, name){ try{ return fn(); }catch(err){ console.warn('[InnovaSistem superadmin]', name, err); } }
  function money(n){ return '$' + (Math.round(n*100)/100).toFixed(2); }
  function todayISO(){ return new Date().toISOString().slice(0,10); }

  /* ---------------- datos desde la base (api/superadmin.php) ---------------- */
  var DATA = {businesses:[], sales:[], orders:[]};

  function goLogin(){ window.location.href = 'login.html'; }

  function refresh(){
    return window.innovaApi('superadmin.php').then(function(r){
      if(r.status === 401){ goLogin(); return Promise.reject('sin sesión'); }
      if(!r.ok){ toast(r.data.error || 'No se pudieron cargar los datos'); return Promise.reject(r.data.error); }
      DATA = r.data;
    });
  }
  function getAccounts(){ return DATA.businesses; }
  function getOrders(){ return DATA.orders; }
  function deleteBusiness(id){
    return window.innovaApi('superadmin.php', {action:'delete', id:id}).then(function(r){
      if(!r.ok){ toast(r.data.error || 'No se pudo eliminar'); return false; }
      return refresh().then(function(){ return true; });
    });
  }
  function typeLabel(type){
    var t = window.INNOVA_DATA && window.INNOVA_DATA.getType(type);
    return t ? t.label : type;
  }

  /* ---------------- toast ---------------- */
  function toast(msg){
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function(){ el.classList.remove('show'); }, 2600);
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
      window.innovaApi('logout.php', {}).then(goLogin);
    }
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('logoutBtn2').addEventListener('click', logout);
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

  function kpi(lbl, val, deltaClass, deltaText){
    return '<div class="kpi-card"><div class="lbl">'+lbl+'</div><div class="val">'+val+'</div>'+
      (deltaClass ? '<div class="delta '+deltaClass+'">'+deltaText+'</div>' : '<div class="delta">Al día</div>')+'</div>';
  }

  function salesTableHTML(list){
    if(!list.length) return '<tr><td class="empty-note">Todavía no hay ventas registradas en ningún negocio.</td></tr>';
    var rows = list.map(function(s){
      return '<tr><td>'+s.date+'</td><td>'+s.businessName+'</td><td>'+s.client+'</td><td>'+s.item+' x'+s.qty+'</td><td>'+money(s.amount)+'</td>'+
        '<td><span class="pill-status '+(s.status==='Pagado'?'pagado':'pendiente')+'">'+s.status+'</span></td></tr>';
    }).join('');
    return '<thead><tr><th>Fecha</th><th>Negocio</th><th>Cliente</th><th>Ítem</th><th>Monto</th><th>Estado</th></tr></thead><tbody>'+rows+'</tbody>';
  }

  /* ---------------- aggregation helpers ---------------- */
  function allBusinessData(){
    return getAccounts().map(function(acc){
      return {account: acc, revenue: acc.revenue};
    });
  }

  /* ---------------- RESUMEN ---------------- */
  function renderResumen(){
    var accounts = getAccounts();
    var bizData = allBusinessData();
    var orders = getOrders();
    var totalRevenue = bizData.reduce(function(a,b){ return a+b.revenue; }, 0);
    var commission = totalRevenue * COMMISSION_RATE;
    var activeOrders = orders.filter(function(o){ return o.arrivalDate > todayISO(); }).length;

    document.getElementById('kpiRow').innerHTML = [
      kpi('Negocios registrados', accounts.length, null),
      kpi('Ingresos generados', money(totalRevenue), null),
      kpi('Tu comisión (' + Math.round(COMMISSION_RATE*100) + '%)', money(commission), null),
      kpi('Pedidos en camino', activeOrders, activeOrders>0?'down':null, 'Seguimiento activo')
    ].join('');

    var allSales = DATA.sales.slice();

    var days7 = lastNDaysTotals(allSales, 7);
    document.getElementById('barChart').innerHTML = buildBarChart(days7, 'var(--midnight)');
    var cumulative = []; var run = 0;
    days7.forEach(function(d){ run += d.value; cumulative.push({label:d.label, value:Math.round(run*100)/100}); });
    document.getElementById('lineChartSmall').innerHTML = buildLineChart(cumulative, 'var(--rosy-dark)');

    allSales.sort(function(a,b){ return a.date < b.date ? 1 : -1; });
    document.getElementById('recentSalesTable').innerHTML = salesTableHTML(allSales.slice(0,8));
  }

  /* ---------------- INGRESOS por negocio ---------------- */
  function renderIngresos(){
    var bizData = allBusinessData().sort(function(a,b){ return b.revenue - a.revenue; });
    var html;
    if(!bizData.length){
      html = '<tr><td class="empty-note">Todavía no hay negocios registrados.</td></tr>';
    } else {
      var rows = bizData.map(function(b){
        return '<tr><td>'+b.account.businessName+'</td><td>'+(b.account.ownerName||'—')+'</td><td>'+typeLabel(b.account.type)+'</td><td>'+money(b.revenue)+'</td></tr>';
      }).join('');
      html = '<thead><tr><th>Negocio</th><th>Dueño</th><th>Oficio</th><th>Ingresos generados</th></tr></thead><tbody>'+rows+'</tbody>';
    }
    document.getElementById('revenueTable').innerHTML = html;
  }

  /* ---------------- CLIENTES (negocios registrados) ---------------- */
  function renderClientes(){
    var accounts = getAccounts();
    var html = accounts.map(function(acc, i){
      var initials = (acc.businessName||'?').split(' ').map(function(w){return w[0];}).slice(0,2).join('');
      return '<div class="item-card client-card" style="animation-delay:'+(i*0.02)+'s; cursor:default; position:relative;">'+
        '<button class="del-biz-btn" data-id="'+acc.id+'" data-name="'+acc.businessName+'" title="Eliminar negocio" '+
          'style="position:absolute;top:14px;right:14px;width:26px;height:26px;border-radius:50%;background:rgba(232,95,168,.14);color:#E85FA8;font-size:.85rem;line-height:1;cursor:pointer;">✕</button>'+
        '<div class="row1"><div style="display:flex;align-items:center;gap:10px;"><div class="avatar">'+initials+'</div>'+
        '<div><div class="name" style="margin-bottom:0;">'+acc.businessName+'</div><div class="meta" style="margin-top:2px;"><span>'+(acc.ownerName||'—')+'</span></div></div></div></div>'+
        '<div class="meta" style="margin-top:12px;"><span>Oficio</span><span class="price">'+typeLabel(acc.type)+'</span></div>'+
        '<div class="meta" style="margin-top:6px;"><span>Correo</span><span>'+acc.email+'</span></div>'+
        '<div class="meta" style="margin-top:6px;"><span>Registrado</span><span>'+(acc.createdAt||'').slice(0,10)+'</span></div>'+
      '</div>';
    }).join('');
    if(!accounts.length){
      html = '<div class="empty-note">Todavía no se registró ningún negocio en la plataforma.</div>';
    }
    document.getElementById('businessGrid').innerHTML = html;
    document.querySelectorAll('.del-biz-btn').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var id = btn.getAttribute('data-id');
        var name = btn.getAttribute('data-name');
        if(!confirm('¿Eliminar "'+name+'" de la plataforma? Se borran también sus productos, ventas, clientes y pedidos. Esta acción no se puede deshacer.')) return;
        deleteBusiness(id).then(function(ok){
          if(!ok) return;
          toast('Negocio eliminado');
          renderClientes();
        });
      });
    });
  }

  /* ---------------- PEDIDOS ---------------- */
  function renderPedidos(){
    var orders = getOrders();
    var html;
    if(!orders.length){
      html = '<tr><td class="empty-note">Todavía no hay pedidos — se registran cuando un negocio le compra a un proveedor.</td></tr>';
    } else {
      var today = todayISO();
      var rows = orders.map(function(o){
        var itemsTxt = o.itemsText;
        var delivered = o.arrivalDate <= today;
        var daysLeft = delivered ? 0 : Math.ceil((new Date(o.arrivalDate) - new Date(today)) / 86400000);
        var statusTxt = delivered ? 'Entregado' : 'En camino';
        return '<tr><td>'+o.businessName+'</td><td>'+itemsTxt+'</td><td>'+money(o.total)+'</td><td>'+o.date+'</td>'+
          '<td>'+(delivered?'Llegó':daysLeft+' día'+(daysLeft===1?'':'s'))+'</td>'+
          '<td><span class="pill-status '+(delivered?'pagado':'pendiente')+'">'+statusTxt+'</span></td></tr>';
      }).join('');
      html = '<thead><tr><th>Negocio</th><th>Productos</th><th>Total</th><th>Fecha pedido</th><th>Llega en</th><th>Estado</th></tr></thead><tbody>'+rows+'</tbody>';
    }
    document.getElementById('ordersTable').innerHTML = html;
  }

  /* ---------------- render dispatcher ---------------- */
  function renderAll(){
    var activeView = document.querySelector('.view.active');
    if(!activeView) return;
    var id = activeView.id;
    if(id === 'view-resumen') renderResumen();
    else if(id === 'view-ingresos') renderIngresos();
    else if(id === 'view-clientes') renderClientes();
    else if(id === 'view-pedidos') renderPedidos();
  }

  /* ---------------- init ---------------- */
  function boot(){
    safe(initTheme, 'theme');
    refresh().then(function(){
      safe(initNav, 'nav');
      safe(renderResumen, 'resumen');
    }).catch(function(err){ console.warn('[InnovaSistem superadmin] boot', err); });
  }

  safe(boot, 'boot');
})();
