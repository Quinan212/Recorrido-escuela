import * as THREE from './vendor/three.module.js';
import {personas,crearPersona} from './personajes.js?v=20261031-personajes';
import {asignaciones,filasPreferidas,perfilesDeRol} from './asientos.js';
import {applyFurnitureTextures,applyRoomTextures} from './texturas.js';
// Mobiliario y posiciones de la versión del aula, reutilizados sin mover sus asientos.
export function crearMobiliarioAula(){
const model=new THREE.Group();model.name='Aula de práctica · mobiliario original';
const w=7.5,d=7.4,R=w/2,L=-w/2,B=d/2;let activeSide=null;
const $=selector=>({checked:false,value:selector==='#rows0'||selector==='#rows3'?4:2});
const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.85,...extra});
const mats={cream:mat('#eee9cf'),beige:mat('#c5aa95'),brick:mat('#ffffff'),floor:mat('#999c96'),frame:mat('#c8cfcb'),glass:mat('#b8cdca',{transparent:true,opacity:.23}),black:mat('#252b2a'),curtain:mat('#168eae',{side:THREE.DoubleSide}),white:mat('#ededdf'),dark:mat('#343d38'),red:mat('#b73a35'),blue:mat('#72bdcf')};
applyRoomTextures(mats);
function mesh(geo,m,parent=model){const o=new THREE.Mesh(geo,m);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function box(x,y,z,w,h,d,m,parent=model){if(Math.min(w,h,d)<=0)return;const o=mesh(new THREE.BoxGeometry(w,h,d),m,parent);o.position.set(x,y,z);return o}
function rod(a,b,r,m,parent=model){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);const o=mesh(new THREE.CylinderGeometry(r,r,av.distanceTo(bv),8),m,parent);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());return o}
function curtain(cx,y,z,width,height){const geo=new THREE.PlaneGeometry(width,height,48,24),pos=geo.attributes.position;for(let i=0;i<pos.count;i++)pos.setZ(i,Math.sin(pos.getX(i)/width*Math.PI*12)*.055);geo.computeVertexNormals();const o=mesh(geo,mats.curtain);o.position.set(cx,y,z);o.name='Cortina de tela';for(let i=0;i<6;i++)box(cx-width/2+width*(i+.5)/6,y+height/2+.035,z,.035,.085,.018,mats.curtain);return o}
function tiedCurtain(cx,z,width){const height=1.63,geo=new THREE.PlaneGeometry(width,height,36,36),pos=geo.attributes.position;
for(let i=0;i<pos.count;i++){const t=(height/2-pos.getY(i))/height,u=pos.getX(i)/width;const narrow=1-.78*THREE.MathUtils.smoothstep(t,.35,.94);pos.setX(i,u*width*narrow+.08*t);pos.setZ(i,Math.sin(u*Math.PI*14)*.045*narrow-.035*t)}geo.computeVertexNormals();const cloth=mesh(geo,mats.curtain);cloth.position.set(cx,2.74-height/2,z);cloth.name='Cortina recogida';
const knot=mesh(new THREE.SphereGeometry(1,16,10),mats.curtain);knot.scale.set(.10,.07,.075);knot.position.set(cx+.08,1.15,z-.035);const tail=mesh(new THREE.SphereGeometry(1,14,8),mats.curtain);tail.scale.set(.075,.14,.06);tail.position.set(cx+.10,1.05,z-.035);for(let i=0;i<8;i++)box(cx-width/2+width*(i+.5)/8,2.78,z,.025,.085,.018,mats.curtain)}
const furnitureMats={green:mat('#216b42',{metalness:.18,roughness:.57}),black:mat('#202725',{metalness:.2,roughness:.55}),ivory:mat('#c8c0a7',{metalness:.1}),top:mat('#cbcdc8',{roughness:.58}),seat:mat('#d2cfc0'),seatGrey:mat('#bdc3bd'),seatWood:mat('#9c8267'),teacher:mat('#c8bea5'),teacherTop:mat('#ded8c7'),edge:mat('#424c46'),feet:mat('#303732')};
applyFurnitureTextures(furnitureMats);

function roundGeometry(w,h,t,r=.045){r=Math.min(r,w/3,h/3);const a=-w/2,b=-h/2,s=new THREE.Shape();s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);return new THREE.ExtrudeGeometry(s,{depth:t,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.003,bevelThickness:.002,curveSegments:6})}
function slab(x,y,z,w,d,t,m,parent=model,r=.045){const o=mesh(roundGeometry(w,d,t,r),m,parent);o.rotation.x=-Math.PI/2;o.position.set(x,y-t/2,z);return o}
function tube(points,r,m,parent){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal'),36,r,10,false),m,parent)}
function chair(parent,x,z,angle=0,invert=false,variant='green',index=0){const g=new THREE.Group();g.position.set(x,invert?1.21:0,z);g.rotation.y=angle;if(invert)g.rotation.x=Math.PI;g.userData.frameColor=variant;parent.add(g);const m=furnitureMats[variant];const panel=index%9===0?furnitureMats.seatWood:index%3===0?furnitureMats.seatGrey:furnitureMats.seat;
slab(0,.45,0,.43,.43,.022,panel,g,.048);
const back=mesh(roundGeometry(.405,.235,.018,.045),panel,g);back.rotation.y=Math.PI/2;back.position.set(-.252,.715,0);
for(const zz of [-.193,.193]){tube([[-.20,.025,zz],[-.225,.20,zz],[-.235,.48,zz],[-.255,.75,zz],[-.245,.84,zz]],.016,m,g);tube([[.21,.025,zz],[.215,.25,zz],[.205,.40,zz],[.16,.433,zz],[-.185,.433,zz]],.016,m,g);rod([-.22,.22,zz],[.21,.22,zz],.012,m,g);for(const xx of [-.20,.21])box(xx,.023,zz,.038,.035,.038,furnitureMats.feet,g)}
tube([[-.245,.83,-.193],[-.24,.862,-.15],[-.24,.87,0],[-.24,.862,.15],[-.245,.83,.193]],.016,m,g);rod([-.225,.34,-.193],[-.225,.34,.193],.012,m,g);return g}
function desk(x,z,index){const g=new THREE.Group();g.position.set(x,0,z);g.name=`Mesa doble ${index+1}`;g.userData.plazas=2;model.add(g);const frame=index%4===0?furnitureMats.green:furnitureMats.black;
slab(0,.745,0,.61,1.25,.027,furnitureMats.edge,g,.055);slab(0,.76,0,.593,1.233,.015,furnitureMats.top,g,.05);
for(const zz of [-.535,.535]){tube([[-.265,.025,zz],[-.255,.38,zz],[-.23,.67,zz],[-.19,.71,zz],[.19,.71,zz],[.23,.67,zz],[.255,.38,zz],[.265,.025,zz]],.018,frame,g);rod([-.25,.5,zz],[.25,.5,zz],.012,frame,g)}
// Parrilla longitudinal, bordes curvos y varillas finas, debajo de la tapa.
for(const xx of [-.235,.235])rod([xx,.60,-.55],[xx,.60,.55],.012,frame,g);for(let i=0;i<12;i++)rod([-.235,.60,-.52+i*.095],[.235,.60,-.52+i*.095],.0075,frame,g);
for(const xx of [-.265,.265])for(const zz of [-.535,.535])box(xx,.023,zz,.044,.036,.044,furnitureMats.feet,g);
for(let j=0;j<2;j++){const variant=['green','black','green','green','black','ivory','green'][(index*2+j)%7];const c=chair(g,$('#stacked').checked?0:-.50,j===0?-.30:.30,0,$('#stacked').checked,variant,index*2+j);c.name='Silla de estudiante'}return g;}
function ubicarPersonas(mesa,columna,fila){for(const item of asignaciones.filter(a=>a.columna===columna&&a.fila===fila)){const perfil=[...personas,...perfilesDeRol].find(p=>p.id===item.persona);if(!perfil)continue;const figura=crearPersona(perfil,{pose:'sentada'});figura.position.set(-.50,0,item.plaza===0?-.30:.30);figura.rotation.y=Math.PI/2;figura.userData.asiento=item;mesa.add(figura);
}}

function fan(x,z){const g=new THREE.Group();g.name='Ventilador de pared';g.position.set(x,2.82,z);g.rotation.y=-Math.PI/2;model.add(g);box(0,-.17,-.12,.07,.38,.08,mats.black,g);const motor=mesh(new THREE.CylinderGeometry(.07,.08,.15,24),mats.black,g);motor.rotation.x=Math.PI/2;motor.position.z=-.065;
for(const zz of [-.045,.045])for(const r of [.09,.17,.25,.337]){const ring=mesh(new THREE.TorusGeometry(r,r>.33?.009:.0022,6,64),mats.fanGuard,g);ring.position.z=zz}
for(let i=0;i<32;i++){const a=i*Math.PI*2/32;rod([.05*Math.cos(a),.05*Math.sin(a),.07],[.335*Math.cos(a),.335*Math.sin(a),.045],.0023,mats.fanGuard,g)}
for(let i=0;i<3;i++){const bladeShape=new THREE.Shape();bladeShape.moveTo(.025,.01);bladeShape.bezierCurveTo(.10,.03,.22,.17,.13,.265);bladeShape.bezierCurveTo(.045,.32,-.035,.17,.005,.04);bladeShape.closePath();const blade=mesh(new THREE.ExtrudeGeometry(bladeShape,{depth:.008,bevelEnabled:true,bevelSegments:2,bevelSize:.003,bevelThickness:.002,curveSegments:16}),mats.black,g);blade.rotation.z=i*Math.PI*2/3;blade.position.z=-.008}
const hub=mesh(new THREE.SphereGeometry(.055,20,12),mats.black,g);hub.scale.z=.45;hub.position.z=.028;rod([-.05,-.27,-.09],[-.06,-.46,-.09],.007,mats.rubber,g)}
// Pizarrón en la pared perpendicular a las ventanas, como en las fotografías.
box(R-.105,1.77,-.28,.075,1.24,2.85,mats.frame);box(R-.15,1.77,-.28,.022,1.17,2.77,mats.board);box(R-.2,1.15,-.28,.1,.035,2.8,mats.frame);for(const [z,m] of [[-2.18,mats.red],[1.64,mats.blue]])box(R-.1,1.82,z,.025,.77,.52,m);fan(R-.25,2.6);
for(const o of model.children){if(o.isMesh&&o.material.map===mats.board.map){const uv=o.geometry.attributes.uv,pos=o.geometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getZ(i)+1.385)/2.77,(pos.getY(i)+.585)/1.17);uv.needsUpdate=true}}
activeSide=null;const sx=w/7.5,sz=d/7.4;let deskCount=0;const rowsByColumn=[0,1,2,3].map(i=>Number($('#rows'+i).value));for(let col=0;col<4;col++)for(let row=0;row<rowsByColumn[col];row++){const preferred=filasPreferidas[col];const positionRow=preferred?.length===rowsByColumn[col]?preferred[row]:(col===1||col===2)?4-rowsByColumn[col]+row:row;const frontTableX=R-1.67,backTableX=L+1.23;const mesa=desk(THREE.MathUtils.lerp(frontTableX,backTableX,positionRow/3),(-2.85+col*1.9)*sz,deskCount++);ubicarPersonas(mesa,col,positionRow);}
const tx=R-.78,tz=B-1.25;const teacher=new THREE.Group();teacher.name='Escritorio docente';teacher.userData={ancho:1.70,profundidad:.80};model.add(teacher);
slab(tx,.795,tz,.80,1.70,.035,furnitureMats.teacherTop,teacher,.015);
box(tx-.31,.50,tz,.04,.47,1.56,furnitureMats.teacher,teacher);
for(const xx of [-.33,.33])for(const zz of [-.76,.76])box(tx+xx,.39,tz+zz,.045,.76,.045,furnitureMats.ivory,teacher);
for(const xx of [-.33,.33])rod([tx+xx,.23,tz-.76],[tx+xx,.23,tz+.76],.014,furnitureMats.ivory,teacher);
// Silla retirada del hueco del escritorio y separada de la pared.
const teacherChair=chair(model,tx+.30,tz-1.12,Math.PI-.10,false,'green',1);teacherChair.name='Silla docente';

for(const cx of [-w*.25,w*.25]){const width=w*.27,z=B;rod([cx-width*.6,2.79,z-.21],[cx+width*.6,2.79,z-.21],.016,mats.dark);if(cx<0){curtain(cx-width*.43,1.79,z-.22,width*.35,1.94);tiedCurtain(cx+width*.37,z-.23,width*.29)}else tiedCurtain(cx,z-.23,width*.38)}
return model;
}
