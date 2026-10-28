import * as T from './vendor/three.module.js';
import {medidasPatio as P} from './patio-config.js';
import {surfaceTexture,applyRoomTextures} from './texturas.js';

export function crearPatio({conEdificios=true}={}){
const root=new T.Group();root.name='Patio escolar';const inventario={canteros:[],bancos:[],arboles:[],galerias:[],aula:null};
const mat=(c,e={})=>new T.MeshStandardMaterial({color:c,roughness:.9,...e});
const common={cream:mat('#e8dfbf'),beige:mat('#c6ad93'),brick:mat('#ffffff'),floor:mat('#aaa89b'),frame:mat('#cbd1c8'),glass:mat('#b6c5c2',{transparent:true,opacity:.35}),black:mat('#303d37'),curtain:mat('#1694b1')};applyRoomTextures(common);
const red=mat('#823d35'),rim=mat('#c0b28d'),soil=mat('#575243'),roofMat=mat('#444d4a',{metalness:.24,roughness:.75,side:T.DoubleSide}),metal=mat('#333f37',{metalness:.45}),concrete=mat('#b2ada0'),dark=mat('#354039'),grout=mat('#898e82'),white=mat('#d8d2ba'),grass=mat('#7a8662');
const washed=mat('#ffffff');washed.map=surfaceTexture({color:'#a79d89',seed:211,grain:31,paintWear:150});washed.map.repeat.set(.7,.7);washed.bumpMap=washed.map;washed.bumpScale=.003;
const wear=surfaceTexture({color:'#823d35',seed:218,grain:16,scratches:100,paintWear:170});red.color.set('#ffffff');red.map=wear;red.bumpMap=wear;red.bumpScale=.001;
function add(geo,m,parent=root,name){const o=new T.Mesh(geo,m);o.castShadow=!(m.transparent&&m.opacity<.5);o.receiveShadow=true;if(name)o.name=name;parent.add(o);return o}
function box(x,y,z,w,h,d,m,parent=root,name){const o=add(new T.BoxGeometry(w,h,d),m,parent,name);o.position.set(x,y,z);return o}
function rod(a,b,r,m,parent=root,endR=r){const va=new T.Vector3(...a),vb=new T.Vector3(...b);const o=add(new T.CylinderGeometry(endR,r,va.distanceTo(vb),8),m,parent);o.position.copy(va).add(vb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return o}
function patch(x,z,w,d,m,name,y=0){const g=new T.PlaneGeometry(w,d);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w,uv.getY(i)*d);const o=add(g,m,root,name);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);return o}
function facePanel(x,y,w,h,m,parent){const o=box(x,y,0,w,h,.20,m,parent);const pos=o.geometry.attributes.position,uv=o.geometry.attributes.uv;const sx=m===common.brick?.92:2,sy=m===common.brick?.48:2;for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/sx,(pos.getY(i)+y)/sy);return o}
function pier(x,parent){facePanel(x,.13,.28,.26,red,parent);facePanel(x,1.84,.22,3.16,common.cream,parent)}
function door(cx,parent,gate=false){const w=gate?1.7:1.1,h=gate?2.8:2.25;for(const x of [cx-w/2,cx+w/2])box(x,h/2,-.02,.065,h,.18,gate?metal:common.frame,parent);box(cx,h,-.02,w,.055,.18,gate?metal:common.frame,parent);
 if(gate){for(let x=cx-w/2+.10;x<cx+w/2;x+=.14)box(x,h/2,0,.024,h,.035,metal,parent);for(const y of [.5,1.7])box(cx,y,0,w,.03,.04,metal,parent)}else{box(cx,.34,.02,w-.07,.64,.055,common.frame,parent);box(cx,1.42,.02,w-.08,1.45,.018,common.glass,parent);for(const y of [.7,1.36,1.95])box(cx,y,0,w,.035,.07,common.frame,parent);box(cx+.39,1.02,.075,.025,.12,.025,metal,parent)}}
function window(cx,width,parent,sill=.95,height=1.65,shutters=false){const cy=sill+height/2;box(cx,cy,.02,width+.22,height+.22,.055,white,parent);box(cx,cy,.06,width,height,.03,common.glass,parent);for(const x of [-width/2,0,width/2])box(cx+x,cy,.09,.045,height,.055,common.frame,parent);for(const y of [sill,sill+height*.68,sill+height])box(cx,y,.09,width,.05,.055,common.frame,parent);
 if(shutters)for(let y=sill+.04;y<sill+height;y+=.09)box(cx,y,.11,width-.06,.065,.02,common.frame,parent);
 else{for(let x=cx-width/2+.12;x<cx+width/2;x+=.23)box(x,cy,.15,.016,height,.025,metal,parent);box(cx,cy,.15,width,.02,.025,metal,parent)}}
function facade(length,parent,{doors=[],windows=[]}={}){const openings=[...doors.map(d=>({x:d.x,w:d.gate?1.7:1.1,sill:0,top:d.gate?2.8:2.25,door:d})),...windows.map(w=>({x:w.x,w:w.w,sill:w.sill??.95,top:(w.sill??.95)+(w.h??1.65),window:w}))].sort((a,b)=>a.x-b.x);let cursor=-length/2;
 for(const o of openings){const left=o.x-o.w/2,right=o.x+o.w/2;if(left>cursor){facePanel((cursor+left)/2,.11,left-cursor,.22,red,parent);facePanel((cursor+left)/2,1.86,left-cursor,3.28,common.brick,parent)}if(o.sill>0){facePanel(o.x,.11,o.w,.22,red,parent);facePanel(o.x,(.22+o.sill)/2,o.w,o.sill-.22,common.brick,parent)}facePanel(o.x,(o.top+3.5)/2,o.w,3.5-o.top,common.brick,parent);if(o.door)door(o.x,parent,o.door.gate);else window(o.x,o.w,parent,o.window.sill??.95,o.window.h??1.65,o.window.shutters);cursor=right}
 if(cursor<length/2){facePanel((cursor+length/2)/2,.11,length/2-cursor,.22,red,parent);facePanel((cursor+length/2)/2,1.86,length/2-cursor,3.28,common.brick,parent)}
 facePanel(0,3.68,length,.36,common.cream,parent);facePanel(0,4.03,length,.34,common.cream,parent)}
function roof(length,depth,parent){for(const side of [-1,1]){const xs=[-length/2-.25,length/2+.25],z0=-depth/2,z1=z0+side*(depth/2+.32);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([xs[0],P.cumbrera,z0,xs[1],P.cumbrera,z0,xs[0],P.alero,z1,xs[1],P.alero,z1],3));g.setIndex(side>0?[0,2,1,1,2,3]:[0,1,2,1,3,2]);g.computeVertexNormals();add(g,roofMat,parent);for(let x=xs[0];x<xs[1];x+=.52)rod([x,P.cumbrera+.015,z0],[x,P.alero+.015,z1],.011,roofMat,parent)}
 rod([-length/2-.26,P.cumbrera,-depth/2],[length/2+.26,P.cumbrera,-depth/2],.035,roofMat,parent)}
function envelope(length,depth,parent,gaps=[]){let cursor=-length/2;for(const gap of [...gaps].sort((a,b)=>a-b)){const left=gap-.9,right=gap+.9;if(left>cursor)box((cursor+left)/2,2.08,-depth,left-cursor,4.16,.20,common.brick,parent);box(gap,3.49,-depth,1.8,1.34,.20,common.brick,parent);cursor=right}if(cursor<length/2)box((cursor+length/2)/2,2.08,-depth,length/2-cursor,4.16,.20,common.brick,parent);for(const xx of [-length/2,length/2]){box(xx,2.08,-depth/2,.20,4.16,depth,common.brick,parent);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([xx,4.16,0,xx,4.16,-depth,xx,P.cumbrera,-depth/2],3));g.setIndex([0,1,2,2,1,0]);g.computeVertexNormals();add(g,common.cream,parent)}}
function gallery(length,depth,parent){const g=new T.Group();g.name='Galería cubierta';parent.add(g);inventario.galerias.push(g);box(0,.025,depth/2,length,.05,depth,washed,g);box(0,3.35,depth/2,length,.16,depth+.12,common.cream,g);box(0,3.17,depth-.04,length,.36,.16,common.beige,g);for(let x=-length/2;x<=length/2+.01;x+=3.75){box(x,1.61,depth-.1,.17,3.22,.17,common.cream,g);box(x,.34,depth-.1,.185,.68,.185,red,g)}return g}
const W=P.ancho,D=P.profundidad,G=P.galeria,A=P.aulaProfundidad;
// Baldosas exteriores de cemento: juntas continuas y variación tenue, sin brillo.
grass.map=surfaceTexture({color:'#7c8b68',seed:471,grain:40,paintWear:80});grass.color.set('#ffffff');
patch(0,0,90,85,grass,'Terreno exterior',-.12);
const tileCanvas=document.createElement('canvas');tileCanvas.width=tileCanvas.height=1024;
const tileCtx=tileCanvas.getContext('2d'),tileRandom=rng(241);tileCtx.fillStyle='#777770';tileCtx.fillRect(0,0,1024,1024);
for(let row=0;row<4;row++)for(let col=0;col<4;col++){const x=col*256,y=row*256,shade=Math.round((tileRandom()-.5)*15);tileCtx.fillStyle=`rgb(${153+shade},${150+shade},${143+shade})`;tileCtx.fillRect(x+4,y+4,248,248);for(let n=0;n<2000;n++){const light=tileRandom()>.5;tileCtx.fillStyle=light?'rgba(225,220,205,.08)':'rgba(55,55,51,.08)';const sz=.5+tileRandom()*1.6;tileCtx.fillRect(x+6+tileRandom()*244,y+6+tileRandom()*244,sz,sz)}}
const tileTexture=new T.CanvasTexture(tileCanvas);tileTexture.colorSpace=T.SRGBColorSpace;tileTexture.wrapS=tileTexture.wrapT=T.RepeatWrapping;tileTexture.repeat.set(1/2.4,1/2.4);tileTexture.anisotropy=8;
const patioTile=mat('#ffffff',{map:tileTexture,roughness:1,metalness:0});
patch(0,0,W,D,patioTile,'Patio de baldosas');
if(conEdificios){
// Lado sur: cuatro aulas, incluida la de la práctica, y galería al patio.
const south=new T.Group();south.position.set(0,0,D/2+G);south.rotation.y=Math.PI;root.add(south);south.name='Ala de cuatro aulas';
const southDoors=[],southWindows=[];for(let i=0;i<4;i++){const cx=-W/2+P.aulaAncho*(i+.5);southDoors.push({x:cx-2.85});southWindows.push({x:cx+.8,w:3.25});}
facade(W,south,{doors:southDoors,windows:southWindows});roof(W,A,south);envelope(W,A,south);gallery(W,G,south);
// El giro de la fachada invierte el eje local: el aula elegida es la segunda desde Alvear.
const aulaMarker=new T.Group();aulaMarker.name='Acceso al aula de práctica';aulaMarker.position.set(-3.75,.15,D/2+G-.13);root.add(aulaMarker);inventario.aula=aulaMarker;
box(-3.75,.027,D/2+G-.5,6.9,.035,.65,mat('#a1b296'),root,'Umbral de referencia del aula');
// Norte: aulas y sanitarios, con ventilaciones altas y pasos enrejados.
const north=new T.Group();north.position.set(0,0,-D/2-G);root.add(north);north.name='Ala norte';facade(W,north,{doors:[{x:-8.7},{x:-1.1},{x:9.7},{x:13.8,gate:true}],windows:[{x:-12.2,w:2.5},{x:-5,w:2.5},{x:2,w:2.8,sill:2.3,h:.47},{x:6,w:2.3}]});roof(W,A,north);envelope(W,A,north,[13.8]);gallery(W,G,north);
// Bloque este junto a los canteros: fachada completa de ladrillo y persianas claras.
const east=new T.Group();east.position.set(W/2,0,0);east.rotation.y=-Math.PI/2;root.add(east);east.name='Fachada de aulas junto a los canteros';facade(D,east,{doors:[{x:-9.7,gate:true},{x:9.6,gate:true}],windows:[{x:-5.5,w:2.15,shutters:true},{x:-.1,w:2.15,shutters:true},{x:5.2,w:2.15,shutters:true}]});roof(D,A,east);envelope(D,A,east,[-9.7,9.6]);
for(let z=-D/2;z<=D/2;z+=5.5){box(W/2-.07,1.85,z,.14,3.7,.23,white);rod([W/2-.22,3.7,z],[W/2-.22,.12,z],.045,common.frame)}
box(W/2-.30,3.04,1.5,.42,.52,.76,common.frame);for(let z=1.23;z<1.8;z+=.065)box(W/2-.525,3.04,z,.012,.35,.018,metal);
// Pasos de conexión a ingreso principal y fondo de la institución.
box(W/2+G/2,.02,D/2+G+A/2,G,.04,A,washed);for(let z of [-D/2,D/2]){box(W/2+G/2,3.2,z,G,.18,2.2,common.cream);for(let x of [W/2,W/2+G])box(x,1.6,z,.18,3.2,.18,common.cream)}
}
// Cierre hacia Alvear: murete, rejas, pilares y acceso secundario.
const westX=-W/2;for(let z=-D/2,index=0;z<D/2;z+=3.65,index++){const gate=index===0,open=gate||index===2||index===4;const len=Math.min(3.65,D/2-z);if(!gate)box(westX,open?.32:.75,z+len/2,.22,open?.64:1.5,len,common.beige);box(westX,1.4,z,.34,2.8,.34,common.cream);const base=gate?0:open?.64:1.5;for(let k=z+.17;k<z+len-.1;k+=.17)box(westX,(base+2.6)/2,k,.028,2.6-base,.025,metal);for(const y of [Math.max(base+.04,1.53),2.6])box(westX,y,z+len/2,.04,.035,len,metal)}
// Plataforma de mástil y canteros angulares que muestra el plano.
const platformShape=new T.Shape();[[-15,-4],[-13.8,-3.5],[-13.8,-2.2],[-12.8,-1.6],[-12.8,1.6],[-13.8,2.2],[-13.8,3.5],[-15,4]].forEach(([x,z],i)=>i?platformShape.lineTo(x,-z):platformShape.moveTo(x,-z));platformShape.closePath();const platform=add(new T.ShapeGeometry(platformShape),concrete,root,'Plataforma de mástil');platform.rotation.x=-Math.PI/2;platform.position.y=.055;
rod([P.mastil.x,.08,0],[P.mastil.x,P.mastil.altura,0],.035,common.frame,root,.018);rod([P.mastil.x+.055,.4,0],[P.mastil.x+.055,P.mastil.altura-.25,0],.003,white);box(P.mastil.x,.12,0,.6,.24,.6,concrete);
// Bandera argentina izada: tela con pliegues estáticos y textura local, también visible del reverso.
const flagCanvas=document.createElement('canvas');flagCanvas.width=1024;flagCanvas.height=640;
const flagCtx=flagCanvas.getContext('2d');
flagCtx.fillStyle='#75b9e0';flagCtx.fillRect(0,0,1024,640);
flagCtx.fillStyle='#f5f5ed';flagCtx.fillRect(0,640/3,1024,640/3);
flagCtx.save();flagCtx.translate(512,320);flagCtx.fillStyle='#e5ac30';flagCtx.strokeStyle='#a77524';flagCtx.lineWidth=1.2;
for(let i=0;i<32;i++){const a=i*Math.PI/16;flagCtx.save();flagCtx.rotate(a);flagCtx.beginPath();flagCtx.moveTo(-3,-29);if(i%2){flagCtx.bezierCurveTo(-12,-41,9,-45,0,-59);flagCtx.bezierCurveTo(13,-46,-3,-40,3,-29)}else{flagCtx.lineTo(0,-59);flagCtx.lineTo(3,-29)}flagCtx.closePath();flagCtx.fill();flagCtx.stroke();flagCtx.restore()}
flagCtx.beginPath();flagCtx.arc(0,0,30,0,Math.PI*2);flagCtx.fill();flagCtx.stroke();
flagCtx.strokeStyle='#93631f';flagCtx.lineWidth=1.5;
for(const x of [-10,10]){flagCtx.beginPath();flagCtx.ellipse(x,-5,5,2,0,0,Math.PI*2);flagCtx.stroke()}
flagCtx.beginPath();flagCtx.moveTo(0,-2);flagCtx.lineTo(-3,8);flagCtx.lineTo(3,8);flagCtx.stroke();
flagCtx.beginPath();flagCtx.arc(0,10,10,.25,Math.PI-.25);flagCtx.stroke();flagCtx.restore();
const flagTexture=new T.CanvasTexture(flagCanvas);flagTexture.colorSpace=T.SRGBColorSpace;flagTexture.anisotropy=4;
const flagMaterial=mat('#ffffff',{map:flagTexture,side:T.DoubleSide,roughness:.96});
const flagWidth=1.68,flagHeight=1.05,flagGeo=new T.PlaneGeometry(flagWidth,flagHeight,40,24),flagVertices=flagGeo.attributes.position;
for(let i=0;i<flagVertices.count;i++){const u=(flagVertices.getX(i)+flagWidth/2)/flagWidth,v=(flagVertices.getY(i)+flagHeight/2)/flagHeight;flagVertices.setXYZ(i,u*flagWidth,-(1-v)*flagHeight-.11*Math.pow(u,1.4),u*(.10*Math.sin(u*Math.PI*3+(1-v)*1.5)+.018*Math.sin(u*Math.PI*16)))}
flagGeo.computeVertexNormals();const flag=add(flagGeo,flagMaterial,root,'Bandera argentina del mástil');
flag.position.set(P.mastil.x+.028,P.mastil.altura-.25,P.mastil.z??0);flag.rotation.y=.45;
flag.userData={ancho:flagWidth,alto:flagHeight,detalle:'Celeste, blanco, celeste y Sol de Mayo; tela anclada al mástil'};
inventario.bandera=flag;
for(const z of [-3,3]){box(-14.4,.14,z,1.1,.28,1.0,white);for(let x=-14.9;x<-13.9;x+=.16){const stripe=box(x,.287,z,.08,.015,.95,red);stripe.rotation.y=.32}}
// Vegetación determinista, con ramas y hojas instanciadas, sin texturas remotas.
function rng(seed){let n=seed;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296}}
function plant(x,z,seed,parent,base=.35){const r=rng(seed),g=new T.Group();g.position.set(x,base,z);parent.add(g);for(let j=0;j<12;j++){const angle=j*Math.PI*2/12+r()*.2,len=.32+r()*.4,verts=[],indices=[];for(let i=0;i<=10;i++){const t=i/10,width=Math.sin(t*Math.PI)*.09;for(const side of [-1,1])verts.push(Math.sin(angle)*len*t+Math.cos(angle)*width*side,Math.sin(t*Math.PI*.9)*len*.5,Math.cos(angle)*len*t-Math.sin(angle)*width*side);if(i<10){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2)}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();add(geo,mat(j%2?'#385d3b':'#4e7045',{side:T.DoubleSide}),g)}}
function tree(x,z,height,seed){const r=rng(seed),g=new T.Group();g.name='Árbol de cantero';g.position.set(x,.40,z);root.add(g);inventario.arboles.push(g);const bark=mat('#665f4d');bark.map=surfaceTexture({color:'#665f4d',seed,grain:30,scratches:90});rod([0,0,0],[.14,height*.64,.03],.12,bark,g,.055);for(let i=0;i<23;i++){const a=i*2.39996,start=[.1,height*.30+i*.04,0],end=[Math.sin(a)*(.6+r()*.9),height*(.56+r()*.32),Math.cos(a)*(.6+r()*.9)];rod(start,end,.024,bark,g,.008)}
const leafGeo=new T.SphereGeometry(1,5,3),leafMat=mat('#4e6840'),count=1600,leaves=new T.InstancedMesh(leafGeo,leafMat,count),dummy=new T.Object3D();for(let i=0;i<count;i++){const a=r()*Math.PI*2,u=r()*2-1,rr=Math.cbrt(r()),v=Math.sqrt(1-u*u),rad=1.8;dummy.position.set(Math.cos(a)*v*rr*rad+.12, height*.72+u*rr*height*.28,Math.sin(a)*v*rr*rad);dummy.rotation.set(r()*3,r()*6,r()*3);dummy.scale.set(.07+r()*.09,.018+r()*.018,.035+r()*.035);dummy.updateMatrix();leaves.setMatrixAt(i,dummy.matrix);leaves.setColorAt(i,new T.Color().setHSL(.20+r()*.08,.18+r()*.18,.15+r()*.15))}leaves.castShadow=true;leaves.receiveShadow=true;g.add(leaves);return g}
// Árboles y vegetación detrás del cierre, visibles desde el mástil.
for(const [x,z,h,seed,sx,sz] of [[-24.6,-10,6.3,901,1.15,.9],[-26,-6.4,7.2,902,1.2,1.35],[-24.7,-2.7,6.8,903,1.4,1.15],[-26.5,3.1,7.5,904,1.15,1.4],[-24.5,8.5,6.1,905,1.3,1.1]]){const exteriorTree=tree(x,z,h,seed);exteriorTree.position.y=-.11;exteriorTree.scale.set(sx,1,sz)}
for(let i=0;i<13;i++)plant(-24.1-(i%3)*.55,-10+i*1.65,1000+i,root,0);
// Arbustos y árboles de distintas alturas tras la calle, agrupados como en la referencia.
const shrubsRng=rng(7182),shrubs=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),mat('#ffffff'),180),shrubTransform=new T.Object3D();
shrubs.name='Arbustos exteriores detrás del mástil';
for(let i=0;i<180;i++){const z=-13+(i%45)*.59+(shrubsRng()-.5)*.4,x=-24.0-Math.floor(i/45)*.85+(shrubsRng()-.5)*.55,h=.45+shrubsRng()*.8;shrubTransform.position.set(x,-.11+h*.48,z);shrubTransform.rotation.y=shrubsRng()*6.28;shrubTransform.scale.set(.35+shrubsRng()*.3,h*.58,.32+shrubsRng()*.25);shrubTransform.updateMatrix();shrubs.setMatrixAt(i,shrubTransform.matrix);shrubs.setColorAt(i,new T.Color().setHSL(.23+shrubsRng()*.08,.24+shrubsRng()*.15,.19+shrubsRng()*.13))}
shrubs.castShadow=true;shrubs.receiveShadow=true;root.add(shrubs);
for(const [x,z,h,seed] of [[-30,-12,7.2,1201],[-30,-5,8.0,1202],[-31,2,7.1,1203],[-30,10,8.2,1204]]){const t=tree(x,z,h,seed);t.position.y=-.11;t.scale.set(1.2,1,1.15)}
function ring(x,z,outer,inner,height,y,m,name){const shape=new T.Shape();shape.absarc(0,0,outer,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,inner,0,Math.PI*2,true);shape.holes.push(hole);const o=add(new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:64}),m,root,name);o.rotation.x=-Math.PI/2;o.position.set(x,y,z);return o}
function bench(x,z,rotation=0){const g=new T.Group();g.name='Banco rojo de hormigón';g.position.set(x,0,z);g.rotation.y=rotation;root.add(g);box(0,.43,0,2.2,.12,.48,red,g);for(const xx of [-.72,.72])box(xx,.19,0,.24,.38,.39,red,g);inventario.bancos.push(g)}
for(let i=0;i<P.canteros.length;i++){const c=P.canteros[i];ring(c.x,c.z,c.radio,c.radio-.20,.34,.03,red,'Cantero rojo');ring(c.x,c.z,c.radio+.035,c.radio-.23,.065,.37,rim,'Coronamiento de cantero');const earth=add(new T.CircleGeometry(c.radio-.20,64),soil);earth.rotation.x=-Math.PI/2;earth.position.set(c.x,.35,c.z);inventario.canteros.push({x:c.x,z:c.z,radio:c.radio});tree(c.x,c.z,c.alturaArbol,71+i);for(let j=0;j<10;j++){const a=j*Math.PI*2/10;plant(c.x+Math.sin(a)*c.radio*.57,c.z+Math.cos(a)*c.radio*.57,300+i*20+j,root)}
bench(13.7,c.z,Math.PI/2);bench(c.x,c.z+2.55);bench(12.5,c.z+2.55);bench(12.5,c.z-2.55)}
// Desagües en el hormigón lavado.
for(const [x,z] of [[4,7.8],[-8,-3],[9.5,1.5]]){box(x,.017,z,.58,.025,.42,metal);for(let i=0;i<9;i++)box(x-.24+i*.06,.034,z,.012,.012,.38,concrete)}
// Rampas suaves en los dos extremos de las galerías, sin escalones en el patio.
for(const z of [-D/2,D/2]){const ramp=box(-2,.036,z,4,.06,1.1,washed);ramp.rotation.x=z>0?-.035:.035}
patch(-W/2-1.8,0,2.5,D+2*G+2*A,washed,'Vereda Alvear',-.06);patch(0,D/2+G+A+2,W+2*A,2.5,washed,'Vereda calle de los Viñedos',-.06);
patch(-W/2-5.5,0,5,D+2*G+2*A+10,mat('#727975'),'Calle Alvear',-.11);patch(0,D/2+G+A+5.5,W+2*A+12,5,mat('#727975'),'Calle de los Viñedos',-.11);
return {root,inventario,medidas:P,herramientas:{mat,add,box,rod,patch,facePanel,facade,roof,envelope,gallery,common,red,white,washed,metal,roofMat,concrete}};
}
