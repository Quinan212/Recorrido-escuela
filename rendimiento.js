export function crearMonitorRendimiento({renderer,gpu}){
 const help=document.querySelector('.help');
 const toggle=document.createElement('button');toggle.id='performance-toggle';toggle.className='performance-toggle';
 toggle.textContent='Rendimiento';toggle.setAttribute('aria-controls','performance-panel');
 help.append(toggle);
 const panel=document.createElement('aside');panel.id='performance-panel';panel.className='performance-panel';
 panel.setAttribute('aria-label','Medición de rendimiento');
 panel.innerHTML='<header><strong>Rendimiento</strong><button aria-label="Cerrar medición">×</button></header><div class="fps-value">Midiendo…</div><div class="gpu-value"></div><dl><dt>Resolución</dt><dd class="resolution-value"></dd><dt>Llamadas de dibujo</dt><dd class="calls-value"></dd></dl><p>Mové la cámara para medir · Tecla P</p>';
 document.body.append(panel);
 const fullName=gpu.match(/NVIDIA GeForce[^()]+|AMD Radeon[^()]+|Intel[^,]+/)?.[0]?.trim()||gpu;
 panel.querySelector('.gpu-value').textContent=fullName;panel.querySelector('.gpu-value').title=gpu;
 const data={gpu,fps:null,drawCalls:0,renderMs:0,resolution:[]};
 const history=[];let lastUpdate=0,lastFrame=-Infinity;
 function visible(show){panel.hidden=!show;toggle.setAttribute('aria-pressed',String(show))}
 visible(new URLSearchParams(location.search).get('rendimiento')==='1');
 toggle.onclick=()=>visible(panel.hidden);
 panel.querySelector('button').onclick=()=>visible(false);
 window.addEventListener('keydown',e=>{
  if(e.code==='KeyP'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.closest?.('input,textarea,select,[contenteditable="true"]')){e.preventDefault();visible(panel.hidden)}
 });
 function frame(now,{calls,renderMs}){
  lastFrame=now;history.push(now);while(history.length>2&&history[0]<now-1000)history.shift();
  data.drawCalls=calls;data.renderMs=renderMs;data.resolution=[renderer.domElement.width,renderer.domElement.height];
 }
 function tick(now){
  if(panel.hidden||now-lastUpdate<250)return;lastUpdate=now;
  const moving=now-lastFrame<350;
  data.fps=moving&&history.length>2?(history.length-1)*1000/(history.at(-1)-history[0]):null;
  panel.querySelector('.fps-value').textContent=!moving?'En reposo':data.fps?Math.round(data.fps)+' FPS':'Midiendo…';
  panel.dataset.fps=data.fps?.toFixed(1)||'idle';panel.dataset.gpu=fullName;
  panel.querySelector('.resolution-value').textContent=data.resolution.join(' × ');
  panel.querySelector('.calls-value').textContent=data.drawCalls.toLocaleString('es-AR');
 }
 return {frame,tick,data,visible};
}
