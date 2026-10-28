import * as T from './vendor/three.module.js';

// Combinar piezas opacas de igual material reduce llamadas de dibujo sin cambiar el modelo.
export function optimizarEstatico(source){
 source.updateMatrixWorld(true);const output=new T.Group();output.name='Escuela optimizada para cámara';const buckets=new Map();let originals=0;
 source.traverseVisible(o=>{
  if(o.isSprite||o.isInstancedMesh||o.isLine){const clone=o.clone();clone.matrix.copy(o.matrixWorld);clone.matrixAutoUpdate=false;output.add(clone);return}
  if(!o.isMesh)return;originals++;
  const material=o.material;
  if(!Array.isArray(material)&&(material.transparent||material.colorWrite===false)){const clone=o.clone(false);clone.matrix.copy(o.matrixWorld);clone.matrixAutoUpdate=false;output.add(clone);return}
  const geometry=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);
  const parts=Array.isArray(material)?geometry.groups:[{start:0,count:geometry.attributes.position.count,materialIndex:0}];
  for(const part of parts){const m=Array.isArray(material)?material[part.materialIndex]:material;if(!m)continue;const attributes=Object.keys(geometry.attributes).filter(k=>['position','normal','uv','color'].includes(k)).sort();const key=m.uuid+'|'+attributes.join(',');if(!buckets.has(key))buckets.set(key,{material:m,attributes,arrays:Object.fromEntries(attributes.map(k=>[k,[]])),sizes:Object.fromEntries(attributes.map(k=>[k,geometry.attributes[k].itemSize]))});const bucket=buckets.get(key);for(const name of attributes){const attr=geometry.attributes[name];bucket.arrays[name].push(attr.array.slice(part.start*attr.itemSize,(part.start+part.count)*attr.itemSize))}}
  geometry.dispose();
 });
 for(const b of buckets.values()){const g=new T.BufferGeometry();for(const name of b.attributes){const chunks=b.arrays[name],array=new Float32Array(chunks.reduce((n,a)=>n+a.length,0));let offset=0;for(const chunk of chunks){array.set(chunk,offset);offset+=chunk.length}g.setAttribute(name,new T.BufferAttribute(array,b.sizes[name]))}g.computeBoundingSphere();const mesh=new T.Mesh(g,b.material);mesh.castShadow=true;mesh.receiveShadow=true;output.add(mesh)}
 return {group:output,originals,batched:output.children.length};
}
