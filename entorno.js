import * as T from './vendor/three.module.js';
import {surfaceTexture} from './texturas.js';
import {referenciaEntorno as R} from './entorno-referencia.js';

// La planta de la escuela conserva sus coordenadas. El entorno es una aproximación
// de la captura aérea; no representa un relevamiento topográfico ni fachadas verificadas.
export function crearEntorno({school}){
 const root=new T.Group();root.name='Entorno de la manzana';
 const rotulos=new T.Group();rotulos.name='Nombres de calles · vista de manzana';rotulos.visible=false;
 const colliders=[],trees=R.trees.map(t=>({...t}));
 const limites={x0:-94,x1:139,z0:-107,z1:101};
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:1,...extra});
 const grassTexture=surfaceTexture({color:'#819078',seed:5841,grain:34,paintWear:180});
 grassTexture.repeat.set(1/7,1/7);
 const roadTexture=surfaceTexture({color:'#b7a58b',seed:7173,grain:39,paintWear:260});
 roadTexture.repeat.set(1/5,1/5);
 const grass=mat('#ffffff',{map:grassTexture});
 const road=mat('#ffffff',{map:roadTexture});
 const verge=mat('#b7ab8d');
 const plaster=[mat('#c1b9a5'),mat('#c8c5b9'),mat('#b9b5a8'),mat('#c0ad98')];
 const windows=mat('#58696a',{roughness:.75}),frames=mat('#c9c7ba'),doors=mat('#777669');
 const curb=mat('#a69e89');
 function mesh(geometry,material,parent=root,name){
  const o=new T.Mesh(geometry,material);o.castShadow=true;o.receiveShadow=true;
  if(name)o.name=name;parent.add(o);return o;
 }
 function box(x,y,z,w,h,d,m,parent=root,name){
  const o=mesh(new T.BoxGeometry(w,h,d),m,parent,name);o.position.set(x,y,z);return o;
 }
 function patch(x,z,w,d,m,name,y=-.1){
  const geometry=new T.PlaneGeometry(w,d),uv=geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w+x-w/2,uv.getY(i)*d-z-d/2);
  const o=mesh(geometry,m,root,name);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);o.castShadow=false;return o;
 }
 function polygon(points,material,name,y=-.096){
  const shape=new T.Shape();points.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));shape.closePath();
  const o=mesh(new T.ShapeGeometry(shape),material,root,name);o.rotation.x=-Math.PI/2;o.position.y=y;o.castShadow=false;return o;
 }
 function block(x0,x1,z0,z1,y0,y1){
  colliders.push(new T.Box3(new T.Vector3(x0,y0,z0),new T.Vector3(x1,y1,z1)));
 }
 // Quitar los tramos de calle y la vegetación provisional de la primera maqueta.
 for(const name of ['Terreno exterior','Calle Alvear','Calle de los Viñedos','Arbustos exteriores detrás del mástil']){
  const o=school.root.getObjectByName(name);if(o)o.removeFromParent();
 }
 for(const t of [...school.inventario.arboles])if(t.position.x<-20){
  t.removeFromParent();school.inventario.arboles.splice(school.inventario.arboles.indexOf(t),1);
 }
 for(const o of [...school.root.children])if(o.isGroup&&o.position.x<-23&&o.position.y===0)o.removeFromParent();
 patch(20,-6,260,230,grass,'Terreno de contexto',-.15);
 // Cobertura del terreno en una sola superficie, sin capas casi coplanares.
 const landCanvas=document.createElement('canvas');landCanvas.width=landCanvas.height=1024;
 const land=landCanvas.getContext('2d');land.fillStyle='#8a947d';land.fillRect(0,0,1024,1024);
 let terrainSeed=231177;const groundRand=()=>{terrainSeed=(Math.imul(terrainSeed,1664525)+1013904223)>>>0;return terrainSeed/4294967296};
 for(let i=0;i<36000;i++){land.fillStyle=i%2?'#3c513c17':'#ddd3ae1a';const r=.3+groundRand()*2;land.fillRect(groundRand()*1024,groundRand()*1024,r,r)}
 const shadePatch=(x,z,w,d,color)=>{const px=(x+18.25)/94.3*1024,py=(z+58.5)/85.3*1024;land.save();land.translate(px,py);land.scale(w/94.3,d/85.3);const g=land.createRadialGradient(0,0,0,0,0,512);g.addColorStop(0,color);g.addColorStop(1,'#a8987000');land.fillStyle=g;land.fillRect(-512,-512,1024,1024);land.restore()};
 for(const p of [[12,-39,19,9],[43,-48,15,8],[55,-6,12,27],[45,12,13,9],[-7,-51,10,6]])shadePatch(...p,'#ac9d795a');
 for(const p of [[0,-45,14,11],[63,-21,16,23],[54,-37,12,15]])shadePatch(...p,'#526c4a35');
 const landTexture=new T.CanvasTexture(landCanvas);landTexture.colorSpace=T.SRGBColorSpace;landTexture.anisotropy=8;
 const schoolLand=patch(28.9,-15.9,94.3,85.3,mat('#ffffff',{map:landTexture}),'Terreno libre de la manzana escolar',-.105);
 schoolLand.geometry.setAttribute('uv',new T.Float32BufferAttribute([0,1,1,1,0,0,1,0],2));
 // Calles de tierra según la referencia; sin líneas de carril añadidas.
 const calles=[
  {name:'Marcelo T. de Alvear',x:-21.5,z:-12,w:6.5,d:208,axis:'z'},
  {name:'Laprida',x:82,z:-12,w:12,d:208,axis:'z'},
  {name:'Juan Justo Mega',x:22,z:-62,w:254,d:7,axis:'x'},
  {name:'De los Viñedos',x:22,z:31.5,w:254,d:9.5,axis:'x'}
 ];
 for(const c of calles){
  patch(c.x,c.z,c.w,c.d,road,'Calle · '+c.name,-.078);
  if(c.axis==='x')for(const dz of [-1.4,1.4])patch(c.x,c.z+dz,c.w,.45,mat('#b19f85'),'Huella sobre tierra',-.056);
  else for(const dx of [-1.2,1.2])patch(c.x+dx,c.z,.45,c.d,mat('#b19f85'),'Huella sobre tierra',-.056);
 }
 patch(74.8,-15.8,2,84.8,verge,'Banquina de Laprida',-.084);
 patch(28.5,-57.8,92,1.2,verge,'Banquina de Juan Justo Mega',-.084);
 patch(24.25,25.0,3.3,6.1,curb,'Conexión peatonal del acceso',-.047);
 // Cancha de tierra que se alcanza a ver en el sector sudoeste de la captura.
 polygon(R.field,mat('#beac8d'),'Cancha de tierra del entorno',-.088);
 function roofMaterial(color,seed){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
  c.fillStyle=color;c.fillRect(0,0,256,256);
  for(let i=0;i<256;i+=16){c.fillStyle='#ffffff16';c.fillRect(i,0,3,256);c.fillStyle='#00000016';c.fillRect(i+4,0,2,256);}
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(1/2,1/4);
  return mat('#ffffff',{map:tex,roughness:.89,metalness:.12});
 }
 const roofs={gris:roofMaterial('#858682'),claro:roofMaterial('#b8b9b0'),rojo:roofMaterial('#88625a'),ladrillo:roofMaterial('#968271')};
 function roof(g,w,d,h,material){
  const a=w/2+.22,b=d/2+.22,rise=Math.min(.85,w*.09),geo=new T.BufferGeometry();
  const vertices=[-a,h,-b,-a,h,b,0,h+rise,-b,0,h+rise,b,a,h,-b,a,h,b];
  geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
  geo.setAttribute('uv',new T.Float32BufferAttribute([-a,-b,-a,b,0,-b,0,b,a,-b,a,b],2));
  geo.setIndex([0,1,2,1,3,2,2,3,4,3,5,4]);geo.computeVertexNormals();
  const o=mesh(geo,material,g,'Cubierta de construcción vecina');o.material.side=T.DoubleSide;
  const ends=new T.BufferGeometry();ends.setAttribute('position',new T.Float32BufferAttribute([-a,h,-b,a,h,-b,0,h+rise,-b,-a,h,b,0,h+rise,b,a,h,b],3));ends.computeVertexNormals();
  mesh(ends,plaster[1],g,'Remate de cubierta').material.side=T.DoubleSide;
 }
 function facade(g,w,d,h,side){
  const f=new T.Group();g.add(f);
  if(side==='S')f.position.z=d/2+.012;
  if(side==='N'){f.position.z=-d/2-.012;f.rotation.y=Math.PI}
  if(side==='W'){f.position.x=-w/2-.012;f.rotation.y=-Math.PI/2}
  if(side==='E'){f.position.x=w/2+.012;f.rotation.y=Math.PI/2}
  const width=(side==='S'||side==='N')?w:d;
  box(-width*.24,.97,0,.82,1.94,.035,doors,f,'Puerta aproximada de vivienda');
  for(const x of [width*.10,width*.31]){
   box(x,1.47,-.005,1.05,.97,.04,frames,f);
   box(x,1.47,.022,.90,.82,.018,windows,f);
  }
 }
 R.houses.forEach((h,i)=>{
  const g=new T.Group();g.name='Construcción vecina · '+(i+1);g.position.set(h.x,0,h.z);root.add(g);
  const floor=mat(i%3===0?'#a5ad94':'#919e83');
  patch(h.x,h.z,h.width+4,h.depth+4,floor,'Lote de construcción vecina',-.098);
  box(0,h.height/2-.07,0,h.width,h.height,h.depth,plaster[i%plaster.length],g,'Volumen estimado');
  roof(g,h.width,h.depth,h.height-.07,roofs[h.roof]);
  const side=h.z<-65?'S':h.x>88?'W':h.z>40?'N':'E';
  facade(g,h.width,h.depth,h.height,side);
  block(h.x-h.width/2-.25,h.x+h.width/2+.25,h.z-h.depth/2-.25,h.z+h.depth/2+.25,-.1,h.height+1);
  // Cercos bajos entre los lotes, como volúmenes orientativos.
  if(h.x>88&&h.z<30&&i%2===0)box(h.x,-.05+.32,h.z+h.depth/2+1.6,h.width+3,.64,.14,plaster[2],root,'Medianera baja');
 });
 const [ax,az]=R.auxiliary;
 box(ax,1.03,az,5.7,2.2,3.2,plaster[2],root,'Volumen auxiliar detrás de la escuela');
 const aux=new T.Group();aux.position.set(ax,0,az);root.add(aux);roof(aux,5.7,3.2,2.13,roofs.claro);
 block(ax-3,ax+3,az-1.8,az+1.8,-.1,3);
 // Vegetación de la referencia: copas y troncos instanciados para mantener la fluidez.
 let seed=20261028;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const trunkGeo=new T.CylinderGeometry(.15,.25,1,7),leafGeo=new T.IcosahedronGeometry(1,2);
 // Romper el contorno esférico de las copas sin añadir llamadas de dibujo.
 const foliage=leafGeo.attributes.position;
 for(let i=0;i<foliage.count;i++){const v=new T.Vector3().fromBufferAttribute(foliage,i);v.multiplyScalar(1+.10*Math.sin(v.x*17+v.y*13+v.z*11));foliage.setXYZ(i,v.x,v.y,v.z)}
 leafGeo.computeVertexNormals();
 const trunks=new T.InstancedMesh(trunkGeo,mat('#6f6652'),trees.length);
 const leaves=new T.InstancedMesh(leafGeo,mat('#ffffff'),trees.length*9);
 const dummy=new T.Object3D(),color=new T.Color();let index=0;
 trees.forEach((t,i)=>{
  dummy.position.set(t.x,t.height*.33-.1,t.z);dummy.rotation.set(0,rand()*6.28,0);dummy.scale.set(1,t.height*.66,1);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
  for(let k=0;k<9;k++){
   const angle=k*2.39996,r=k===0?0:t.radius*(.25+rand()*.36);
   dummy.position.set(t.x+Math.cos(angle)*r,t.height*(.60+rand()*.19),t.z+Math.sin(angle)*r);
   dummy.rotation.set(rand()*.4,rand()*6.28,rand()*.3);
   dummy.scale.set(t.radius*(.48+rand()*.20),t.height*(.17+rand()*.08),t.radius*(.48+rand()*.20));dummy.updateMatrix();
   leaves.setMatrixAt(index,dummy.matrix);leaves.setColorAt(index,color.setHSL(.24+rand()*.045,.26+rand()*.15,.14+rand()*.065));index++;
  }
 });
 for(const [o,name] of [[trunks,'Troncos del entorno'],[leaves,'Copas del entorno']]){o.name=name;o.castShadow=true;o.receiveShadow=true;o.computeBoundingSphere();root.add(o)}
 function label(text,x,z,width,rotation=0){
  const c=document.createElement('canvas');c.width=1536;c.height=192;const ctx=c.getContext('2d');
  ctx.font='600 112px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=11;ctx.strokeStyle='#324037dd';ctx.strokeText(text,768,96,1480);ctx.fillStyle='#fffdf0';ctx.fillText(text,768,96,1480);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const o=new T.Mesh(new T.PlaneGeometry(width,width/8),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:T.DoubleSide}));
  o.rotation.set(-Math.PI/2,0,rotation);o.position.set(x,.06,z);o.name='Rótulo · '+text;rotulos.add(o);
 }
 label('Juan Justo Mega',27,-62,29);
 label('De los Viñedos',23,31.5,28);
 label('Marcelo T. de Alvear',-21.5,-13,35,Math.PI/2);
 label('Laprida',82,-12,20,Math.PI/2);
 // La reja oeste y los laterales del acceso permanecen cerrados al tránsito.
 block(-15.40,-14.60,-11,11,0,2.8);
 for(const [a,b] of [[16.85,22.30],[26.20,31.65]])block(a,b,22.09,22.49,0,2.6);
 root.userData={aproximado:true,base:'Captura aérea aportada por Alan',viviendas:R.houses.length,arboles:trees.length};
 return {root,rotulos,colliders,trees,limites,calles,centro:new T.Vector3(26,0,-17)};
}
