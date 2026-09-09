(function(){
  "use strict";

  function safe(fn, name){ try{ fn(); }catch(err){ console.warn('[InnovaSistem]', name, err); } }

  function initPetals(){
    var wrap = document.getElementById('petals');
    if(!wrap) return;
    var n = 16;
    for(var i=0;i<n;i++){
      var p = document.createElement('div');
      p.className = 'petal';
      var size = 6 + Math.random()*8;
      p.style.width = size+'px';
      p.style.height = size+'px';
      p.style.left = (Math.random()*100)+'vw';
      p.style.animationDuration = (8+Math.random()*10)+'s';
      p.style.animationDelay = (Math.random()*10)+'s';
      wrap.appendChild(p);
    }
  }

  function initTabs(){
    var tabLogin = document.getElementById('tabLogin');
    var tabRegister = document.getElementById('tabRegister');
    var panelLogin = document.getElementById('panelLogin');
    var panelRegister = document.getElementById('panelRegister');
    var heading = document.getElementById('heading');
    var sub = document.getElementById('subheading');
    var msg = document.getElementById('formMsg');

    function show(which){
      var isLogin = which === 'login';
      tabLogin.classList.toggle('active', isLogin);
      tabRegister.classList.toggle('active', !isLogin);
      panelLogin.classList.toggle('active', isLogin);
      panelRegister.classList.toggle('active', !isLogin);
      heading.textContent = isLogin ? 'Bienvenido de nuevo' : 'Creá tu negocio';
      sub.textContent = isLogin ? 'Entrá a tu panel y seguí el control de tu negocio.' : 'Elegí tu rubro y armamos tu panel al instante.';
      msg.classList.remove('show');
    }

    tabLogin.addEventListener('click', function(){ show('login'); });
    tabRegister.addEventListener('click', function(){ show('register'); });
    document.querySelectorAll('[data-goto]').forEach(function(btn){
      btn.addEventListener('click', function(){ show(btn.getAttribute('data-goto')); });
    });

    if(window.location.hash === '#crear') show('register');
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

    panelRegister.addEventListener('submit', function(e){
      e.preventDefault();
      var fd = new FormData(panelRegister);
      var selected = document.querySelector('.type-card.selected');
      if(!selected){
        showMsg('Elegí qué tipo de negocio es antes de continuar.', 'err');
        return;
      }
      var account = {
        businessName: fd.get('businessName'),
        ownerName: fd.get('ownerName'),
        email: fd.get('email'),
        type: selected.getAttribute('data-type'),
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('innova_account', JSON.stringify(account));
      localStorage.removeItem('innova_business_' + account.type); // fresh seed on new account
      showMsg('¡Cuenta creada! Entrando a tu panel…', 'ok');
      setTimeout(function(){ window.location.href = 'admin.html'; }, 700);
    });

    panelLogin.addEventListener('submit', function(e){
      e.preventDefault();
      var raw = localStorage.getItem('innova_account');
      if(!raw){
        showMsg('No encontramos una cuenta todavía. Creá una primero.', 'err');
        return;
      }
      showMsg('Bienvenido de nuevo. Entrando a tu panel…', 'ok');
      setTimeout(function(){ window.location.href = 'admin.html'; }, 600);
    });
  }

  safe(initPetals, 'petals');
  safe(initTabs, 'tabs');
  safe(initTypeSelect, 'typeSelect');
  safe(initForms, 'forms');
})();
