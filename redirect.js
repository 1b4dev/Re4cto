(function() {
  var pathSegmentsToKeep = 1;
  var l = window.location;
  l.replace(
    l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
    l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
    l.pathname.split('/').slice(1 + pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
    (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
    l.hash
  );
 })();
 EOL
 sed -i '/<head>/a <script src="redirect.js"></script>' index.html
 cat > 404.html << 'EOL'
 <!DOCTYPE html>
 <html>
   <head>
     <meta charset="utf-8">
     <script>
       sessionStorage.redirect = location.href;
     </script>
     <meta http-equiv="refresh" content="0;URL='/'">
   </head>
   <body></body>
 </html>
 EOL
 sed -i '/<head>/a <script>if (sessionStorage.redirect) { window.history.replaceState(null, null, sessionStorage.redirect); delete sessionStorage.redirect; }</script>' index.html
