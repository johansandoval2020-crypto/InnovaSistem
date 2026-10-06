/* ==========================================================================
   InnovaSistem — ajustes (tuerca): tema claro/oscuro, zoom e idioma.

   Se carga en el <head> de todas las páginas (sin defer) para aplicar el
   tema, el zoom y el idioma guardados antes de que se pinte la página.
   - Tema:   localStorage 'innova_theme' ('light' | 'dark'). Si nunca se
             eligió, usa el atributo data-default-theme del <html>.
   - Zoom:   localStorage 'innova_zoom' (porcentaje, 80–150).
   - Idioma: localStorage 'innova_lang' ('es' | 'en'). La traducción usa el
             diccionario de i18n.js (window.INNOVA_I18N) y traduce también
             lo que los paneles pintan después (MutationObserver).
   El botón se monta dentro de [data-ajustes-slot] si la página tiene uno;
   si no, queda fijo arriba a la derecha.
   ========================================================================== */
(function(){
  "use strict";

  var root = document.documentElement;
  var ZOOMS = [80, 90, 100, 110, 125, 150];

  function load(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function save(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

  var state = {
    theme: load('innova_theme') || root.getAttribute('data-default-theme') || 'light',
    zoom: parseInt(load('innova_zoom'), 10) || 100,
    lang: load('innova_lang') === 'en' ? 'en' : 'es'
  };
  if(ZOOMS.indexOf(state.zoom) === -1) state.zoom = 100;

  function applyTheme(){ root.setAttribute('data-theme', state.theme); }
  function applyZoom(){ root.style.zoom = state.zoom === 100 ? '' : String(state.zoom / 100); }
  applyTheme();
  applyZoom();
  root.setAttribute('lang', state.lang);

  /* ---------------- traducción ---------------- */
  var original = new WeakMap();      // nodo de texto → texto en español
  var originalAttr = new WeakMap();  // elemento → {atributo: texto en español}
  var ATTRS = ['placeholder', 'title', 'aria-label'];
  var observer = null;

  function translate(text){
    var dict = window.INNOVA_I18N || {strings:{}, patterns:[]};
    var key = text.replace(/\s+/g, ' ').trim();
    if(!key) return null;
    var out = dict.strings[key];
    if(out === undefined){
      for(var i = 0; i < dict.patterns.length; i++){
        var p = dict.patterns[i];
        if(p[0].test(key)){ out = key.replace(p[0], p[1]); break; }
      }
    }
    if(out === undefined) return null;
    // conserva los espacios de los costados del nodo original
    var lead = text.match(/^\s*/)[0], trail = text.match(/\s*$/)[0];
    return lead + out + trail;
  }

  function skip(node){
    var p = node.parentNode;
    return !p || /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p.nodeName) || (p.closest && p.closest('[data-no-i18n]'));
  }

  function doText(node){
    if(skip(node)) return;
    if(state.lang === 'en'){
      var src = original.has(node) ? original.get(node) : node.nodeValue;
      var out = translate(src);
      if(out !== null){
        if(!original.has(node)) original.set(node, node.nodeValue);
        if(node.nodeValue !== out) node.nodeValue = out;
      }
    } else if(original.has(node)){
      node.nodeValue = original.get(node);
      original.delete(node);
    }
  }

  function doAttrs(el){
    ATTRS.forEach(function(a){
      if(!el.hasAttribute(a)) return;
      var saved = originalAttr.get(el) || {};
      if(state.lang === 'en'){
        var src = saved[a] !== undefined ? saved[a] : el.getAttribute(a);
        var out = translate(src);
        if(out !== null){
          if(saved[a] === undefined){ saved[a] = el.getAttribute(a); originalAttr.set(el, saved); }
          el.setAttribute(a, out);
        }
      } else if(saved[a] !== undefined){
        el.setAttribute(a, saved[a]);
        delete saved[a];
      }
    });
  }

  function walk(rootNode){
    if(rootNode.nodeType === 3){ doText(rootNode); return; }
    if(rootNode.nodeType !== 1) return;
    doAttrs(rootNode);
    var tw = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    var n;
    while((n = tw.nextNode())){
      if(n.nodeType === 3) doText(n); else doAttrs(n);
    }
  }

  var titleOriginal = null;
  function applyLang(){
    root.setAttribute('lang', state.lang);
    walk(document.body);
    if(titleOriginal === null) titleOriginal = document.title;
    var t = state.lang === 'en' ? translate(titleOriginal) : null;
    document.title = t !== null ? t : titleOriginal;
    if(observer) observer.takeRecords();
  }

  // Lo que los paneles pintan después (tablas, modales, avisos) también se traduce.
  function watch(){
    observer = new MutationObserver(function(muts){
      if(state.lang !== 'en') return;
      muts.forEach(function(m){
        if(m.type === 'characterData'){
          original.delete(m.target);
          doText(m.target);
        } else if(m.type === 'attributes'){
          var saved = originalAttr.get(m.target);
          if(saved) delete saved[m.attributeName];
          doAttrs(m.target);
        } else {
          m.addedNodes.forEach(walk);
        }
      });
      observer.takeRecords();
    });
    observer.observe(document.body, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATTRS});
  }

  /* ---------------- botón + panel ---------------- */
  var GEAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>';
  var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg>';

  function build(){
    var slot = document.querySelector('[data-ajustes-slot]');
    var wrap = document.createElement('div');
    wrap.className = 'aj-wrap' + (slot ? '' : ' aj-fixed');
    wrap.innerHTML =
      '<button type="button" class="aj-gear" aria-haspopup="dialog" aria-expanded="false" aria-label="Ajustes" title="Ajustes">'+GEAR+'</button>'+
      '<div class="aj-panel" role="dialog" aria-label="Ajustes">'+
        '<div class="aj-title">Ajustes</div>'+
        '<div class="aj-row"><span class="aj-label">Tema</span>'+
          '<div class="aj-seg" data-set="theme"><button type="button" data-v="light">'+SUN+'Claro</button><button type="button" data-v="dark">'+MOON+'Oscuro</button></div></div>'+
        '<div class="aj-row"><span class="aj-label">Zoom</span>'+
          '<div class="aj-zoom"><button type="button" data-z="-1" aria-label="Achicar">−</button><output>100%</output>'+
          '<button type="button" data-z="1" aria-label="Agrandar">+</button><button type="button" class="aj-reset" data-z="0">Normal</button></div></div>'+
        '<div class="aj-row"><span class="aj-label">Idioma</span>'+
          '<div class="aj-seg" data-set="lang"><button type="button" data-v="es">Español</button><button type="button" data-v="en">English</button></div></div>'+
      '</div>';
    if(slot) slot.appendChild(wrap); else document.body.appendChild(wrap);

    var gear = wrap.querySelector('.aj-gear');
    var panel = wrap.querySelector('.aj-panel');

    function refresh(){
      wrap.querySelectorAll('[data-set="theme"] button').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-v') === state.theme); });
      wrap.querySelectorAll('[data-set="lang"] button').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-v') === state.lang); });
      var i = ZOOMS.indexOf(state.zoom);
      wrap.querySelector('output').textContent = state.zoom + '%';
      wrap.querySelector('[data-z="-1"]').disabled = i === 0;
      wrap.querySelector('[data-z="1"]').disabled = i === ZOOMS.length - 1;
    }
    function open(v){
      panel.classList.toggle('open', v);
      gear.setAttribute('aria-expanded', v ? 'true' : 'false');
    }

    gear.addEventListener('click', function(e){ e.stopPropagation(); open(!panel.classList.contains('open')); });
    panel.addEventListener('click', function(e){
      e.stopPropagation();
      var b = e.target.closest('button');
      if(!b) return;
      var set = b.parentNode.getAttribute('data-set');
      if(set === 'theme'){ state.theme = b.getAttribute('data-v'); save('innova_theme', state.theme); applyTheme(); }
      else if(set === 'lang'){ state.lang = b.getAttribute('data-v'); save('innova_lang', state.lang); applyLang(); }
      else if(b.hasAttribute('data-z')){
        var step = parseInt(b.getAttribute('data-z'), 10);
        var i = ZOOMS.indexOf(state.zoom);
        state.zoom = step === 0 ? 100 : ZOOMS[Math.min(ZOOMS.length - 1, Math.max(0, i + step))];
        save('innova_zoom', String(state.zoom));
        applyZoom();
      }
      refresh();
    });
    document.addEventListener('click', function(){ open(false); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') open(false); });
    refresh();
  }

  function init(){
    build();
    watch();
    if(state.lang === 'en') applyLang();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
