import * as T from './vendor/three.module.js';

// Escribir primero la profundidad permite rechazar superficies tapadas antes
// de calcular sus luces y sombras. Reutiliza geometrías y matrices de instancia.
export function crearPrepasoProfundidad(scene,camera){
 const depthScene=new T.Scene(),copies=[],materials=new Map(),planes=new Map();
 scene.updateMatrixWorld(true);
 scene.traverse(source=>{
  if(!source.isMesh||Array.isArray(source.material))return;
  const m=source.material;
  if(m.transparent||!m.depthWrite||!m.colorWrite||!m.visible||m.alphaTest||m.alphaHash||m.displacementMap)return;
  const settings={side:m.side,depthFunc:m.depthFunc,polygonOffset:m.polygonOffset,
   polygonOffsetFactor:m.polygonOffsetFactor,polygonOffsetUnits:m.polygonOffsetUnits,clipIntersection:m.clipIntersection};
  const ids=m.clippingPlanes?.map(p=>{if(!planes.has(p))planes.set(p,planes.size);return planes.get(p)});
  const key=JSON.stringify([settings,ids]);
  if(!materials.has(key))materials.set(key,new T.MeshBasicMaterial({...settings,clippingPlanes:m.clippingPlanes,colorWrite:false}));
  const material=materials.get(key);
  const copy=source.isInstancedMesh?new T.InstancedMesh(source.geometry,material,source.count):new T.Mesh(source.geometry,material);
  if(source.isInstancedMesh){copy.instanceMatrix=source.instanceMatrix;copy.boundingBox=source.boundingBox;copy.boundingSphere=source.boundingSphere}
  copy.matrix.copy(source.matrixWorld);copy.matrixAutoUpdate=false;copy.frustumCulled=source.frustumCulled;
  depthScene.add(copy);copies.push([copy,source]);
 });
 function render(renderer,target){
  for(const [copy,source] of copies){
   let visible=true;for(let o=source;o;o=o.parent)if(!o.visible){visible=false;break}
   copy.visible=visible;
  }
  const auto=renderer.autoClear,shadows=renderer.shadowMap.enabled;
  try{
   renderer.autoClear=false;renderer.shadowMap.enabled=false;
   renderer.setRenderTarget(target);renderer.clear();renderer.render(depthScene,camera);
  }finally{renderer.autoClear=auto;renderer.shadowMap.enabled=shadows}
 }
 return {render,preparar:renderer=>renderer.compileAsync(depthScene,camera),dispose(){for(const m of materials.values())m.dispose()}};
}
