const loading=document.querySelector('#loading');
const message=document.querySelector('#loading-message');
const retry=document.querySelector('#retry');
retry.addEventListener('click',()=>location.reload());
try{
  await new Promise(requestAnimationFrame);
  await import('./escuela-viewer.js?v=20261031-aula-patio');
  await window.__escuela.ready;
  if(new URLSearchParams(location.search).get("vista")==="manzana")document.querySelector("#block").click();
  await new Promise(requestAnimationFrame);
  loading.hidden=true;
  document.body.dataset.ready='true';
}catch(error){
  console.error('No se pudo iniciar el recorrido.',error);
  document.querySelector('.spinner').hidden=true;
  document.querySelector('.loading h2').textContent='No pudimos abrir el recorrido';
  message.textContent='Probá con Chrome, Edge, Firefox o Safari actualizados y la aceleración gráfica activada.';
  retry.hidden=false;
  document.body.dataset.ready='error';
}
