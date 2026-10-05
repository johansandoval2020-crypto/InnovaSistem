/* ==========================================================================
   InnovaSistem — llamadas a la API PHP (/api/*.php)
   innovaApi('negocio.php')                 → GET
   innovaApi('ventas.php', {client, ...})   → POST con JSON
   Devuelve una promesa con {ok, status, data}.
   ========================================================================== */
(function(){
  "use strict";

  window.innovaApi = function(file, body){
    var opts = {credentials:'same-origin', headers:{'Accept':'application/json'}};
    if(body !== undefined){
      opts.method = 'POST';
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    return fetch('api/' + file, opts).then(function(res){
      return res.json().catch(function(){ return {}; }).then(function(data){
        return {ok: res.ok, status: res.status, data: data};
      });
    }).catch(function(){
      return {ok:false, status:0, data:{error:'No se pudo conectar con el servidor. ¿Está encendido Apache en XAMPP?'}};
    });
  };
})();
