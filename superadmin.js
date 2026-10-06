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

  /* ---------------- CORREO (solo admin24) ---------------- */
  var MAIL = {mails:[], unread:0};
  var mailFilter = 'todos';
  var mailOpen = null;
  var MAIL_TYPES = {
    negocio:  {label:'Negocio nuevo', icon:'<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>'},
    consulta: {label:'Consulta',      icon:'<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3"/><path d="M12 16.5h.01"/>'},
    proveedor:{label:'Proveedor',     icon:'<path d="M2 7h11v9H2z"/><path d="M13 10h4l3 3v3h-7"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>'},
    pedido:   {label:'Pedido',        icon:'<path d="M3 8l9-5 9 5-9 5-9-5Z"/><path d="M3 8v9l9 5 9-5V8"/><path d="M12 13v9"/>'}
  };
  function esc(v){
    return String(v == null ? '' : v).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function mailDate(d){
    var day = d.slice(0,10), hour = d.slice(11,16);
    return day === todayISO() ? hour : day.slice(8,10) + '/' + day.slice(5,7) + ' ' + hour;
  }

  function loadMail(){
    return window.innovaApi('correo.php').then(function(r){
      if(!r.ok) return;
      MAIL = r.data;
      var badge = document.getElementById('mailBadge');
      badge.textContent = MAIL.unread > 99 ? '99+' : MAIL.unread;
      badge.hidden = MAIL.unread === 0;
    });
  }
  function mailAct(body, msg){
    return window.innovaApi('correo.php', body).then(function(r){
      if(!r.ok){ toast(r.data.error || 'No se pudo guardar'); return false; }
      if(msg) toast(msg);
      return loadMail().then(function(){ return true; });
    });
  }

  function renderCorreo(){
    var list = MAIL.mails.filter(function(m){
      if(mailFilter === 'todos') return true;
      if(mailFilter === 'sin-leer') return !m.read;
      return m.type === mailFilter;
    });
    var box = document.getElementById('mailList');
    if(!list.length){
      box.innerHTML = '<div class="empty-note">'+(MAIL.mails.length ? 'No hay correos en este filtro.' : 'Tu bandeja está vacía. Acá van a llegar los negocios nuevos, las consultas, los avisos de proveedores y los pedidos.')+'</div>';
    } else {
      box.innerHTML = list.map(function(m){
        var t = MAIL_TYPES[m.type] || MAIL_TYPES.negocio;
        var open = mailOpen === m.id;
        var extra = '';
        if(m.type === 'proveedor'){
          extra += '<div class="mail-used"><b>Negocios que usan a '+esc(m.provider)+':</b> '+
            (m.usedBy.length ? m.usedBy.map(esc).join(', ') : 'ninguno por ahora')+'</div>';
        }
        if(m.type === 'consulta'){
          extra += m.reply
            ? '<div class="mail-reply"><div class="mail-reply-head">Tu respuesta · '+esc(mailDate(m.replyDate))+'</div>'+esc(m.reply)+'</div>'
            : '<form class="mail-reply-form" data-reply="'+m.id+'"><label class="mail-reply-label">Tu respuesta</label><textarea name="text" rows="3" required maxlength="3000"></textarea>'+
              '<button class="save-btn" type="submit">Responder</button></form>';
        }
        return '<div class="mail-item'+(m.read ? '' : ' unread')+(open ? ' open' : '')+'" data-id="'+m.id+'">'+
          '<button type="button" class="mail-row" data-toggle="'+m.id+'">'+
            '<span class="mail-ico t-'+m.type+'"><svg viewBox="0 0 24 24">'+t.icon+'</svg></span>'+
            '<span class="mail-main"><span class="mail-from">'+esc(m.from)+'</span>'+
              '<span class="mail-subject">'+esc(m.subject)+'</span></span>'+
            '<span class="mail-meta"><span class="mail-tag t-'+m.type+'">'+t.label+'</span><span class="mail-date">'+esc(mailDate(m.date))+'</span></span>'+
          '</button>'+
          (open ?
            '<div class="mail-body">'+
              (m.business ? '<div class="mail-biz">Negocio: <b>'+esc(m.business)+'</b></div>' : '')+
              '<div class="mail-text">'+esc(m.body)+'</div>'+extra+
              '<div class="mail-actions">'+
                (m.type === 'proveedor' && m.usedBy.length ? '<button type="button" class="link-btn" data-notify="'+esc(m.provider)+'">Avisar a los negocios que lo usan</button>' : '')+
                '<button type="button" class="link-btn" data-unread="'+m.id+'">Marcar como no leído</button>'+
                '<button type="button" class="link-btn danger" data-del-mail="'+m.id+'">Eliminar</button>'+
              '</div>'+
            '</div>' : '')+
        '</div>';
      }).join('');
    }

    box.querySelectorAll('[data-toggle]').forEach(function(btn){
      btn.onclick = function(){
        var id = btn.getAttribute('data-toggle');
        var m = MAIL.mails.find(function(x){ return x.id === id; });
        mailOpen = mailOpen === id ? null : id;
        if(mailOpen && !m.read){ mailAct({action:'read', id:id, read:true}).then(renderCorreo); }
        else renderCorreo();
      };
    });
    box.querySelectorAll('[data-unread]').forEach(function(btn){
      btn.onclick = function(){
        var id = btn.getAttribute('data-unread');
        mailOpen = null;
        mailAct({action:'read', id:id, read:false}).then(renderCorreo);
      };
    });
    box.querySelectorAll('[data-del-mail]').forEach(function(btn){
      btn.onclick = function(){
        if(!confirm('¿Eliminar este correo?')) return;
        mailOpen = null;
        mailAct({action:'delete', id:btn.getAttribute('data-del-mail')}, 'Correo eliminado').then(renderCorreo);
      };
    });
    box.querySelectorAll('[data-reply]').forEach(function(form){
      form.onsubmit = function(e){
        e.preventDefault();
        mailAct({action:'reply', id:form.getAttribute('data-reply'), text:form.text.value}, 'Respuesta enviada al negocio').then(renderCorreo);
      };
    });

    document.querySelectorAll('#mailChips .chip').forEach(function(chip){
      chip.classList.toggle('active', chip.getAttribute('data-filter') === mailFilter);
      chip.onclick = function(){ mailFilter = chip.getAttribute('data-filter'); mailOpen = null; renderCorreo(); };
    });
    box.querySelectorAll('[data-notify]').forEach(function(btn){
      btn.onclick = function(){ openNotice('provider', btn.getAttribute('data-notify')); };
    });
    initNotice();

    document.getElementById('mailReadAll').onclick = function(){
      mailAct({action:'read_all'}, 'Todo marcado como leído').then(renderCorreo);
    };
  }

  // Aviso para los negocios: todos, los que usan un proveedor, o uno solo.
  function initNotice(){
    var form = document.getElementById('noticeForm');
    if(form._ready) return;
    form._ready = true;
    var target = document.getElementById('noticeTarget');
    function sync(){
      document.getElementById('noticeProviderField').hidden = target.value !== 'provider';
      document.getElementById('noticeBusinessField').hidden = target.value !== 'business';
    }
    target.onchange = sync;
    document.getElementById('noticeOpen').onclick = function(){ openNotice('all'); };
    document.getElementById('noticeCancel').onclick = function(){ document.getElementById('noticeBox').hidden = true; };
    form.onsubmit = function(e){
      e.preventDefault();
      window.innovaApi('correo.php', {
        action:'notice', target:target.value, provider:form.provider.value, business:form.business.value,
        subject:form.subject.value, text:form.text.value
      }).then(function(r){
        if(!r.ok){ toast(r.data.error || 'No se pudo enviar'); return; }
        toast('Aviso enviado a ' + r.data.sent + (r.data.sent === 1 ? ' negocio' : ' negocios'));
        form.reset(); sync();
        document.getElementById('noticeBox').hidden = true;
      });
    };
    form._sync = sync;
  }
  function openNotice(target, provider){
    initNotice();
    var form = document.getElementById('noticeForm');
    document.getElementById('noticeProvider').innerHTML = (MAIL.providers || []).map(function(p){
      return '<option value="'+esc(p)+'">'+esc(p)+'</option>';
    }).join('') || '<option value="">(ningún negocio tiene proveedores)</option>';
    document.getElementById('noticeBusiness').innerHTML = DATA.businesses.map(function(b){
      return '<option value="'+b.id+'">'+esc(b.businessName)+'</option>';
    }).join('');
    form.target.value = target;
    if(provider) form.provider.value = provider;
    form._sync();
    var box = document.getElementById('noticeBox');
    box.hidden = false;
    box.scrollIntoView({behavior:'smooth', block:'start'});
    form.subject.focus();
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
    else if(id === 'view-correo') loadMail().then(renderCorreo);
  }

  /* ---------------- init ---------------- */
  function boot(){
    refresh().then(function(){
      safe(initNav, 'nav');
      safe(renderResumen, 'resumen');
      // contador de correos sin leer (se actualiza cada minuto)
      loadMail();
      setInterval(function(){
        loadMail().then(function(){
          var active = document.querySelector('.view.active');
          if(active && active.id === 'view-correo' && !mailOpen) renderCorreo();
        });
      }, 60000);
    }).catch(function(err){ console.warn('[InnovaSistem superadmin] boot', err); });
  }

  safe(boot, 'boot');
})();
