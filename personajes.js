import * as THREE from './vendor/three.module.js';
import {crearPeinado,estilosPelo} from './peinados.js';

// La ropa sigue la referencia. Las proporciones son convenciones de muñeco,
// no mediciones corporales. Cabezas lisas, sin ojos, boca, nariz ni textura facial.
export const personas=[
 {id:'griselda',nombre:'Griselda',ropa:'#66695f',interior:'#c4b6a0',pantalon:'#363936',pelo:'#c1ad82',peinado:'largo',bufanda:true,abrigo:true},
 {id:'carlos',nombre:'Carlos',ropa:'#343735',interior:'#633438',pantalon:'#34485c',pelo:'#292b28'},
 {id:'gonzalo',nombre:'Gonzalo',ropa:'#898a7e',pantalon:'#25292a',pelo:'#292c29',altura:1.12,cuello:true},
 {id:'alan',nombre:'Alan',ropa:'#252a29',pantalon:'#34638a',pelo:'#36312a',zapatilla:'#222a30',suela:'#777d79'},
 {id:'agustin',nombre:'Agustín',ropa:'#35423e',interior:'#20282b',pantalon:'#232e36',pelo:'#393831',chaleco:true,zapatilla:'#e3e0d2'},
 {id:'E01',nombre:'E01',ropa:'#303632',pantalon:'#252d31',pelo:'#594438',peinado:'largo',capucha:true},
 {id:'E02',nombre:'E02',ropa:'#b77f7a',pantalon:'#667e8c',pelo:'#3b3028',peinado:'largo'},
 {id:'E03',nombre:'E03',ropa:'#363d3d',pantalon:'#38424d',pelo:'#302e27',peinado:'melena'},
 {id:'E04',nombre:'E04',ropa:'#737d96',pantalon:'#6b8491',pelo:'#40352b',peinado:'atado',capucha:true},
 {id:'E05',nombre:'E05',ropa:'#282e30',pantalon:'#353c44',pelo:'#38322a',acolchado:true},
 {id:'E06',nombre:'E06',ropa:'#86604c',pantalon:'#617784',pelo:'#403027',peinado:'largo',capucha:true},
 {id:'E07',nombre:'E07',ropa:'#282f35',pantalon:'#35404a',pelo:'#252c29'},
 {id:'E08',nombre:'E08',ropa:'#77817c',pantalon:'#303c43',pelo:'#292d29',capuchaPuesta:true},
 {id:'E09',nombre:'E09',ropa:'#c2c8c4',pantalon:'#40474b',pelo:'#292e2c',estampado:true},
 {id:'E10',nombre:'E10',ropa:'#272e30',pantalon:'#656d6d',pelo:'#cfbe82',capucha:true},
 {id:'E11',nombre:'E11',ropa:'#383337',interior:'#643b45',pantalon:'#3c4650',pelo:'#2b2a26',capucha:true},
 {id:'E12',nombre:'E12',ropa:'#353c3e',pantalon:'#343e47',pelo:'#272c28',peinado:'rizado'},
 {id:'E13',nombre:'E13',ropa:'#4b5359',pantalon:'#3a454e',pelo:'#3d352b',peinado:'rizado'},
 {id:'E14',nombre:'E14',ropa:'#34373e',mangas:'#743e46',interior:'#d19a43',pantalon:'#686f74',pelo:'#242b28',abierto:true},
 {id:'E15',nombre:'E15',ropa:'#713c45',interior:'#343c41',pantalon:'#30393e',pelo:'#272d29',capucha:true}
];
for(const persona of personas)persona.peinado=estilosPelo[persona.id]?.tipo||'corto';

export function crearPersona(p,{pose='de-pie'}={}){
 const seated=pose==='sentada';
 const root=new THREE.Group();root.name=p.nombre;root.userData={id:p.id,sinRostro:true,pose};
 const body=new THREE.Group();body.position.y=seated?-.31:0;root.add(body);
 const material=c=>new THREE.MeshStandardMaterial({color:c,roughness:.88});
 const cloth=material(p.ropa),pants=material(p.pantalon),hair=material(p.pelo),neutral=material('#c8c1b2'),inner=material(p.interior||p.ropa),sleeves=material(p.mangas||p.ropa),sole=material(p.suela||'#c5c6ba'),shoe=material(p.zapatilla||'#313a3c');
 function mesh(g,m,x,y,z,parent=body){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 function ellipsoid(x,y,z,sx,sy,sz,m){const o=mesh(new THREE.SphereGeometry(1,24,16),m,x,y,z);o.scale.set(sx,sy,sz);return o}
 function bar(a,b,r,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b);const o=mesh(new THREE.CapsuleGeometry(r,Math.max(.001,av.distanceTo(bv)-2*r),6,12),m,...av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),bv.sub(av).normalize());return o}
 // Frente del personaje hacia +Z.
 const torso=mesh(new THREE.LatheGeometry([new THREE.Vector2(.155,0),new THREE.Vector2(.17,.06),new THREE.Vector2(.18,.35),new THREE.Vector2(.205,.43),new THREE.Vector2(.115,.49)],24),cloth,0,.79,0);torso.scale.z=.68;
 if(p.interior||p.abierto){const panel=mesh(new THREE.BoxGeometry(p.abierto?.17:.095,.41,.012),inner,0,1.03,.126);panel.name='Prenda interior'}
 for(const side of [-1,1]){const x=side*.10;
 if(seated){bar([x,.80,0],[x,.80,.29],.065,pants);bar([x,.80,.29],[x,.415,.31],.058,pants);ellipsoid(x,.372,.35,.082,.037,.145,sole);ellipsoid(x,.403,.34,.079,.045,.14,shoe)}
 else{bar([x,.80,0],[x,.44,.015],.069,pants);bar([x,.44,.015],[x,.105,.025],.063,pants);ellipsoid(x,.062,.072,.082,.037,.145,sole);ellipsoid(x,.093,.065,.079,.045,.14,shoe)}
 const armMat=p.chaleco?inner:sleeves;
 if(seated){bar([side*.205,1.20,0],[side*.23,.99,.10],.057,armMat);bar([side*.23,.99,.10],[side*.23,1.12,.29],.045,armMat);ellipsoid(side*.23,1.12,.31,.042,.035,.057,neutral)}
 else{bar([side*.205,1.20,0],[side*.25,.99,.015],.057,armMat);bar([side*.25,.99,.015],[side*.27,.78,.045],.05,armMat);ellipsoid(side*.27,.748,.049,.045,.065,.044,neutral)}
 if(p.capucha){bar([side*.045,1.24,.13],[side*.049,1.08,.14],.005,material('#b8bbb0'))}}
 mesh(new THREE.CylinderGeometry(.055,.06,.09,16),neutral,0,1.31,0);
 const head=ellipsoid(0,1.49,.006,.13,.165,.125,neutral);head.name='Cabeza lisa sin rasgos';
 if(p.capuchaPuesta){ellipsoid(0,1.47,-.105,.155,.183,.063,cloth);ellipsoid(-.139,1.46,-.035,.029,.13,.054,cloth);ellipsoid(.139,1.46,-.035,.029,.13,.054,cloth)}
 crearPeinado(p,body);root.userData.peinado=estilosPelo[p.id]?.tipo;
 if(p.capucha)ellipsoid(0,1.205,-.10,.125,.075,.065,inner);
 if(p.bufanda){const scarf=material('#b6b49e');const ring=mesh(new THREE.TorusGeometry(.085,.035,8,24),scarf,0,1.27,0);ring.rotation.x=Math.PI/2;mesh(new THREE.BoxGeometry(.07,.32,.025),scarf,-.055,1.10,.14)}
 if(p.abrigo){const hem=mesh(new THREE.CylinderGeometry(.17,.19,.28,24),cloth,0,.78,0);hem.scale.z=.7}
 if(p.chaleco||p.acolchado)for(let i=0;i<6;i++){const seam=mesh(new THREE.TorusGeometry(.172,.003,4,32),material(p.chaleco?'#28352f':'#202828'),0,.85+i*.063,0);seam.rotation.x=Math.PI/2;seam.scale.y=.68}
 if(p.estampado)for(let i=0;i<12;i++){const stripe=mesh(new THREE.BoxGeometry(.045,.009,.007),material('#5b6664'),(i%3-1)*.075,.89+Math.floor(i/3)*.075,.128);stripe.rotation.z=(i%3-1)*.4}
 if(p.cuello){const collar=mesh(new THREE.TorusGeometry(.075,.017,6,24),inner,0,1.268,0);collar.rotation.x=Math.PI/2}
 root.scale.setScalar(p.altura||1);return root;
}
