import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/addons/loaders/GLTFLoader.js';
import {DRACOLoader} from './vendor/addons/loaders/DRACOLoader.js';
import {surfaceTexture} from './texturas.js';

const base=new URL('./assets/zona-renovada/',import.meta.url);
export async function cargarZonaRenovada(){
 const draco=new DRACOLoader();draco.setDecoderPath(new URL('./vendor/addons/libs/draco/',import.meta.url).href);draco.setWorkerLimit(2);
 const loader=new GLTFLoader();loader.setDRACOLoader(draco);
 try{
  const [gltf,response]=await Promise.all([loader.loadAsync(new URL('aula-patio.glb',base).href),fetch(new URL('zona.json',base))]);
  if(!response.ok)throw new Error('No se pudo cargar el sector del aula y el patio.');
  return {modelo:gltf.scene,datos:await response.json()};
 }finally{draco.dispose()}
}

const bounds=o=>new T.Box3().setFromObject(o);
function collider(spec,name){
 const min=new T.Vector3(...spec.min),max=new T.Vector3(...spec.max),size=max.clone().sub(min);
 const mesh=new T.Mesh(new T.BoxGeometry(size.x,size.y,size.z),new T.MeshBasicMaterial());mesh.name=name;mesh.visible=false;
 mesh.position.copy(min).add(max).multiplyScalar(.5);mesh.updateMatrixWorld(true);return mesh;
}
function conserved(rooms){
 return rooms.filter(r=>r.id!=='aula-sur-2').map(r=>{
  let meshes=0,vertices=0;const matrix=[];
  r.mobiliario?.traverse(o=>{if(o.isMesh){meshes++;vertices+=o.geometry.attributes.position.count;matrix.push(...o.position.toArray(),...o.scale.toArray(),...o.quaternion.toArray())}});
  return {id:r.id,meshes,vertices,transforms:matrix.join(',')};
 });
}
export function integrarZonaRenovada(school,{modelo,datos},estilo){
 const {root,inventario}=school;root.updateMatrixWorld(true);const antes=conserved(inventario.ambientes),removed=new Set();
 const remove=o=>{if(o){removed.add(o);o.removeFromParent()}};
 // Reemplazar el mobiliario del aula conservando los personajes existentes.
 const aula=inventario.ambientes.find(r=>r.id==='aula-sur-2');const people=[];
 aula.mobiliario.traverse(o=>{if(o.userData.id&&o.userData.pose)people.push(o)});
 for(const person of people){root.attach(person);if(person.userData.asiento)person.position.x+=.10;person.userData.personajeConservado=true}
 remove(aula.mobiliario);remove(aula.suelo);
 for(const mesh of inventario.paredes)if(mesh.userData.ambientesMuros?.includes('aula-sur-2'))remove(mesh);
 for(const opening of inventario.aberturas)if(opening.room.id==='aula-sur-2')remove(opening.objeto);
 for(const child of [...school.ceilings.children])if(child.userData.ambienteId==='aula-sur-2')remove(child);
 for(const child of [...estilo.fixtures.children])if(/aula|galeria-sur/.test(child.name))remove(child);
 // El resto de las fachadas, los ambientes, las cubiertas y la manzana mantienen su modelo.
 for(const galeria of inventario.galerias){const parent=galeria.parent;if(parent&&Math.abs(parent.position.z-13.2)<.001)remove(parent)}
 for(const object of school.patioOriginal){
  if(/^(Terreno exterior|Vereda|Calle)/.test(object.name))continue;
  const box=bounds(object),center=box.getCenter(new T.Vector3());
  if(center.x < -20)continue;
  remove(object);
 }
 inventario.colisiones=inventario.colisiones.filter(o=>!removed.has(o)&&!o.userData.ambientesMuros?.includes('aula-sur-2'));
 inventario.paredes=inventario.paredes.filter(o=>!removed.has(o));
 inventario.aberturas=inventario.aberturas.filter(o=>o.room.id!=='aula-sur-2');
 inventario.bancos=datos.benches.map((b,i)=>collider(b,'Banco renovado '+(i+1)));
 inventario.canteros=datos.canteros;school.medidas={...school.medidas,canteros:datos.canteros};
 inventario.colisiones.push(...datos.colliders.map((b,i)=>collider(b,'Colisión del sector renovado '+i)));
 const textures=new Map(),types={piso:{grain:24,seed:491},ladrillo:{grain:18,seed:492},revoque:{grain:5,seed:493},tela:{grain:16,seed:494}};
 const materials=new Set();
 modelo.name='Aula, galería y patio renovados';
 modelo.traverse(o=>{
  if(!o.isMesh)return;
  const mats=Array.isArray(o.material)?o.material:[o.material];
  const surfaceOnly=mats.every(m=>m.userData.superficie==='piso'||/Junta.*piso|Junta exterior|mínima del piso/.test(m.name));
  o.castShadow=!o.userData.sinSombraFina&&!surfaceOnly&&o.userData.renderLayer!=='ceilings';o.receiveShadow=true;
  if(o.userData.renderLayer==='roofs')inventario.cubiertas.push(o);
  for(const m of Array.isArray(o.material)?o.material:[o.material]){
   if(materials.has(m))continue;materials.add(m);
   if(m.userData.glass){m.depthWrite=false;m.transparent=true;m.opacity=.20;m.roughness=.08}
   if(/Follaje/.test(m.name))m.side=T.DoubleSide;
   const type=m.userData.superficie;
   if(types[type]&&!m.map){
    if(!textures.has(type)){
     const texture=surfaceTexture({color:'#eeeeea',...types[type]});texture.repeat.set(1/.6,1/.6);textures.set(type,texture);
    }
    m.map=textures.get(type);m.bumpMap=m.map;m.bumpScale=type==='piso'?.00015:type==='tela'?.00025:.0005;
   }
   if(m.map)m.map.anisotropy=8;
   m.needsUpdate=true;
  }
 });
 root.add(modelo);root.updateMatrixWorld(true);
 const despues=conserved(inventario.ambientes);
 if(JSON.stringify(antes)!==JSON.stringify(despues))throw new Error('Cambió un ambiente fuera del sector renovado.');
 const result={version:datos.version,modelo,personajesConservados:people.length,ambientesConservados:despues.length,partesReemplazadas:removed.size,mallasNuevas:datos.meshes};
 school.zonaRenovada=result;return result;
}
