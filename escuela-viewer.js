import * as T from './vendor/three.module.js';
import {crearEscuela} from './escuela-escena.js?v=20261028-vegetacion';
import {optimizarEstatico} from './optimizar.js';
import {crearEntorno} from './entorno.js';
import {prepararEstiloEscuela,crearRenderConOclusion} from './estilo-escuela.js';
const canvas=document.querySelector('canvas'),renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:false,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.localClippingEnabled=true;renderer.setClearColor('#dce3e2');renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
const gl=renderer.getContext(), debugRenderer=gl.getExtension('WEBGL_debug_renderer_info');canvas.dataset.gpu=debugRenderer?gl.getParameter(debugRenderer.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
let needsRender=true;function invalidate(){needsRender=true}
function crearCielo(){
 const c=document.createElement('canvas');c.width=2048;c.height=1024;const ctx=c.getContext('2d');
 const sky=ctx.createLinearGradient(0,0,0,1024);sky.addColorStop(0,'#719abe');sky.addColorStop(.45,'#a9c5d7');sky.addColorStop(.68,'#dce5e7');sky.addColorStop(1,'#e7e9e4');ctx.fillStyle=sky;ctx.fillRect(0,0,c.width,c.height);
 let n=98271;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
 for(let j=0;j<38;j++){const cx=random()*2048,cy=290+random()*360,scale=45+random()*95;for(let k=0;k<16;k++){const x=cx+(random()-.5)*scale*2.8,y=cy+(random()-.5)*scale*.48,rx=scale*(.3+random()*.6),ry=rx*(.3+random()*.25);for(const wrap of [-2048,0,2048]){ctx.save();ctx.translate(x+wrap,y);ctx.scale(1,ry/rx);const puff=ctx.createRadialGradient(0,0,0,0,0,rx);puff.addColorStop(0,'rgba(255,255,255,.17)');puff.addColorStop(.5,'rgba(245,247,247,.10)');puff.addColorStop(1,'rgba(245,247,247,0)');ctx.fillStyle=puff;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore()}}}
 const texture=new T.CanvasTexture(c);texture.mapping=T.EquirectangularReflectionMapping;texture.colorSpace=T.SRGBColorSpace;return texture;
}
const scene=new T.Scene();scene.background=crearCielo();scene.fog=new T.Fog('#dce3e2',330,700);scene.add(new T.HemisphereLight(0xe8edf1,0xaaa28d,2.35));const sun=new T.DirectionalLight(0xfff5e3,1.35);sun.position.set(-84,240,108);sun.target.position.set(26,0,-17);scene.add(sun.target);sun.castShadow=true;sun.shadow.autoUpdate=false;sun.shadow.needsUpdate=true;sun.shadow.mapSize.set(4096,4096);Object.assign(sun.shadow.camera,{left:-140,right:140,top:140,bottom:-140,near:1,far:500});sun.shadow.bias=-.00015;sun.shadow.normalBias=.02;scene.add(sun);
const school=crearEscuela(),{root,inventario,ambientes,setInteriorMode}=school;canvas.dataset.exteriorTrees=String(inventario.arboles.filter(o=>o.position.x < -20).length);scene.add(root);scene.updateMatrixWorld(true);
const entorno=crearEntorno({school});
const entornoOptimizado=optimizarEstatico(entorno.root).group;scene.add(entornoOptimizado,entorno.rotulos);scene.updateMatrixWorld(true);canvas.dataset.exteriorTrees=String(entorno.trees.length);
const estilo=prepararEstiloEscuela({scene,renderer,school});
setInteriorMode(false,true);
school.ceilings.traverse(o=>{o.userData.renderLayer='ceilings'});
for(const roof of inventario.cubiertas)roof.traverse(o=>{o.userData.renderLayer='roofs'});
const schoolRender=optimizarEstatico(root);scene.remove(root);scene.add(schoolRender.group);

const camera=new T.PerspectiveCamera(45,1,.07,800),mapCamera=new T.OrthographicCamera(-40,40,29,-29,.1,250);let mode='walk',radius=65,theta=.66,phi=.76,yaw=0,pitch=.025,interiors=false;const target=new T.Vector3(8.5,.5,0),eye=new T.Vector3(24.25,1.65,12.1);let active=camera;
const visual=crearRenderConOclusion({scene,camera,renderer,estilo,width:innerWidth,height:innerHeight,escalaAO:.6});
const obstacles=[...inventario.bancos,...inventario.colisiones].map(o=>new T.Box3().setFromObject(o).expandByScalar(.15)).concat(entorno.colliders);
const benchBounds=inventario.bancos.map(o=>new T.Box3().setFromObject(o).expandByScalar(.22));
let lastViewState=null;
function allowed(x,z){if(x<entorno.limites.x0||x>entorno.limites.x1||z<entorno.limites.z0||z>entorno.limites.z1)return false;for(const t of entorno.trees)if(Math.hypot(x-t.x,z-t.z)<.4)return false;for(const c of school.medidas.canteros)if(Math.hypot(x-c.x,z-c.z)<c.radio+.25)return false;for(const b of obstacles)if(b.max.y>1.1&&b.min.y<1.95&&x>b.min.x&&x<b.max.x&&z>b.min.z&&z<b.max.z)return false;for(const q of benchBounds){if(x>q.min.x&&x<q.max.x&&z>q.min.z&&z<q.max.z)return false}return true}
function render(){const cut=mode==='map'||interiors;const state=`${mode}|${cut}`;
if(state!==lastViewState){setInteriorMode(cut,mode==='walk');
 for(const o of schoolRender.group.children){
  const layer=o.userData.renderLayer;
  o.visible=layer==='ceilings'?mode==='walk':layer==='roofs'?(!cut||mode==='walk'):true;
 }
 if(mode==='map'||lastViewState?.startsWith('map'))sun.shadow.needsUpdate=true;
renderer.shadowMap.needsUpdate=true;lastViewState=state;document.body.dataset.view=mode;document.querySelector('.orbit-help').hidden=mode!=='orbit'&&mode!=='block';document.querySelector('.orbit-help').textContent=matchMedia('(pointer:coarse)').matches?'Deslizá para girar · Dos dedos para acercar':'Arrastrá para girar · Rueda para acercar';entorno.rotulos.visible=mode==='block';document.querySelector('#block').setAttribute('aria-pressed',String(mode==='block'));document.querySelector('#walk').setAttribute('aria-pressed',String(mode==='walk'));document.querySelector('#aerial').setAttribute('aria-pressed',String(mode==='orbit'));}
if(mode==='map'){active=mapCamera;mapCamera.position.set(8.6,100,0);mapCamera.up.set(0,0,-1);mapCamera.lookAt(8.6,0,0)}else{active=camera;const fov=mode==='walk'?75:45,near=mode==='block'?Math.max(1,radius/200):mode==='orbit'?.4:.07,far=mode==='block'?Math.max(800,radius+450):800;scene.fog.near=mode==='block'?radius*1.3:330;scene.fog.far=mode==='block'?radius*3:700;if(camera.fov!==fov||camera.near!==near||camera.far!==far){camera.fov=fov;camera.near=near;camera.far=far;camera.updateProjectionMatrix()}if(mode==='walk'){camera.position.copy(eye);camera.lookAt(eye.x+Math.sin(yaw)*Math.cos(pitch),eye.y-Math.sin(pitch),eye.z-Math.cos(yaw)*Math.cos(pitch))}else{camera.position.set(target.x+radius*Math.sin(phi)*Math.sin(theta),target.y+radius*Math.cos(phi),target.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(target)}}if(mode==='map'){estilo.actualizar(active,{mapa:true});renderer.render(scene,active)}else visual.render();canvas.dataset.pose=JSON.stringify({position:active.position.toArray(),quaternion:active.quaternion.toArray(),mode});renderer.shadowMap.autoUpdate=false}
function resize(){renderer.setSize(innerWidth,innerHeight,false);visual.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;if(mode==='block')radius=Math.max(225,270/camera.aspect);camera.updateProjectionMatrix();const aspect=innerWidth/innerHeight;mapCamera.left=-29*aspect;mapCamera.right=29*aspect;mapCamera.top=29;mapCamera.bottom=-29;mapCamera.updateProjectionMatrix();invalidate()}window.addEventListener('resize',resize);
function caminarDesde(x,z,direccion=0){mode='walk';eye.set(x,1.65,z);yaw=direccion;pitch=.025;keys.clear();invalidate();canvas.focus({preventScroll:true})}
function walking(){caminarDesde(24.25,12.1)}
document.querySelector('#walk').onclick=walking;
document.querySelector('#classroom').onclick=()=>caminarDesde(-.9,16.8,-Math.PI/2);
document.querySelector('#aerial').onclick=()=>{mode='orbit';interiors=false;target.set(2,.5,0);radius=85;theta=.66;phi=.76;invalidate()};
document.querySelector('#block').onclick=()=>{mode='block';interiors=false;target.copy(entorno.centro);radius=Math.max(225,270/camera.aspect);theta=.2;phi=.48;invalidate()};
let drag=null,pinchDistance=0;const pointers=new Map();
const zoomBounds=()=>mode==='block'?[45,1100]:[4,300];
canvas.oncontextmenu=e=>e.preventDefault();
canvas.onpointerdown=e=>{
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 drag={x:e.clientX,y:e.clientY,button:e.button};canvas.setPointerCapture(e.pointerId);
 if(pointers.size===2){const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y)}
};
canvas.onpointermove=e=>{
 if(!pointers.has(e.pointerId))return;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size>=2&&mode!=='walk'){
  const [a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);
  if(pinchDistance>0&&distance>0)radius=T.MathUtils.clamp(radius*pinchDistance/distance,...zoomBounds());
  pinchDistance=distance;drag=null;invalidate();return;
 }
 if(!drag)return;
 const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;
 if(mode==='walk'){yaw+=dx*.004;pitch=T.MathUtils.clamp(pitch+dy*.004,-.7,.85)}
 else if(drag.button===2||e.shiftKey){const speed=radius*.0015;target.x+=(-Math.cos(theta)*dx+Math.sin(theta)*dy)*speed;target.z+=(Math.sin(theta)*dx+Math.cos(theta)*dy)*speed}
 else{theta-=dx*.005;phi=T.MathUtils.clamp(phi-dy*.005,.05,1.53)}
 invalidate();
};
function releasePointer(e){pointers.delete(e.pointerId);drag=null;pinchDistance=0}
canvas.onpointerup=releasePointer;canvas.onpointercancel=releasePointer;canvas.onlostpointercapture=releasePointer;
canvas.onwheel=e=>{e.preventDefault();if(mode==='orbit'||mode==='block'){radius=T.MathUtils.clamp(radius+e.deltaY*.035,...zoomBounds());invalidate()}};
const keys=new Set();
const movementKeys={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowUp:'arrowup',ArrowDown:'arrowdown',ArrowLeft:'arrowleft',ArrowRight:'arrowright'};
const touchButtons=[...document.querySelectorAll('[data-move]')];
function clearMovement(){keys.clear();for(const button of touchButtons)button.setAttribute('aria-pressed','false');drag=null;pointers.clear();pinchDistance=0}
window.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.altKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
 const key=movementKeys[e.code];
 if(key){e.preventDefault();keys.add(key)}
});
window.addEventListener('keyup',e=>{const key=movementKeys[e.code];if(key)keys.delete(key)});
window.addEventListener('blur',clearMovement);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearMovement()});
for(const button of touchButtons){
 const release=()=>{keys.delete(button.dataset.move);button.setAttribute('aria-pressed','false')};
 button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(button.dataset.move);button.setAttribute('aria-pressed','true')});
 button.addEventListener('pointerup',release);
 button.addEventListener('pointercancel',release);
 button.addEventListener('lostpointercapture',release);
}
let last=performance.now();
function tick(now){
 const dt=Math.min(.08,(now-last)/1000);last=now;
 if(keys.size){
  let forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0);
  let side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);
  const norm=Math.max(1,Math.hypot(forward,side));forward/=norm;side/=norm;
  if(mode==='walk'){
   const dx=(Math.sin(yaw)*forward+Math.cos(yaw)*side)*dt*2.7,dz=(-Math.cos(yaw)*forward+Math.sin(yaw)*side)*dt*2.7;
   const beforeX=eye.x,beforeZ=eye.z;
   if(allowed(eye.x+dx,eye.z))eye.x+=dx;
   if(allowed(eye.x,eye.z+dz))eye.z+=dz;
   if(beforeX!==eye.x||beforeZ!==eye.z)invalidate();
  }else if(forward||side){
   const speed=Math.max(8,radius*.65)*dt;
   target.x+=(-Math.sin(theta)*forward+Math.cos(theta)*side)*speed;
   target.z+=(-Math.cos(theta)*forward-Math.sin(theta)*side)*speed;invalidate();
  }
 }
 if(needsRender){needsRender=false;render()}
 requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
window.__escuela={scene,camera,renderer,root,schoolRender,inventario,ambientes,render,eye,target,allowed,getMode:()=>mode,wallPlane:school.wallPlane,estilo,visual,entorno};window.__patio=window.__escuela;resize();render();needsRender=false;window.__escuela.ready=renderer.compileAsync(scene,camera);
