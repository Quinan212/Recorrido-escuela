const loading=document.querySelector('#loading');
const message=document.querySelector('#loading-message');
const retry=document.querySelector('#retry');
retry.addEventListener('click',()=>location.reload());
try{
  await new Promise(requestAnimationFrame);
  await import('./escuela-viewer.js?v=20261031-luz-blender');
  await window.__escuela.ready;
  const vista=new URLSearchParams(location.search).get('vista');
  if(vista==='manzana')document.querySelector('#block').click();
  else if(vista==='aula')document.querySelector('#classroom').click();
  else if(vista==='patio')window.__escuela.caminarDesde(11.75,10.5,0);
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
