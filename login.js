(function(){
  "use strict";

  var ADMIN_EMAIL = 'admin24@gmail.com';

  function safe(fn, name){ try{ fn(); }catch(err){ console.warn('[InnovaSistem]', name, err); } }
  function uid(prefix){ return prefix + '-' + Math.random().toString(36).slice(2,9); }

  function getAccounts(){
    var raw = localStorage.getItem('innova_accounts');
    return raw ? JSON.parse(raw) : [];
  }
  function saveAccounts(list){
    localStorage.setItem('innova_accounts', JSON.stringify(list));
  }

  function initTabs(){
    var tabLogin = document.getElementById('tabLogin');
    var tabRegister = document.getElementById('tabRegister');
    var panelLogin = document.getElementById('panelLogin');
    var panelRegister = document.getElementById('panelRegister');
    var panelAdminLogin = document.getElementById('panelAdminLogin');
    var heading = document.getElementById('heading');
    var sub = document.getElementById('subheading');
    var msg = document.getElementById('formMsg');

    function show(which){
      var isLogin = which === 'login';
      var isAdmin = which === 'adminLogin';
      tabLogin.classList.toggle('active', isLogin || isAdmin);
      tabRegister.classList.toggle('active', which === 'register');
      panelLogin.classList.toggle('active', isLogin);
      panelRegister.classList.toggle('active', which === 'register');
      panelAdminLogin.classList.toggle('active', isAdmin);
      if(isAdmin){
        heading.textContent = 'Acceso administrador';
        sub.textContent = 'Solo para el equipo de InnovaSistem.';
      } else {
        heading.textContent = isLogin ? 'Bienvenido de nuevo' : 'Creá tu negocio';
        sub.textContent = isLogin ? 'Entrá a tu panel y seguí el control de tu negocio.' : 'Elegí tu oficio y armamos tu panel al instante.';
      }
      msg.classList.remove('show');
    }

    tabLogin.addEventListener('click', function(){ show('login'); });
    tabRegister.addEventListener('click', function(){ show('register'); });
    document.querySelectorAll('[data-goto]').forEach(function(btn){
      btn.addEventListener('click', function(){ show(btn.getAttribute('data-goto')); });
    });
    document.getElementById('gotoAdminLogin').addEventListener('click', function(){ show('adminLogin'); });
    document.getElementById('backFromAdminLogin').addEventListener('click', function(){ show('login'); });

    if(window.location.hash === '#crear') show('register');

    window.__innovaShowLoginTab = show;
  }

  /* ---------------- buscador de oficios ----------------
     Filtra window.INNOVA_DATA.businessTypes (data.js) agrupados por
     categoría. Lo elegido va al input oculto #typeValue; si el oficio no
     está en la lista se guarda como 'otro:<texto>'. */
  function normalize(str){
    return str.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function escapeHtml(str){
    return str.replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function initTypeSelect(){
    var search = document.getElementById('typeSearch');
    var value = document.getElementById('typeValue');
    var list = document.getElementById('typeList');
    var types = window.INNOVA_DATA.businessTypes;
    var activeIdx = -1;

    function options(){ return list.querySelectorAll('.type-opt'); }

    function render(){
      var q = normalize(search.value.trim());
      var html = '';
      var lastCat = null;
      var count = 0;
      types.forEach(function(t){
        if(q && normalize(t.label).indexOf(q) === -1 && normalize(t.categoryLabel).indexOf(q) === -1) return;
        if(t.category !== lastCat){
          html += '<div class="type-group">'+t.categoryLabel+'</div>';
          lastCat = t.category;
        }
        html += '<div class="type-opt" role="option" data-id="'+t.id+'" data-label="'+escapeHtml(t.label)+'">'+t.label+'</div>';
        count++;
      });
      var typed = search.value.trim();
      if(typed){
        html += '<div class="type-group">¿No está tu oficio?</div>'+
          '<div class="type-opt type-other" role="option" data-id="otro:'+escapeHtml(typed)+'" data-label="'+escapeHtml(typed)+'">Usar “'+escapeHtml(typed)+'” como mi tipo de negocio</div>';
      }
      if(!count && !typed) html = '<div class="type-empty">No hay resultados</div>';
      list.innerHTML = html;
      activeIdx = -1;
    }

    function open(){ render(); list.hidden = false; search.setAttribute('aria-expanded','true'); }
    function close(){ list.hidden = true; search.setAttribute('aria-expanded','false'); }

    function pick(opt){
      value.value = opt.getAttribute('data-id');
      search.value = opt.getAttribute('data-label');
      search.classList.add('picked');
      close();
    }

    function highlight(i){
      var opts = options();
      if(!opts.length) return;
      activeIdx = (i + opts.length) % opts.length;
      opts.forEach(function(o, j){ o.classList.toggle('active', j === activeIdx); });
      opts[activeIdx].scrollIntoView({block:'nearest'});
    }

    search.addEventListener('focus', open);
    search.addEventListener('input', function(){
      value.value = '';
      search.classList.remove('picked');
      open();
    });
    search.addEventListener('keydown', function(e){
      if(list.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')){ open(); }
      if(e.key === 'ArrowDown'){ e.preventDefault(); highlight(activeIdx + 1); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); highlight(activeIdx - 1); }
      else if(e.key === 'Enter' && !list.hidden){
        var opts = options();
        if(activeIdx >= 0 && opts[activeIdx]){ e.preventDefault(); pick(opts[activeIdx]); }
      }
      else if(e.key === 'Escape'){ close(); }
    });
    // mousedown (no click) para elegir antes de que el input pierda el foco
    list.addEventListener('mousedown', function(e){
      var opt = e.target.closest('.type-opt');
      if(!opt) return;
      e.preventDefault();
      pick(opt);
    });
    search.addEventListener('blur', close);
  }

  function resetTypeSelect(){
    document.getElementById('typeSearch').value = '';
    document.getElementById('typeSearch').classList.remove('picked');
    document.getElementById('typeValue').value = '';
  }

  function showMsg(text, kind){
    var msg = document.getElementById('formMsg');
    msg.textContent = text;
    msg.className = 'form-msg show ' + kind;
  }

  function initForms(){
    var panelLogin = document.getElementById('panelLogin');
    var panelRegister = document.getElementById('panelRegister');
    var panelAdminLogin = document.getElementById('panelAdminLogin');

    panelRegister.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(panelRegister);
      var type = fd.get('type');
      if(!type){
        showMsg('Buscá y elegí qué tipo de negocio es antes de continuar.', 'err');
        document.getElementById('typeSearch').focus();
        return;
      }
      var email = fd.get('email').trim().toLowerCase();
      var accounts = getAccounts();
      if(accounts.some(function(a){ return a.email.toLowerCase() === email; })){
        showMsg('Ya existe una cuenta con ese correo. Iniciá sesión.', 'err');
        return;
      }
      var account = {
        id: uid('biz'),
        businessName: fd.get('businessName'),
        ownerName: fd.get('ownerName'),
        email: fd.get('email'),
        password: fd.get('password'),
        type: type,
        createdAt: new Date().toISOString()
      };
      accounts.push(account);
      saveAccounts(accounts);
      panelRegister.reset();
      resetTypeSelect();
      window.__innovaShowLoginTab('login');
      showMsg('¡Cuenta creada! Iniciá sesión con tu correo y contraseña para entrar a tu panel.', 'ok');
    });

    panelLogin.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(panelLogin);
      var email = fd.get('email').trim().toLowerCase();
      var password = fd.get('password');
      var accounts = getAccounts();
      var match = accounts.find(function(a){ return a.email.toLowerCase() === email && a.password === password; });
      if(!match){
        showMsg('Correo o contraseña incorrectos, o todavía no creaste tu cuenta.', 'err');
        return;
      }
      localStorage.removeItem('innova_admin_session');
      localStorage.setItem('innova_account', JSON.stringify(match));
      showMsg('Bienvenido de nuevo. Entrando a tu panel…', 'ok');
      setTimeout(function(){ window.location.href = 'admin.html'; }, 600);
    });

    panelAdminLogin.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(panelAdminLogin);
      var email = fd.get('email').trim().toLowerCase();
      if(email !== ADMIN_EMAIL){
        showMsg('Ese correo no tiene acceso de administrador.', 'err');
        return;
      }
      localStorage.setItem('innova_admin_session', '1');
      showMsg('Acceso concedido. Entrando al panel de administración…', 'ok');
      setTimeout(function(){ window.location.href = 'superadmin.html'; }, 600);
    });
  }

  safe(initTabs, 'tabs');
  safe(initTypeSelect, 'typeSelect');
  safe(initForms, 'forms');
})();
