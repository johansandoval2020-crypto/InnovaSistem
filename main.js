(function(){
  "use strict";

  function safe(fn, name){
    try{ fn(); }catch(err){ console.warn('[InnovaSistem] init failed:', name, err); }
  }

  function initSplash(){
    var splash = document.getElementById('splash');
    if(!splash) return;
    window.addEventListener('load', function(){
      setTimeout(function(){ splash.style.display = 'none'; }, 900);
    });
    setTimeout(function(){ if(splash) splash.style.display = 'none'; }, 4600);
  }

  function initNav(){
    var nav = document.getElementById('nav');
    var burger = document.getElementById('burger');
    var menu = document.getElementById('mobileMenu');
    if(nav){
      window.addEventListener('scroll', function(){
        if(window.scrollY > 40) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      }, {passive:true});
    }
    if(burger && menu){
      burger.addEventListener('click', function(){
        menu.hidden = !menu.hidden;
      });
      menu.querySelectorAll('a').forEach(function(a){
        a.addEventListener('click', function(){ menu.hidden = true; });
      });
    }
  }

  function initReveal(){
    var items = document.querySelectorAll('.reveal');
    if(!items.length) return;
    var seen = new WeakSet();
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          e.target.classList.add('is-visible');
          seen.add(e.target);
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.05, rootMargin:'0px 0px -40px 0px'});
    items.forEach(function(el){
      // reveal what's already on screen right away (IO can miss it on some phones)
      var r = el.getBoundingClientRect();
      if(r.top < window.innerHeight && r.bottom > 0){
        el.classList.add('is-visible');
        seen.add(el);
      } else {
        io.observe(el);
      }
    });

    // 6s safety net: reveal anything IO missed (hidden iframes, timing races)
    setTimeout(function(){
      items.forEach(function(el){
        if(!seen.has(el)) el.classList.add('is-visible');
      });
    }, 6000);
  }

  function initCounters(){
    var counters = document.querySelectorAll('[data-count]');
    if(!counters.length) return;
    var done = new WeakSet();
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting && !done.has(e.target)){
          done.add(e.target);
          animateCount(e.target);
          io.unobserve(e.target);
        }
      });
    }, {threshold:0.2});
    counters.forEach(function(el){ io.observe(el); });

    function animateCount(el){
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      var start = 0, duration = 1200, startTime = null;
      function step(ts){
        if(!startTime) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (target - start) * eased);
        if(progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
    }
  }


  function initParallaxLeaves(){
    var leaves = document.querySelectorAll('.hero-leaf');
    if(!leaves.length) return;
    var hero = document.querySelector('.hero');
    if(!hero) return;
    hero.addEventListener('mousemove', function(e){
      var rect = hero.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      leaves.forEach(function(leaf, i){
        var depth = (i + 1) * 10;
        leaf.style.transform = 'translate(' + (x*depth) + 'px,' + (y*depth) + 'px)';
      });
    });
  }

  function initSmoothAnchors(){
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var id = a.getAttribute('href').slice(1);
        var target = id ? document.getElementById(id) : null;
        if(target){
          e.preventDefault();
          window.scrollTo({top: target.offsetTop - 90, behavior:'smooth'});
        }
      });
    });
  }

  safe(initSplash, 'splash');
  safe(initNav, 'nav');
  safe(initReveal, 'reveal');
  safe(initCounters, 'counters');
  safe(initParallaxLeaves, 'parallax');
  safe(initSmoothAnchors, 'anchors');
})();
