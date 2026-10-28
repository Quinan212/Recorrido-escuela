import * as T from './vendor/three.module.js';
import {crearEscuela} from './escuela-escena.js?v=20261028-vegetacion';
import {optimizarEstatico} from './optimizar.js';
import {prepararEstiloEscuela,crearRenderConOclusion} from './estilo-escuela.js';
const canvas=document.querySelector('canvas'),renderer=new T.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.localClippingEnabled=true;renderer.setClearColor('#dce3e2');renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;
const gl=renderer.getContext(), debugRenderer=gl.getExtension('WEBGL_debug_renderer_info');canvas.dataset.gpu=debugRenderer?gl.getParameter(debugRenderer.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
function crearCielo(){
 const c=document.createElement('canvas');c.width=2048;c.height=1024;const ctx=c.getContext('2d');
 const sky=ctx.createLinearGradient(0,0,0,1024);sky.addColorStop(0,'#719abe');sky.addColorStop(.45,'#a9c5d7');sky.addColorStop(.68,'#dce5e7');sky.addColorStop(1,'#e7e9e4');ctx.fillStyle=sky;ctx.fillRect(0,0,c.width,c.height);
 let n=98271;const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
 for(let j=0;j<38;j++){const cx=random()*2048,cy=290+random()*360,scale=45+random()*95;for(let k=0;k<16;k++){const x=cx+(random()-.5)*scale*2.8,y=cy+(random()-.5)*scale*.48,rx=scale*(.3+random()*.6),ry=rx*(.3+random()*.25);for(const wrap of [-2048,0,2048]){ctx.save();ctx.translate(x+wrap,y);ctx.scale(1,ry/rx);const puff=ctx.createRadialGradient(0,0,0,0,0,rx);puff.addColorStop(0,'rgba(255,255,255,.17)');puff.addColorStop(.5,'rgba(245,247,247,.10)');puff.addColorStop(1,'rgba(245,247,247,0)');ctx.fillStyle=puff;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore()}}}
 const texture=new T.CanvasTexture(c);texture.mapping=T.EquirectangularReflectionMapping;texture.colorSpace=T.SRGBColorSpace;return texture;
}
const scene=new T.Scene();scene.background=crearCielo();scene.fog=new T.Fog('#dce3e2',110,210);scene.add(new T.HemisphereLight(0xe8edf1,0xaaa28d,2.35));const sun=new T.DirectionalLight(0xfff5e3,1.35);sun.position.set(-22,48,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-45,right:45,top:45,bottom:-45,near:.5,far:130});sun.shadow.bias=-.00015;sun.shadow.normalBias=.02;scene.add(sun);
const school=crearEscuela(),{root,inventario,ambientes,setInteriorMode}=school;canvas.dataset.exteriorTrees=String(inventario.arboles.filter(o=>o.position.x < -20).length);scene.add(root);scene.updateMatrixWorld(true);
const estilo=prepararEstiloEscuela({scene,renderer,school});
const camera=new T.PerspectiveCamera(45,1,.07,300),mapCamera=new T.OrthographicCamera(-40,40,29,-29,.1,250);let mode='walk',radius=65,theta=.66,phi=.76,yaw=0,pitch=.025,interiors=false;const target=new T.Vector3(8.5,.5,0),eye=new T.Vector3(24.25,1.65,12.1);let active=camera;
const visual=crearRenderConOclusion({scene,camera,renderer,estilo,width:innerWidth,height:innerHeight,escalaAO:.6});
const obstacles=[...inventario.bancos,...inventario.colisiones].map(o=>new T.Box3().setFromObject(o).expandByScalar(.15));
const benchBounds=inventario.bancos.map(o=>new T.Box3().setFromObject(o).expandByScalar(.22));
let walkScene=null,lastViewState=null;
function allowed(x,z){if(x<-17.4||x>35.4||z<-23.3||z>24)return false;for(const c of school.medidas.canteros)if(Math.hypot(x-c.x,z-c.z)<c.radio+.25)return false;for(const b of obstacles)if(b.max.y>1.1&&b.min.y<1.95&&x>b.min.x&&x<b.max.x&&z>b.min.z&&z<b.max.z)return false;for(const q of benchBounds){if(x>q.min.x&&x<q.max.x&&z>q.min.z&&z<q.max.z)return false}return true}
function render(){const cut=mode==='map'||interiors;const state=`${mode}|${cut}`;
if(state!==lastViewState){if(root.parent!==scene)scene.add(root);root.visible=true;setInteriorMode(cut,mode==='walk');
if(mode==='walk'){if(!walkScene){root.updateMatrixWorld(true);walkScene=optimizarEstatico(root).group;canvas.dataset.walkTreeInstances=String(walkScene.children.filter(o=>o.isInstancedMesh).length);scene.add(walkScene)}scene.remove(root);walkScene.visible=true}else if(walkScene)walkScene.visible=false;
renderer.shadowMap.needsUpdate=true;lastViewState=state;document.body.dataset.view=mode;document.querySelector('.orbit-help').hidden=mode!=='orbit';document.querySelector('#walk').setAttribute('aria-pressed',String(mode==='walk'));document.querySelector('#aerial').setAttribute('aria-pressed',String(mode==='orbit'));}
if(mode==='map'){active=mapCamera;mapCamera.position.set(8.6,100,0);mapCamera.up.set(0,0,-1);mapCamera.lookAt(8.6,0,0)}else{active=camera;const fov=mode==='walk'?75:45;if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix()}if(mode==='walk'){camera.position.copy(eye);camera.lookAt(eye.x+Math.sin(yaw)*Math.cos(pitch),eye.y-Math.sin(pitch),eye.z-Math.cos(yaw)*Math.cos(pitch))}else{camera.position.set(target.x+radius*Math.sin(phi)*Math.sin(theta),target.y+radius*Math.cos(phi),target.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(target)}}if(mode==='map'){estilo.actualizar(active,{mapa:true});renderer.render(scene,active)}else visual.render();canvas.dataset.pose=JSON.stringify({position:active.position.toArray(),quaternion:active.quaternion.toArray(),mode});renderer.shadowMap.autoUpdate=false}
function resize(){renderer.setSize(innerWidth,innerHeight,false);visual.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();const aspect=innerWidth/innerHeight;mapCamera.left=-29*aspect;mapCamera.right=29*aspect;mapCamera.top=29;mapCamera.bottom=-29;mapCamera.updateProjectionMatrix();render()}window.addEventListener('resize',resize);
function caminarDesde(x,z,direccion=0){mode='walk';eye.set(x,1.65,z);yaw=direccion;pitch=.025;keys.clear();render();canvas.focus({preventScroll:true})}
function walking(){caminarDesde(24.25,12.1)}
document.querySelector('#walk').onclick=walking;
document.querySelector('#classroom').onclick=()=>caminarDesde(-.9,16.8,-Math.PI/2);
document.querySelector('#aerial').onclick=()=>{mode='orbit';interiors=false;target.set(2,.5,0);radius=85;theta=.66;phi=.76;render()};
let drag=null;canvas.oncontextmenu=e=>e.preventDefault();canvas.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,button:e.button};canvas.setPointerCapture(e.pointerId)};canvas.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(mode==='walk'){yaw+=dx*.004;pitch=T.MathUtils.clamp(pitch+dy*.004,-.7,.85)}else if(drag.button===2||e.shiftKey){const speed=radius*.0015;target.x+=(-Math.cos(theta)*dx+Math.sin(theta)*dy)*speed;target.z+=(Math.sin(theta)*dx+Math.cos(theta)*dy)*speed}else{theta-=dx*.005;phi=T.MathUtils.clamp(phi-dy*.005,.05,1.53)}render()};canvas.onpointerup=()=>drag=null;canvas.onpointercancel=()=>drag=null;canvas.onwheel=e=>{e.preventDefault();if(mode==='orbit'){radius=T.MathUtils.clamp(radius+e.deltaY*.035,4,300);render()}};
const keys=new Set();
const movementKeys={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ArrowUp:'arrowup',ArrowDown:'arrowdown',ArrowLeft:'arrowleft',ArrowRight:'arrowright'};
const touchButtons=[...document.querySelectorAll('[data-move]')];
function clearMovement(){keys.clear();for(const button of touchButtons)button.setAttribute('aria-pressed','false');drag=null}
window.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.altKey||e.metaKey||e.target.closest?.('input,textarea,select,[contenteditable="true"]'))return;
 const key=movementKeys[e.code];
 if(key){e.preventDefault();keys.add(key)}
});
window.addEventListener('keyup',e=>{const key=movementKeys[e.code];if(key)keys.delete(key)});
window.addEventListener('blur',clearMovement);
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearMovement()});
canvas.addEventListener('lostpointercapture',()=>{drag=null});
for(const button of touchButtons){
 const release=()=>{keys.delete(button.dataset.move);button.setAttribute('aria-pressed','false')};
 button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);keys.add(button.dataset.move);button.setAttribute('aria-pressed','true')});
 button.addEventListener('pointerup',release);
 button.addEventListener('pointercancel',release);
 button.addEventListener('lostpointercapture',release);
}
let last=performance.now(),sampleElapsed=0,sampleFrames=0;function tick(now){if(mode==='walk'&&keys.size){sampleElapsed+=now-last;sampleFrames++;if(sampleElapsed>=1000){canvas.dataset.walkFps=(sampleFrames*1000/sampleElapsed).toFixed(1);canvas.dataset.drawCalls=renderer.info.render.calls;canvas.dataset.resolution=canvas.width+'x'+canvas.height;sampleFrames=0;sampleElapsed=0}}else{sampleElapsed=0;sampleFrames=0}const dt=Math.min(.08,(now-last)/1000);last=now;if(keys.size){let forward=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),side=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0);const norm=Math.max(1,Math.hypot(forward,side));forward/=norm;side/=norm;if(mode==='walk'){const dx=(Math.sin(yaw)*forward+Math.cos(yaw)*side)*dt*2.7,dz=(-Math.cos(yaw)*forward+Math.sin(yaw)*side)*dt*2.7;if(allowed(eye.x+dx,eye.z))eye.x+=dx;if(allowed(eye.x,eye.z+dz))eye.z+=dz}else{const speed=Math.max(8,radius*.65)*dt;target.x+=(-Math.sin(theta)*forward+Math.cos(theta)*side)*speed;target.z+=(-Math.cos(theta)*forward-Math.sin(theta)*side)*speed}render()}requestAnimationFrame(tick)}requestAnimationFrame(tick);
window.__escuela={scene,camera,root,inventario,ambientes,render,eye,target,allowed,getMode:()=>mode,wallPlane:school.wallPlane,estilo,visual};window.__patio=window.__escuela;resize();window.__escuela.ready=renderer.compileAsync(scene,camera);
