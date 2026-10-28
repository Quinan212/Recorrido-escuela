import * as THREE from 'three';

// Texturas deterministas, locales y repetibles: no dependen de servicios externos.
export function surfaceTexture({color,seed=7,grain=5,scratches=0,paintWear=0}){
 const size=512,c=document.createElement('canvas');c.width=c.height=size;
 const ctx=c.getContext('2d');let state=seed>>>0;
 const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 ctx.fillStyle=color;ctx.fillRect(0,0,size,size);const data=ctx.getImageData(0,0,size,size);
 for(let i=0;i<data.data.length;i+=4){const n=(random()-.5)*grain;for(let k=0;k<3;k++)data.data[i+k]=Math.max(0,Math.min(255,data.data[i+k]+n))}
 ctx.putImageData(data,0,0);
 for(let i=0;i<scratches;i++){const x=random()*size,y=random()*size;ctx.strokeStyle=i%3?'rgba(54,56,49,.13)':'rgba(255,255,244,.2)';ctx.lineWidth=.35+random()*.55;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+6+random()*37,y+(random()-.5)*12);ctx.stroke()}
 for(let i=0;i<paintWear;i++){const x=random()*size,y=random()*size;ctx.fillStyle='rgba(78,77,66,.28)';ctx.fillRect(x,y,1+random()*3,.5+random()*1.4)}
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.anisotropy=8;return texture;
}

export function applyFurnitureTextures(materials){
 const configs={
  top:{color:'#cbcdc8',seed:11,grain:8,scratches:65},
  seat:{color:'#d2cfc0',seed:19,grain:7,scratches:38},
  seatGrey:{color:'#bdc3bd',seed:21,grain:9,scratches:48},
  seatWood:{color:'#9c8267',seed:23,grain:12,scratches:35},
  green:{color:'#216b42',seed:29,grain:10,paintWear:80},
  black:{color:'#202725',seed:31,grain:8,paintWear:50},
  ivory:{color:'#c8c0a7',seed:37,grain:7,paintWear:45},
  teacher:{color:'#c8bea5',seed:41,grain:5,scratches:12},
  teacherTop:{color:'#ded8c7',seed:43,grain:5,scratches:20},
  edge:{color:'#424c46',seed:47,grain:9,paintWear:80}
 };
 for(const [name,config] of Object.entries(configs)){
  const material=materials[name],texture=surfaceTexture(config);
  material.color.set('#ffffff');material.map=texture;
  // El relieve es mínimo: la superficie del laminado debe seguir siendo lisa.
  material.bumpMap=texture;material.bumpScale=['green','black','ivory'].includes(name)?.0005:.00025;
  material.needsUpdate=true;
 }
}

function textureCanvas(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t}
function seeded(seed){let s=seed;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
function plaster(color,seed){const t=surfaceTexture({color,seed,grain:10});const c=t.image,ctx=c.getContext('2d'),r=seeded(seed);for(let i=0;i<55;i++){const x=r()*512,y=r()*512,rad=18+r()*80;const g=ctx.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,i%2?'rgba(80,70,49,.018)':'rgba(255,255,241,.025)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,512,512)}t.needsUpdate=true;return t}
function masonry(){const r=seeded(65);return textureCanvas(1024,512,(c,w,h)=>{c.fillStyle='#b9afa0';c.fillRect(0,0,w,h);for(let row=0;row<8;row++)for(let col=-1;col<5;col++){const x=col*256+(row%2)*128,y=row*64;const shade=Math.floor(r()*25);c.fillStyle=`rgb(${136+shade},${99+shade},${78+shade})`;c.fillRect(x+5,y+5,246,54);for(let n=0;n<550;n++){const a=r();c.fillStyle=a>.5?'rgba(236,210,179,.13)':'rgba(61,40,29,.12)';c.fillRect(x+7+r()*240,y+7+r()*48,1+r()*4,1+r()*2)}c.strokeStyle='rgba(225,205,176,.15)';c.lineWidth=2;c.strokeRect(x+6,y+6,244,52)}})}
function terrazzo(){const r=seeded(73);return textureCanvas(768,768,(c,w,h)=>{c.fillStyle='#969993';c.fillRect(0,0,w,h);for(let i=0;i<65000;i++){c.fillStyle=['#b5b8b0','#797f79','#a4a89f','#c4c5b9'][i%4];const x=r()*w,y=r()*h,sz=.4+r()*1.5;c.globalAlpha=.18+r()*.25;c.fillRect(x,y,sz,sz)}c.globalAlpha=1;for(let i=0;i<12;i++){const x=r()*w,y=r()*h,g=c.createRadialGradient(x,y,0,x,y,70+r()*90);g.addColorStop(0,'rgba(58,65,60,.025)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h)}})}
function whiteboard(){const r=seeded(81);return textureCanvas(1024,512,(c,w,h)=>{c.fillStyle='#e9eae3';c.fillRect(0,0,w,h);for(let i=0;i<50;i++){c.strokeStyle=`rgba(90,101,96,${.008+r()*.018})`;c.lineWidth=3+r()*15;c.beginPath();const x=r()*w,y=r()*h;c.moveTo(x,y);c.bezierCurveTo(x+40,y-20,x+100,y+25,x+160+r()*120,y-5);c.stroke()}for(let i=0;i<1800;i++){c.fillStyle='rgba(100,105,98,.012)';c.fillRect(r()*w,r()*h,1,1)}})}
function woven(){return textureCanvas(512,512,(c,w,h)=>{c.fillStyle='#168eae';c.fillRect(0,0,w,h);for(let i=0;i<512;i+=2){c.strokeStyle=i%4?'rgba(12,61,83,.09)':'rgba(133,207,218,.12)';c.lineWidth=.65;c.beginPath();c.moveTo(i,0);c.lineTo(i,h);c.stroke();c.strokeStyle='rgba(219,242,243,.07)';c.beginPath();c.moveTo(0,i);c.lineTo(w,i);c.stroke()}})}
export function applyRoomTextures(m){
 const set=(material,texture,bump=.001)=>{material.color.set('#ffffff');material.map=texture;material.bumpMap=texture;material.bumpScale=bump;material.needsUpdate=true};
 set(m.cream,plaster('#eee9cf',61),.0009);set(m.beige,plaster('#c5aa95',63),.0009);
 set(m.brick,masonry(),.003);m.brick.roughness=.98;
 const floor=terrazzo();floor.repeat.set(1.4,1.4);set(m.floor,floor,.0007);m.floor.roughness=.83;
 set(m.frame,surfaceTexture({color:'#c8cfcb',seed:91,grain:7,scratches:24,paintWear:12}),.00025);m.frame.metalness=.28;m.frame.roughness=.47;
 set(m.black,surfaceTexture({color:'#252b2a',seed:93,grain:9,paintWear:32}),.0004);m.black.metalness=.18;m.black.roughness=.55;
 const cloth=woven();cloth.repeat.set(3,5);set(m.curtain,cloth,.0006);m.curtain.roughness=1;
 m.glass.color.set('#b8cdca');m.glass.opacity=.23;m.glass.roughness=.12;m.glass.depthWrite=false;
 m.glass.map=surfaceTexture({color:'#f3f5f2',seed:97,grain:3,scratches:5});
 m.board=new THREE.MeshStandardMaterial({color:'#ffffff',map:whiteboard(),roughness:.3,metalness:.02});
 m.fanGuard=new THREE.MeshStandardMaterial({color:'#747c78',metalness:.65,roughness:.52});
 m.rubber=new THREE.MeshStandardMaterial({color:'#575f59',roughness:.95});
}
