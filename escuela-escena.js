import * as T from './vendor/three.module.js';
import {crearPatio} from './patio-escena.js?v=20261028-vegetacion';
import {crearMobiliarioAula} from './aula-mobiliario.js';
import {ambientes,zonasCubierta} from './escuela-plano.js';
import {detallarReferenciaEscuela} from './escuela-referencias.js';

export function crearEscuela(){
const patio=crearPatio({conEdificios:false}),{root,inventario,herramientas:H}=patio;
const {mat,add,box,rod,patch,roof,gallery,common,red,white,washed,metal,roofMat}=H;
root.name='Escuela completa';Object.assign(inventario,{ambientes:[],cubiertas:[],paredes:[],colisiones:[],rotulos:[],aberturas:[]});
const cream=common.cream,beige=common.beige,brick=common.brick,frame=common.frame,glass=common.glass;
const preceptoriaWall=mat('#c7b4a0');
const furniture={wood:mat('#bca886'),desk:mat('#c7c9bd'),green:mat('#376348'),black:mat('#333d37'),paper:mat('#e5e0ca'),ceramic:mat('#e2e5dd',{roughness:.35}),tile:mat('#c3cec1'),books:[mat('#955c4f'),mat('#667c80'),mat('#a8986b'),mat('#748165')],dark:mat('#4a5147')};
const sectionColors={aula:'#a3b6a0',prodise:'#a7b2ca',sanitarios:'#a1bac3',bano:'#a1bac3',circulacion:'#d2c6a6',administracion:'#c1ab93',maestros:'#baa790',office:'#c9b59d',centro:'#b3b98d',espera:'#b6b4a0',deposito:'#b4afa2'};
const clockCanvas=document.createElement('canvas');clockCanvas.width=clockCanvas.height=256;const clockCtx=clockCanvas.getContext('2d');clockCtx.fillStyle='#e5e3d6';clockCtx.beginPath();clockCtx.arc(128,128,121,0,Math.PI*2);clockCtx.fill();clockCtx.strokeStyle='#4a5148';clockCtx.lineWidth=4;for(let i=0;i<12;i++){const a=i*Math.PI/6;clockCtx.beginPath();clockCtx.moveTo(128+Math.sin(a)*102,128-Math.cos(a)*102);clockCtx.lineTo(128+Math.sin(a)*111,128-Math.cos(a)*111);clockCtx.stroke()}clockCtx.lineWidth=7;clockCtx.beginPath();clockCtx.moveTo(128,128);clockCtx.lineTo(91,104);clockCtx.moveTo(128,128);clockCtx.lineTo(170,93);clockCtx.stroke();const clockTexture=new T.CanvasTexture(clockCanvas);clockTexture.colorSpace=T.SRGBColorSpace;const clockFace=new T.MeshStandardMaterial({map:clockTexture,roughness:.8});
const wallPlane=new T.Plane(new T.Vector3(0,-1,0),50),materialCache=new Map();
function clipped(m){if(!materialCache.has(m)){const copy=m.clone();copy.clippingPlanes=[wallPlane];copy.clipShadows=true;materialCache.set(m,copy)}return materialCache.get(m)}
function archBox(x,y,z,w,h,d,m,parent=root){const materials=Array.isArray(m)?m.map(clipped):clipped(m);const o=box(x,y,z,w,h,d,materials,parent);o.userData.architecture=true;inventario.paredes.push(o);return o}
function physicalUV(o,widthScale=.92,heightScale=.48){const pos=o.geometry.attributes.position,uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/widthScale,(pos.getY(i)+o.position.y)/heightScale);uv.needsUpdate=true}
function textLabel(text,parent,x,y,z,width=3,flat=false){const c=document.createElement('canvas');c.width=768;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#f4f0dedf';ctx.fillRect(0,0,768,192);ctx.fillStyle='#355448';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 55px Arial';const words=text.split(' ');if(ctx.measureText(text).width>710){const middle=Math.ceil(words.length/2);ctx.fillText(words.slice(0,middle).join(' '),384,64);ctx.fillText(words.slice(middle).join(' '),384,132)}else ctx.fillText(text,384,96);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
const o=flat?new T.Mesh(new T.PlaneGeometry(width,width/4),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false})):new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true,depthTest:false}));if(flat)o.rotation.x=-Math.PI/2;else o.scale.set(width,width/4,1);o.position.set(x,y,z);parent.add(o);return o}
function table(parent,x,z,w=1.25,d=.62,rotation=0){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);box(0,.75,0,w,.035,d,furniture.desk,g);for(const xx of [-w/2+.08,w/2-.08])for(const zz of [-d/2+.07,d/2-.07])rod([xx,.02,zz],[xx,.73,zz],.017,furniture.black,g);return g}
function chair(parent,x,z,rotation=0,color=furniture.green){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);box(0,.45,0,.40,.03,.39,furniture.desk,g);box(0,.72,.18,.39,.22,.025,furniture.desk,g);for(const xx of [-.17,.17]){rod([xx,.02,-.16],[xx,.44,-.16],.015,color,g);rod([xx,.02,.16],[xx,.85,.18],.015,color,g);rod([xx,.32,-.16],[xx,.32,.16],.012,color,g)}return g}
function shelf(parent,x,z,w=1.5,h=1.75){box(x,h/2,z,w,h,.3,furniture.wood,parent);for(let j=0;j<4;j++){box(x,.22+j*.40,z+.17,w-.06,.025,.05,furniture.dark,parent);for(let i=0;i<8;i++)box(x-w/2+.12+i*(w-.18)/8,.39+j*.40,z+.17,.055+(i%2)*.02,.24,.11,furniture.books[(i+j)%4],parent)}}
function toilet(parent,x,z){const bowl=add(new T.TorusGeometry(.17,.047,7,20),furniture.ceramic,parent);bowl.rotation.x=Math.PI/2;bowl.scale.set(1,1.2,1);bowl.position.set(x,.40,z);box(x,.23,z,.23,.37,.30,furniture.ceramic,parent);box(x,.53,z-.26,.37,.48,.13,furniture.ceramic,parent)}
function sink(parent,x,z,width=.55){box(x,.79,z,width,.12,.38,furniture.ceramic,parent);const tap=rod([x,.84,z-.07],[x,.99,z-.07],.018,frame,parent);rod([x,.99,z-.07],[x,.99,z+.03],.018,frame,parent);return tap}
function furnish(r){if(r.id==='aula-sur-2'){const existing=crearMobiliarioAula();existing.position.set((r.x0+r.x1)/2,0,(r.z0+r.z1)/2);existing.userData.ambiente=r.id;root.add(existing);return existing}const g=new T.Group();g.name='Interior · '+r.nombre;g.position.set((r.x0+r.x1)/2,0,(r.z0+r.z1)/2);root.add(g);const w=r.x1-r.x0,d=r.z1-r.z0;g.userData.ambiente=r.id;
if(r.tipo==='aula'||r.tipo==='prodise'){
 const board=box(0,1.65,-d/2+.13,Math.min(2.8,w*.55),1.2,.055,common.frame,g);box(0,1.65,-d/2+.165,Math.min(2.72,w*.54),1.12,.015,common.board,g);
 const rows=d>6?4:3,cols=w>10?4:3;for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const x=(col-(cols-1)/2)*Math.min(1.65,(w-1.6)/cols),z=-d/2+2.1+row*(d-3.1)/Math.max(1,rows-1);table(g,x,z);chair(g,x-.3,z+.49);chair(g,x+.3,z+.49,0,furniture.black)}
 table(g,w*.30,-d/2+.85,1.5,.72);chair(g,w*.30,-d/2+.37,Math.PI);shelf(g,-w/2+.85,-d/2+.35,1.4,1.6);
 if(r.tipo==='prodise'){table(g,-w/2+1.0,0,1.5,.8,Math.PI/2);for(let i=0;i<5;i++)box(-w/2+.17,1.5+i*.14,.5,.045,.09,1.0,furniture.books[i%4],g)}
}else if(r.tipo==='sanitarios'||r.tipo==='bano'){
 const n=r.tipo==='bano'?1:4;for(let i=0;i<n;i++){const x=w*.22,z=-d/2+.7+i*1.27;toilet(g,x,z);if(n>1){box(x-w*.10,1.0,z+.61,w*.65,2,.055,furniture.tile,g);box(w/2-.65,1.0,z,.055,2,1.17,furniture.tile,g);box(w/2-.69,.97,z,.045,1.7,.7,common.frame,g)}}
 if(n>1){for(let i=0;i<3;i++)sink(g,-w/2+.38,d/2-1.0-i*.75,.55)}else sink(g,-w*.17,d/2-.6,.48);
}else if(r.id==='administracion'){
 // Muebles y mesas según la fotografía de preceptoría.
 const ivoryDesk=mat('#d4c7ad'),lightTop=mat('#e6e5dd'),deskMetal=mat('#333937',{metalness:.15}),cabinet=mat('#8c8d83'),cabinetDark=mat('#606662'),drawerRed=mat('#a64f3d'),boardGreen=mat('#286447'),boardFrame=mat('#d0cfbf');
 const frontDesk=new T.Group();frontDesk.position.set(.55,0,-1.25);g.add(frontDesk);frontDesk.name='Mesa clara con estructura oscura';box(0,.75,0,1.08,.035,.68,lightTop,frontDesk);
 for(const x of [-.49,.49])for(const z of [-.29,.29])box(x,.37,z,.035,.74,.035,deskMetal,frontDesk);
 for(const x of [-.49,.49])box(x,.25,0,.035,.035,.58,deskMetal,frontDesk);
 box(0,.54,.23,1.00,.34,.025,mat('#a9a79d'),frontDesk);
 const seat=new T.Group();seat.position.set(.55,0,-.67);seat.name='Silla acolchada oscura';g.add(seat);const upholstery=mat('#555956');box(0,.46,0,.43,.06,.42,upholstery,seat);box(0,.71,.19,.43,.34,.055,upholstery,seat);for(const x of [-.18,.18])box(x,.54,.17,.027,.20,.027,deskMetal,seat);for(const x of [-.18,.18])for(const z of [-.16,.16])box(x,.22,z,.027,.44,.027,deskMetal,seat);
 // Escritorio crema con faldón y patas claras, separado de la mesa frontal.
 const officeDesk=new T.Group();officeDesk.position.set(-.94,0,.30);officeDesk.rotation.y=Math.PI/2;g.add(officeDesk);officeDesk.name='Escritorio crema';box(0,.76,0,1.10,.045,.67,lightTop,officeDesk);
 box(0,.52,-.235,1.03,.43,.035,ivoryDesk,officeDesk);for(const x of [-.49,.49])for(const z of [-.27,.27])box(x,.37,z,.045,.74,.045,ivoryDesk,officeDesk);

 // Archivos apoyados en la misma pared lateral que la pizarra.
 const archivos=new T.Group();archivos.name='Armarios y archivador junto a la pizarra';archivos.position.set(-w/2+.34,0,2.35);archivos.rotation.y=-Math.PI/2;g.add(archivos);
 box(.30,1.02,0,.70,2.04,.54,cabinet,archivos);box(-.34,.78,0,.38,1.56,.47,drawerRed,archivos);box(-.66,.96,0,.25,1.92,.42,cabinetDark,archivos);
 box(.30,1.02,-.28,.012,1.98,.012,cabinetDark,archivos);for(const x of [.18,.42])box(x,1.03,-.285,.025,.15,.025,ivoryDesk,archivos);
 for(let i=0;i<5;i++){box(-.34,.14+i*.285,-.245,.34,.012,.012,cabinetDark,archivos);box(-.34,.22+i*.285,-.26,.12,.015,.018,ivoryDesk,archivos)}
 for(let i=0;i<3;i++)box(.16+i*.14,2.13,0,.11,.30,.21,i%2?furniture.paper:ivoryDesk,archivos);
 // Pizarra verde sobre el muro lateral de la ventana interior.
 box(-w/2+.11,1.65,-.15,.05,1.02,1.75,boardFrame,g);box(-w/2+.145,1.65,-.15,.012,.94,1.67,boardGreen,g);
 // Cortina clara junto a la ventana del fondo.
 const curtainMat=mat('#d7d0b8',{side:T.DoubleSide});const curtainGeo=new T.PlaneGeometry(.46,1.75,24,8);const curtainVertices=curtainGeo.attributes.position;for(let i=0;i<curtainVertices.count;i++)curtainVertices.setZ(i,Math.sin(curtainVertices.getX(i)*22)*.018);curtainGeo.computeVertexNormals();const curtain=new T.Mesh(curtainGeo,curtainMat);curtain.position.set(-.08,1.78,d/2-.17);g.add(curtain);rod([-.36,2.70,d/2-.17],[1.38,2.70,d/2-.17],.014,ivoryDesk,g);
 // Junta del cielorraso modular.
 const ceilingLine=mat('#bcb9aa');for(let x=-w/2+.6;x<w/2;x+=.65)box(x,3.485,0,.012,.008,d-.15,ceilingLine,g);for(let z=-d/2+.65;z<d/2;z+=.65)box(0,3.485,z,w-.15,.008,.012,ceilingLine,g);
}else if(['administracion','maestros','office','centro'].includes(r.tipo)){
 const length=Math.min(2.5,w-1.1);table(g,0,0,length,.82);chair(g,0,-.62,Math.PI,furniture.black);chair(g,-.6,.62);if(w>3.8)chair(g,.6,.62);if(r.tipo==='maestros'){const storage=new T.Group();storage.position.set(-w/2+.8,0,d/2-.23);storage.rotation.y=Math.PI;storage.name='Mueble de guardado';g.add(storage);shelf(storage,0,0,Math.min(1.4,w-1),1.7)}else if(r.id!=='administracion')shelf(g,-w/2+.8,-d/2+.23,Math.min(1.4,w-1),1.7);
 if(r.tipo==='office'){box(w/2-.35,.45,-d/2+.85,.58,.9,1.5,furniture.wood,g);sink(g,w/2-.35,-d/2+.85,.5);box(w/2-.36,1.10,d/2-.5,.62,2.05,.60,furniture.ceramic,g)}
 if(r.tipo==='maestros'){for(let i=0;i<3;i++){chair(g,-length/2+.4+i*.7,.65);chair(g,-length/2+.4+i*.7,-.65,Math.PI)}}
 if(r.tipo==='centro'){box(w/2-.2,1.65,0,.055,1.1,2.1,mat('#b7a882'),g);for(let i=0;i<5;i++)box(w/2-.24,1.4+(i%2)*.35,-.8+i*.4,.01,.25,.28,furniture.books[i%4],g)}
 if(r.tipo==='administracion'){box(.15,.89,-.22,.055,.24,.045,furniture.black,g);box(.15,1.08,-.22,.48,.29,.035,furniture.black,g);box(.15,1.08,-.199,.43,.24,.008,mat('#829b9a'),g);box(.15,.785,.09,.40,.018,.14,furniture.dark,g);for(let i=0;i<3;i++)box(-.65+i*.14,.785+i*.018,.03,.30,.025,.24,furniture.paper,g)}
 if(r.tipo!=='office'&&r.id!=='administracion'){const clock=add(new T.CircleGeometry(.145,40),clockFace,g);clock.position.set(.45,2.6,-d/2+.115);for(let i=0;i<2;i++){box(.1+i*.55,1.8,-d/2+.12,.40,.53,.025,furniture.wood,g);box(.1+i*.55,1.8,-d/2+.138,.34,.46,.008,furniture.paper,g)}}
}else if(r.tipo==='deposito'){for(let i=0;i<2;i++){shelf(g,-w/2+.8+i*Math.max(1.5,w-1.6),-d/2+.24,Math.min(1.3,w*.4));for(let k=0;k<3;k++)box(-w/2+.5+i*.9,.24+k*.32,d/2-.55,.65,.3,.6,mat(k%2?'#a7926e':'#927c5c'),g)}}
else if(r.tipo==='espera'){for(let i=0;i<3;i++){chair(g,-.55+i*.7,-d/2+.48,Math.PI);chair(g,-w/2+.48,-.6+i*.75,-Math.PI/2)}}
// Luminarias y carteleras aportan detalles sin inventar inscripciones personales.
if(r.tipo!=='circulacion'&&r.tipo!=='sin-asignar'){const lamp=box(0,3.36,0,1.1,.055,.14,mat('#ecece2',{emissive:'#efefdf',emissiveIntensity:.25}),g);if(r.id!=='administracion'&&!['sanitarios','bano','deposito','espera'].includes(r.tipo)){box(w/2-.13,1.7,d*.22,.04,.65,1.05,mat('#b3a17c'),g);for(let i=0;i<3;i++)box(w/2-.158,1.70+(i%2)*.13,d*.22-.33+i*.33,.01,.26,.23,furniture.paper,g)}}
return g}

// Reunir todos los bordes y subdividirlos: muros compartidos sin duplicar superficies.
const wallLines=new Map();function lineKey(axis,fixed){return axis+':'+fixed.toFixed(3)}
function sideEdge(r,side){if(side==='N'||side==='S')return {axis:'x',fixed:side==='N'?r.z0:r.z1,a:r.x0,b:r.x1};return {axis:'z',fixed:side==='W'?r.x0:r.x1,a:r.z0,b:r.z1}}
// Baldosas de grano fino y juntas discretas para el piso del hall.
const hallCanvas=document.createElement('canvas');hallCanvas.width=hallCanvas.height=512;const hallCtx=hallCanvas.getContext('2d');hallCtx.fillStyle='#929590';hallCtx.fillRect(0,0,512,512);let hallSeed=741;const hallRand=()=>{hallSeed=(Math.imul(hallSeed,1664525)+1013904223)>>>0;return hallSeed/4294967296};for(let i=0;i<55000;i++){hallCtx.fillStyle=i%2?'rgba(57,62,58,.22)':'rgba(213,216,205,.23)';const size=.4+hallRand()*1.2;hallCtx.fillRect(hallRand()*512,hallRand()*512,size,size)}hallCtx.strokeStyle='rgba(58,64,60,.28)';hallCtx.lineWidth=2;hallCtx.strokeRect(1,1,510,510);const hallFloor=new T.CanvasTexture(hallCanvas);hallFloor.colorSpace=T.SRGBColorSpace;hallFloor.wrapS=hallFloor.wrapT=T.RepeatWrapping;hallFloor.repeat.set(1/.6,1/.6);hallFloor.anisotropy=8;
for(const r of ambientes){const width=r.x1-r.x0,depth=r.z1-r.z0;const floorMat=mat(sectionColors[r.tipo]||'#bcb7a7');floorMat.map=['hall','espacio-hall','circulacion-central','ensanche-cooperadora','ingreso'].includes(r.id)?hallFloor:common.floor.map;floorMat.roughness=.94;const floor=patch((r.x0+r.x1)/2,(r.z0+r.z1)/2,width,depth,floorMat,'Suelo · '+r.nombre,.026);floor.userData.ambienteId=r.id;if(floorMat.map===hallFloor){const uv=floor.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)+r.x0,uv.getY(i)-r.z1);uv.needsUpdate=true;}
const label=textLabel(r.nombre,root,(r.x0+r.x1)/2,1.0,(r.z0+r.z1)/2,Math.min(3.5,width*.8));label.visible=false;inventario.rotulos.push(label);const furnitureGroup=furnish(r);inventario.ambientes.push({...r,suelo:floor,mobiliario:furnitureGroup,rotulo:label});
for(const side of ['N','S','W','E']){let edges=[sideEdge(r,side)];
// El frente de galería del aula de práctica conserva el retranqueo del modelo original.
if(r.id==='aula-sur-2'&&side==='N'){const split=r.x0+(r.x1-r.x0)*.42;edges=[{axis:'x',fixed:r.z0-.25,a:r.x0,b:split},{axis:'x',fixed:r.z0,a:split,b:r.x1},{axis:'z',fixed:split,a:r.z0-.25,b:r.z0}];}
if(r.id==='aula-sur-2'&&side==='W')edges.push({axis:'z',fixed:r.x0,a:r.z0-.25,b:r.z0});
for(const e of edges){const key=lineKey(e.axis,e.fixed);if(!wallLines.has(key))wallLines.set(key,{...e,edges:[],openings:[]});wallLines.get(key).edges.push({a:e.a,b:e.b,room:r,side});}}
for(const a of r.aberturas){let e=sideEdge(r,a.side);if(r.id==='aula-sur-2'&&a.side==='N'&&a.type==='window')e={...e,fixed:r.z0-.25};const center=e.a+(e.b-e.a)*a.at,width=Math.min(a.width,e.b-e.a-(a.sinJambas?0:.22));const o={...a,center,width,left:center-width/2,right:center+width/2,room:r,axis:e.axis,fixed:e.fixed};const line=wallLines.get(lineKey(e.axis,e.fixed));if(!line.openings.some(q=>Math.abs(q.center-center)<.07&&q.type===o.type&&Math.abs(q.sill-o.sill)<.07))line.openings.push(o)}}
function wallPiece(line,a,b,lo,hi,owners){if(b-a<.008||hi-lo<.008)return;const c=(a+b)/2,unique=[...new Map(owners.map(o=>[o.room.id,o])).values()];const exterior=unique.length===1,room=unique[0].room,insidePlus=line.axis==='x'?(room.z0+room.z1)/2>line.fixed:(room.x0+room.x1)/2>line.fixed;
 // Entre circulaciones contiguas no se construyen tabiques ni faldones colgando del cielorraso.
 if(unique.length>1&&unique.every(e=>e.room.tipo==='circulacion'))return;
 const inside=lo<.9?brick:lo<2?beige:cream,outer=lo>=3.5?cream:lo<.22?red:brick;
 function faceMaterial(positive){const owner=unique.find(e=>{const r=e.room;return (line.axis==='x'?(r.z0+r.z1)/2>line.fixed:(r.x0+r.x1)/2>line.fixed)===positive});if(!owner)return outer;if(owner.room.id==='espacio-hall')return lo>=2.7&&(line.axis==='x'||hi<=2.96)?cream:brick;if(owner.room.tipo==='circulacion')return lo<.22?red:lo>=2.7&&hi<=2.96?cream:brick;if(owner.room.id==='administracion')return preceptoriaWall;return inside}const plus=faceMaterial(true),minus=faceMaterial(false);
 const o=archBox(line.axis==='x'?c:line.fixed,(lo+hi)/2,line.axis==='x'?line.fixed:c,b-a,hi-lo,.18,[cream,cream,cream,cream,plus,minus]);if(line.axis==='z')o.rotation.y=Math.PI/2;physicalUV(o);if(lo<1.8&&hi>1.4)inventario.colisiones.push(o)}
function openingGroup(o){const g=new T.Group();g.position.set(o.axis==='x'?o.center:o.fixed,0,o.axis==='x'?o.fixed:o.center);if(o.axis==='z')g.rotation.y=Math.PI/2;root.add(g);g.name=(o.type==='window'?'Ventana · ':'Acceso · ')+o.room.nombre;inventario.aberturas.push({objeto:g,...o});return g}
for(const line of wallLines.values()){const breaks=[...new Set([...line.edges.flatMap(e=>[e.a,e.b]),...line.openings.flatMap(o=>[o.left,o.right])])].sort((a,b)=>a-b);
for(let i=0;i<breaks.length-1;i++){const a=breaks[i],b=breaks[i+1],mid=(a+b)/2,owners=line.edges.filter(e=>mid>e.a-.001&&mid<e.b+.001);if(!owners.length)continue;const holes=line.openings.filter(o=>mid>o.left-.001&&mid<o.right+.001);const yBreaks=[0,.22,.9,2,2.7,2.96,3.5,...holes.flatMap(o=>[o.sill,o.sill+o.height])].filter(v=>v>=0&&v<=3.5).sort((a,b)=>a-b);for(let k=0;k<yBreaks.length-1;k++){const lo=yBreaks[k],hi=yBreaks[k+1],cy=(lo+hi)/2;if(!holes.some(o=>cy>o.sill&&cy<o.sill+o.height))wallPiece(line,a,b,lo,hi,owners)}if(new Set(owners.map(e=>e.room.id)).size===1)wallPiece(line,a,b,3.5,4.2,owners)}
for(const o of line.openings){const g=openingGroup(o),w=o.width,bottom=o.sill,top=o.sill+o.height;
if(o.type==='window'&&o.height<.8){const n=Math.max(2,Math.round(w/.58));for(let i=0;i<n;i++){const panel=new T.Group();panel.position.set(-w/2+(i+.5)*w/n,top,0);panel.name='Paño superior vidriado';panel.userData.side=o.side;g.add(panel);archBox(0,-o.height/2,0,w/n-.035,o.height-.04,.025,glass,panel);for(const xx of [-w/n/2,w/n/2])archBox(xx,-o.height/2,0,.035,o.height,.055,frame,panel);for(const yy of [0,-o.height])archBox(0,yy,0,w/n-.035,.035,.055,frame,panel)}for(let i=0;i<=n;i++)archBox(-w/2+i*w/n,(bottom+top)/2,0,.035,o.height,.10,frame,g);for(const y of [bottom,top])archBox(0,y,0,w+.09,.055,.12,frame,g);
}else if(o.type==='window'){const pane=archBox(0,(bottom+top)/2,0,w-.05,o.height-.05,.018,glass,g);inventario.colisiones.push(pane);for(const x of [-w/2,0,w/2])archBox(x,(bottom+top)/2,0,.045,o.room.id==='deposito-interior'&&o.side==='E'?o.height+.05:o.height-.05,.10,frame,g);for(const y of [bottom,...(o.divisiones||[.70]).map(t=>bottom+o.height*t),top])archBox(0,y,0,w-.05,.05,.10,frame,g);
 if(!o.sinRejas)for(let x=-w/2+.12;x<w/2;x+=.22)archBox(x,(bottom+top)/2,.10,.012,o.height,.02,metal,g);
 archBox(0,bottom-.055,0,w+.16,.08,.27,white,g);
 if(o.room.id==='deposito-interior'&&o.side==='E'){for(const x of [-w/2-.045,w/2+.045])archBox(x,(bottom+top)/2,.115,.09,o.height+.10,.08,white,g);archBox(0,top+.045,.115,w+.18,.09,.08,white,g)}
}else if(o.type!=='passage'){for(const x of [-w/2,w/2])archBox(x,top/2,0,.06,top,.22,frame,g);archBox(0,top,0,w+.09,.06,.22,frame,g);
 const leaf=new T.Group();leaf.position.x=o.type==='entrance'?-w/2+.46:(o.hingeRight?w/2:-w/2);leaf.rotation.y=o.hingeRight?Math.PI-(o.openAngle??.54):(o.openAngle??.54);g.add(leaf);const leafW=o.type==='entrance'?(w-.92)/2:w;
 if(o.opaca){
 archBox(leafW/2,top/2,0,leafW-.06,top-.06,.055,frame,leaf);archBox(leafW-.12,1.02,.045,.025,.14,.03,metal,leaf);
 }else if(o.type==='entrance'){
 const doorHeight=2.48;archBox(leafW/2,doorHeight/2,.006,leafW-.06,doorHeight-.06,.018,glass,leaf);for(const x of [.025,leafW-.025])archBox(x,doorHeight/2,0,.045,doorHeight,.08,frame,leaf);for(const y of [.025,1.08,doorHeight-.025])archBox(leafW/2,y,0,leafW,.05,.08,frame,leaf);archBox(leafW-.11,1.02,.065,.025,.14,.025,metal,leaf);for(const sign of [-1,1]){const x=sign*(w/2-.23);archBox(x,doorHeight/2,0,.40,doorHeight-.05,.018,glass,g);for(const y of [.03,1.08,doorHeight])archBox(x,y,0,.46,.045,.08,frame,g);archBox(sign*(w/2-.46),doorHeight/2,0,.05,doorHeight,.08,frame,g)}archBox(0,doorHeight,0,w,.055,.10,frame,g);
 }else if(o.estiloPreceptoria){
 // Hoja liviana de carpintería clara y paño fijo sobre la puerta.
 const leafTop=2.16;archBox(leafW/2,leafTop/2,.006,leafW-.07,leafTop-.08,.012,glass,leaf);
 for(const x of [.025,leafW-.025])archBox(x,leafTop/2,0,.045,leafTop,.075,frame,leaf);
 for(const y of [.04,1.10,leafTop-.03])archBox(leafW/2,y,0,leafW-.045,.035,.075,frame,leaf);
 archBox(leafW-.12,1.0,.07,.025,.13,.025,metal,leaf);
 archBox(0,(leafTop+top)/2,0,w-.07,top-leafTop-.06,.012,glass,g);
 archBox(0,leafTop,0,w-.05,.045,.10,frame,g);
 }else{
 archBox(leafW/2,.38,.025,leafW-.05,.72,.055,common.frame,leaf);// Separar el vidrio de los perfiles y no escribir profundidad evita saltos de transparencia.
 archBox(leafW/2,(.76+top)/2,.006,leafW-.07,top-.80,.012,glass,leaf);for(const x of [.025,leafW-.025])archBox(x,top/2,0,.045,top,.075,frame,leaf);for(const y of [.76,top*.68,top-.04])archBox(leafW/2,y,0,leafW,.035,.075,frame,leaf);archBox(leafW-.12,1.0,.07,.025,.13,.025,metal,leaf);
 }
 if(o.type==='entrance'){const second=leaf.clone(true);second.position.x=w/2-.46;second.rotation.y=Math.PI-.54;g.add(second)}
 // Placa pequeña sobre el acceso, orientada como la carpintería.
 if(!o.estiloPreceptoria&&!o.sinRotulo){const plate=textLabel(o.room.nombre,g,0,top+.20,.14,Math.min(w+1,2));plate.visible=false;const plaque=new T.Mesh(new T.PlaneGeometry(Math.min(w+.3,1.7),.28),clipped(new T.MeshStandardMaterial({map:plate.material.map,roughness:1,side:T.DoubleSide})));const exteriorSign=o.side==='N'||o.side==='W';plaque.position.set(0,top+.20,exteriorSign?-.12:.12);if(exteriorSign)plaque.rotation.y=Math.PI;g.add(plaque);g.remove(plate);plate.material.dispose();}
}else if(!o.sinJambas){for(const x of [-w/2,w/2])archBox(x,top/2,0,.07,top,.24,cream,g)}}}

// Remate cuadrado de los dos muros en la esquina del Centro de Estudiantes.
const esquinaCentro=archBox(26,1.75,7.2,.21,3.5,.21,cream);esquinaCentro.name='Esquina cuadrada del Centro de Estudiantes';
const esquinaEspacio=archBox(22.5,1.75,7.2,.21,3.5,.21,cream);esquinaEspacio.name='Esquina cuadrada del espacio del hall';
const esquinaDeposito=archBox(22.5,1.35,5.8,.24,2.70,.24,cream);esquinaDeposito.name='Remate cuadrado junto al depósito';

// Dintel del paso junto al depósito, alineado con la franja de los muros.
for(const [lo,hi,material] of [[2.70,2.96,cream],[2.96,3.50,brick]]){const tramo=archBox(22.5,(lo+hi)/2,6.5,1.4,hi-lo,.18,material);tramo.rotation.y=Math.PI/2;tramo.name='Pared superior del paso al depósito';physicalUV(tramo)}

// Cubiertas por alas, y planos que conservan la sombra aunque se oculten los techos.
for(const zone of zonasCubierta){const g=new T.Group();g.position.set(zone.x,0,zone.z);g.rotation.y=zone.rotation;g.name='Cubierta · '+zone.nombre;root.add(g);roof(zone.length,zone.depth,g);for(const xx of [-zone.length/2,zone.length/2]){const end=new T.BufferGeometry();end.setAttribute('position',new T.Float32BufferAttribute([xx,4.2,0,xx,4.2,-zone.depth,xx,5.2,-zone.depth/2],3));end.setIndex([0,1,2,2,1,0]);end.computeVertexNormals();add(end,cream,g)}inventario.cubiertas.push(g);const blocker=new T.Mesh(new T.PlaneGeometry(zone.length,zone.depth),new T.MeshBasicMaterial({colorWrite:false,depthWrite:false,side:T.DoubleSide}));blocker.rotation.x=-Math.PI/2;blocker.position.set(0,3.66,-zone.depth/2);blocker.castShadow=true;const bg=new T.Group();bg.position.copy(g.position);bg.rotation.copy(g.rotation);bg.add(blocker);root.add(bg);
 // Canaletas y bajadas en extremos y encuentros.
rod([-zone.length/2,3.58,.12],[zone.length/2,3.58,.12],.045,frame,g);for(let t=0;t<=zone.length+.01;t+=7.5)rod([-zone.length/2+t,3.58,.12],[-zone.length/2+t,.12,.12],.042,frame,g)}
// Cielorrasos solo visibles al caminar dentro; no tapan la planta.
const ceilings=new T.Group();ceilings.name='Cielorrasos interiores';root.add(ceilings);for(const r of ambientes){const c=box((r.x0+r.x1)/2,3.51,(r.z0+r.z1)/2,r.x1-r.x0,.035,r.z1-r.z0,cream,ceilings);c.receiveShadow=true;c.userData.ambienteId=r.id}ceilings.visible=false;
// Galerías interior y exterior de la tira norte y galería de las cuatro aulas.
for(const spec of [{x:0,z:13.2,len:30,rot:Math.PI},{x:0,z:-13.2,len:30,rot:0},{x:9.2,z:-20.6,len:48.4,rot:Math.PI}]){const g=new T.Group();g.position.set(spec.x,0,spec.z);g.rotation.y=spec.rot;root.add(g);const gal=gallery(spec.len,2.2,g),cover=new T.Group();cover.name='Techo galería';for(const child of [...gal.children])if(child.isMesh&&child.position.y>3)cover.add(child);gal.add(cover);inventario.cubiertas.push(cover);}
// Marquesina del ingreso principal, escalones y rampa.
const entrance=new T.Group();entrance.position.set(24.25,0,20.6);root.add(entrance);entrance.name='Pórtico del ingreso principal';for(const x of [-1.9,1.9])archBox(x,1.8,.7,.25,3.6,.25,cream,entrance);const portalRoof=new T.Group();portalRoof.position.set(0,-.65,1.7);entrance.add(portalRoof);roof(4.5,1.8,portalRoof);inventario.cubiertas.push(portalRoof);for(let i=0;i<3;i++)box(0,.035*(i+1),1.05-i*.28,3.7,.07*(i+1),.3,white,entrance);const ramp=box(3.1,.06,.3,1.4,.11,2.6,washed,entrance);ramp.rotation.x=-.045;
textLabel('ESCUELA · AUGUSTO NIEZ',entrance,0,3.55,1.05,3.6);
// Faroles, zócalos y detalles sobre los frentes de calle.
for(let x=-14.8;x<33.4;x+=7.5){archBox(x,1.78,20.67,.16,3.55,.14,white);rod([x,4.15,20.8],[x,.1,20.8],.035,frame);box(x+.25,2.80,20.79,.17,.22,.10,mat('#e3e0c9',{emissive:'#dfdfbe',emissiveIntensity:.18}));}
// La vereda y la calle se prolongan hasta el extremo oriental del edificio.
for(const name of ['Vereda calle de los Viñedos','Calle de los Viñedos']){const o=root.getObjectByName(name);if(o){const old=o.geometry;o.geometry=new T.PlaneGeometry(64,o.geometry.parameters.height);old.dispose();o.position.x=8.6}}
const sitePad=patch(9.2,21.3,48.4,1.4,washed,'Vereda frontal completa',-.045);
// Lectura del plano: límites y rótulos de sectores solo en vista de planta.
function setInteriorMode(cut,walking=false){for(const room of inventario.ambientes)room.suelo.material.color.set(cut&&!walking?(sectionColors[room.tipo]||'#bcb7a7'):'#ffffff');for(const g of inventario.cubiertas)g.visible=!cut||walking;wallPlane.constant=cut&&!walking?1.08:50;for(const r of inventario.rotulos)r.visible=cut&&!walking;ceilings.visible=walking}
detallarReferenciaEscuela({T,root,inventario,H,archBox,clipped,physicalUV,ceilings});
// Filtrado oblicuo de las texturas de ladrillo, marcos y pisos durante el recorrido.
root.traverse(o=>{if(!o.isMesh)return;for(const m of (Array.isArray(o.material)?o.material:[o.material]))for(const key of ['map','normalMap','roughnessMap'])if(m[key])m[key].anisotropy=8});
return {...patio,ambientes:inventario.ambientes,setInteriorMode,wallPlane,ceilings};
}
