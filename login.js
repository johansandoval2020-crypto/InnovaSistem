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
        sub.textContent = isLogin ? 'Entrá a tu panel y seguí el control de tu negocio.' : 'Elegí tu rubro y armamos tu panel al instante.';
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

  function initTypeSelect(){
    var cards = document.querySelectorAll('.type-card');
    cards.forEach(function(card){
      card.addEventListener('click', function(){
        cards.forEach(function(c){ c.classList.remove('selected'); });
        card.classList.add('selected');
      });
    });
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
      var selected = document.querySelector('.type-card.selected');
      if(!selected){
        showMsg('Elegí qué tipo de negocio es antes de continuar.', 'err');
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
        type: selected.getAttribute('data-type'),
        createdAt: new Date().toISOString()
      };
      accounts.push(account);
      saveAccounts(accounts);
      panelRegister.reset();
      document.querySelectorAll('.type-card').forEach(function(c){ c.classList.remove('selected'); });
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
