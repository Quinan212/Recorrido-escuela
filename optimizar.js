import * as T from './vendor/three.module.js';

// Una malla por material y capa conserva los índices y los estados de sombra.
// Las capas permiten mostrar los cielorrasos y las cubiertas sin volver al modelo
// compuesto por miles de objetos ni construir una segunda copia del edificio.
export function optimizarEstatico(source){
 source.updateMatrixWorld(true);
 const group=new T.Group();group.name='Geometría estática agrupada';
 const buckets=new Map();let originals=0,verticesBefore=0;
 source.traverseVisible(o=>{
  const layer=o.userData.renderLayer||'base';
  if(o.isSprite||o.isInstancedMesh||o.isLine){
   const clone=o.clone();clone.matrix.copy(o.matrixWorld);clone.matrixAutoUpdate=false;
   clone.userData.renderLayer=layer;group.add(clone);return;
  }
  if(!o.isMesh)return;
  originals++;verticesBefore+=o.geometry.attributes.position.count;
  const materials=Array.isArray(o.material)?o.material:[o.material];
  if(materials.some(m=>m.transparent)){
   const clone=o.clone(false);clone.matrix.copy(o.matrixWorld);clone.matrixAutoUpdate=false;
   clone.userData.renderLayer=layer;group.add(clone);return;
  }
  const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);
  const sourceIndices=g.index?.array;
  const parts=Array.isArray(o.material)?g.groups:[{start:0,count:sourceIndices?.length||g.attributes.position.count,materialIndex:0}];
  const reversed=o.matrixWorld.determinant()<0;
  for(const part of parts){
   const material=materials[part.materialIndex];if(!material)continue;
   const names=Object.keys(g.attributes).filter(k=>['position','normal','uv','color'].includes(k)).sort();
   const key=[material.uuid,names.join(','),layer,+o.castShadow,+o.receiveShadow].join('|');
   if(!buckets.has(key))buckets.set(key,{material,names,layer,castShadow:o.castShadow,receiveShadow:o.receiveShadow,
    sizes:Object.fromEntries(names.map(n=>[n,g.attributes[n].itemSize])),pieces:[],vertexCount:0,indexCount:0});
   const bucket=buckets.get(key),remap=new Map(),originalIds=[],indices=new Uint32Array(part.count);
   for(let j=0;j<part.count;j++){
    const original=sourceIndices?sourceIndices[part.start+j]:part.start+j;
    if(!remap.has(original)){remap.set(original,originalIds.length);originalIds.push(original)}
    indices[j]=remap.get(original);
   }
   if(reversed)for(let j=0;j<indices.length;j+=3){const v=indices[j+1];indices[j+1]=indices[j+2];indices[j+2]=v}
   const attributes={};
   for(const name of names){
    const attr=g.attributes[name],values=new Float32Array(originalIds.length*attr.itemSize);
    for(let j=0;j<originalIds.length;j++)for(let k=0;k<attr.itemSize;k++)
     values[j*attr.itemSize+k]=attr.array[originalIds[j]*attr.itemSize+k];
    attributes[name]=values;
   }
   bucket.pieces.push({attributes,indices,count:originalIds.length});
   bucket.vertexCount+=originalIds.length;bucket.indexCount+=indices.length;
  }
  g.dispose();
 });
 let verticesAfter=0;
 for(const bucket of buckets.values()){
  const geometry=new T.BufferGeometry();
  for(const name of bucket.names){
   const array=new Float32Array(bucket.vertexCount*bucket.sizes[name]);let offset=0;
   for(const piece of bucket.pieces){array.set(piece.attributes[name],offset);offset+=piece.attributes[name].length}
   geometry.setAttribute(name,new T.BufferAttribute(array,bucket.sizes[name]));
  }
  const indices=bucket.vertexCount>65535?new Uint32Array(bucket.indexCount):new Uint16Array(bucket.indexCount);
  let vertexOffset=0,indexOffset=0;
  for(const piece of bucket.pieces){
   for(let j=0;j<piece.indices.length;j++)indices[indexOffset+j]=piece.indices[j]+vertexOffset;
   indexOffset+=piece.indices.length;vertexOffset+=piece.count;
  }
  geometry.setIndex(new T.BufferAttribute(indices,1));geometry.computeBoundingBox();geometry.computeBoundingSphere();
  const mesh=new T.Mesh(geometry,bucket.material);mesh.matrixAutoUpdate=false;
  mesh.castShadow=bucket.castShadow;mesh.receiveShadow=bucket.receiveShadow;
  mesh.userData.renderLayer=bucket.layer;group.add(mesh);verticesAfter+=bucket.vertexCount;
 }
 return {group,originals,batched:group.children.length,verticesBefore,verticesAfter};
}
