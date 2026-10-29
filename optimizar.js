import * as T from './vendor/three.module.js';

// Una malla por material y capa conserva los índices y los estados de sombra.
// Las capas permiten mostrar los cielorrasos y las cubiertas sin volver al modelo
// compuesto por miles de objetos ni construir una segunda copia del edificio.
export function optimizarEstatico(source,{materialesDinamicos=new Set(),tamanoCelda=0,tamanoCeldaInstancias=tamanoCelda}={}){
 source.updateMatrixWorld(true);
 const group=new T.Group();group.name='Geometría estática agrupada';
 const buckets=new Map(),materialInfo=new Map(),sharedMaterials=new Map(),planes=new Map(),serialization={textures:{},images:{}};
 let originals=0,verticesBefore=0;
 function materialAgrupado(material){
  if(materialInfo.has(material))return materialInfo.get(material);
  const pack=material.color&&!materialesDinamicos.has(material)
   &&material.onBeforeCompile===T.Material.prototype.onBeforeCompile
   &&(material.isMeshStandardMaterial||material.isMeshBasicMaterial);
  let result={material,pack:false,key:material.uuid};
  if(pack){
   const data=material.toJSON(serialization);
   for(const name of ['uuid','metadata','name','color','vertexColors'])delete data[name];
   data.clippingPlanes=material.clippingPlanes?.map(p=>{if(!planes.has(p))planes.set(p,planes.size);return planes.get(p)});
   data.clipShadows=material.clipShadows;data.clipIntersection=material.clipIntersection;
   const key=JSON.stringify(data);
   if(!sharedMaterials.has(key)){
    const clone=material.clone();clone.color.setRGB(1,1,1);clone.vertexColors=true;
    clone.clippingPlanes=material.clippingPlanes;
    sharedMaterials.set(key,clone);
   }
   result={material:sharedMaterials.get(key),pack:true,key:sharedMaterials.get(key).uuid};
  }
  materialInfo.set(material,result);return result;
 }
 source.traverseVisible(o=>{
  const layer=o.userData.renderLayer||'base';
  if(o.isInstancedMesh&&tamanoCeldaInstancias){
   const cells=new Map(),matrix=new T.Matrix4(),world=new T.Matrix4(),center=new T.Vector3(),color=new T.Color();
   for(let i=0;i<o.count;i++){
    o.getMatrixAt(i,matrix);world.multiplyMatrices(o.matrixWorld,matrix);center.setFromMatrixPosition(world);
    const key=Math.floor(center.x/tamanoCeldaInstancias)+','+Math.floor(center.z/tamanoCeldaInstancias);
    if(!cells.has(key))cells.set(key,[]);cells.get(key).push(i);
   }
   for(const ids of cells.values()){
    const clone=new T.InstancedMesh(o.geometry,o.material,ids.length);
    clone.name=o.name;clone.matrix.copy(o.matrixWorld);clone.matrixAutoUpdate=false;
    clone.castShadow=o.castShadow;clone.receiveShadow=o.receiveShadow;clone.renderOrder=o.renderOrder;
    clone.userData={...o.userData,renderLayer:layer};
    ids.forEach((id,i)=>{o.getMatrixAt(id,matrix);clone.setMatrixAt(i,matrix);if(o.instanceColor){o.getColorAt(id,color);clone.setColorAt(i,color)}});
    clone.computeBoundingBox();clone.computeBoundingSphere();group.add(clone);
   }
   return;
  }
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
  let cell='';
  if(tamanoCelda){g.computeBoundingBox();const c=g.boundingBox.getCenter(new T.Vector3());cell=Math.floor(c.x/tamanoCelda)+','+Math.floor(c.z/tamanoCelda)}
  const sourceIndices=g.index?.array;
  const parts=Array.isArray(o.material)?g.groups:[{start:0,count:sourceIndices?.length||g.attributes.position.count,materialIndex:0}];
  const reversed=o.matrixWorld.determinant()<0;
  for(const part of parts){
   const originalMaterial=materials[part.materialIndex];if(!originalMaterial)continue;
   const info=materialAgrupado(originalMaterial),material=info.material;
   const names=Object.keys(g.attributes).filter(k=>['position','normal','uv','color'].includes(k)).sort();
   if(info.pack&&!names.includes('color')){names.push('color');names.sort()}
   const key=[info.key,names.join(','),layer,+o.castShadow,+o.receiveShadow,cell,o.renderOrder].join('|');
   if(!buckets.has(key))buckets.set(key,{material,names,layer,castShadow:o.castShadow,receiveShadow:o.receiveShadow,
    renderOrder:o.renderOrder,sizes:Object.fromEntries(names.map(n=>[n,n==='color'&&info.pack?3:g.attributes[n].itemSize])),pieces:[],vertexCount:0,indexCount:0});
   const bucket=buckets.get(key),remap=new Map(),originalIds=[],indices=new Uint32Array(part.count);
   for(let j=0;j<part.count;j++){
    const original=sourceIndices?sourceIndices[part.start+j]:part.start+j;
    if(!remap.has(original)){remap.set(original,originalIds.length);originalIds.push(original)}
    indices[j]=remap.get(original);
   }
   if(reversed)for(let j=0;j<indices.length;j+=3){const v=indices[j+1];indices[j+1]=indices[j+2];indices[j+2]=v}
   const attributes={};
   for(const name of names){
    if(name==='color'&&info.pack){
     const values=new Float32Array(originalIds.length*3),attr=originalMaterial.vertexColors?g.attributes.color:null,c=originalMaterial.color;
     for(let j=0;j<originalIds.length;j++){const id=originalIds[j];values[j*3]=c.r*(attr?attr.getX(id):1);values[j*3+1]=c.g*(attr?attr.getY(id):1);values[j*3+2]=c.b*(attr?attr.getZ(id):1)}
     attributes.color=values;continue;
    }
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
  mesh.renderOrder=bucket.renderOrder;
  mesh.userData.renderLayer=bucket.layer;group.add(mesh);verticesAfter+=bucket.vertexCount;
 }
 return {group,originals,batched:group.children.length,verticesBefore,verticesAfter};
}
