import * as T from './vendor/three.module.js';
import {SSAOPass} from './vendor/addons/postprocessing/SSAOPass.js';
import {OutputPass} from './vendor/addons/postprocessing/OutputPass.js';
import {crearPrepasoProfundidad} from './prepaso-profundidad.js';

// Conserva el mismo kernel, normales, profundidad y desenfoque de SSAOPass.
// La multiplicación por AO se hace al convertir el color final: evita copiar
// otra vez la imagen HDR completa y mantener un segundo buffer HDR.
export class OclusionSinCopia extends SSAOPass{
 constructor(...args){
  super(...args);
  for(const target of [this.ssaoRenderTarget,this.blurRenderTarget]){
   target.texture.format=T.RedFormat;target.depthBuffer=false;
  }
  // Un filtro lineal entre dos texeles equivale a promediarlos. Nueve
  // lecturas ponderadas conservan el filtro de caja original de 5 × 5.
  this.blurMaterial.fragmentShader=`
   uniform sampler2D tDiffuse;uniform vec2 resolution;varying vec2 vUv;
   void main(){
    vec2 texel=1.0/resolution;float sum=0.0;
    for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
     float weight=float(x==0?1:2)*float(y==0?1:2);
     sum+=texture2D(tDiffuse,vUv+vec2(float(x),float(y))*1.5*texel).r*weight;
    }
    gl_FragColor=vec4(vec3(sum/25.0),1.0);
   }`;
 }
 render(renderer){
  this._overrideVisibility();
  try{this._renderOverride(renderer,this.normalMaterial,this.normalRenderTarget,0x7777ff,1)}
  finally{this._restoreVisibility()}
  this.ssaoMaterial.uniforms.kernelRadius.value=this.kernelRadius;
  this.ssaoMaterial.uniforms.minDistance.value=this.minDistance;
  this.ssaoMaterial.uniforms.maxDistance.value=this.maxDistance;
  this._renderPass(renderer,this.ssaoMaterial,this.ssaoRenderTarget);
  this._renderPass(renderer,this.blurMaterial,this.blurRenderTarget);
 }
}

export function crearCompositorEficiente(renderer,scenePass,ao,{prepasoProfundidad=false}={}){
 const color=new T.WebGLRenderTarget(1,1,{type:T.HalfFloatType});
 color.texture.name='Color HDR del recorrido';
 const depthPass=prepasoProfundidad?crearPrepasoProfundidad(scenePass.scene,scenePass.camera):null;
 const output=new OutputPass();output.renderToScreen=true;
 output.uniforms.tOclusion={value:ao.blurRenderTarget.texture};
 output.uniforms.oclusionActiva={value:1};
 output.material.fragmentShader=output.material.fragmentShader.replace('uniform sampler2D tDiffuse;',
  'uniform sampler2D tDiffuse;uniform sampler2D tOclusion;uniform float oclusionActiva;').replace(
  'gl_FragColor = texture2D( tDiffuse, vUv );',
  'gl_FragColor = texture2D( tDiffuse, vUv );gl_FragColor.rgb *= mix(1.0, texture2D(tOclusion,vUv).r, oclusionActiva);'
 );
 return {
  renderer,passes:[scenePass,ao,output],renderTarget1:color,readBuffer:color,prepasoActivo:false,
  render(){
   const previous=renderer.getRenderTarget();
   try{
    if(scenePass.enabled){
     const clear=scenePass.clear;
     try{
      if(depthPass&&this.prepasoActivo){depthPass.render(renderer,color);scenePass.clear=false}
      scenePass.render(renderer,null,color);
     }finally{scenePass.clear=clear}
    }
    if(ao.enabled)ao.render(renderer);
    output.uniforms.oclusionActiva.value=ao.enabled?1:0;
    output.render(renderer,null,color);
   }finally{renderer.setRenderTarget(previous)}
  },
  setSize(w,h){const ratio=renderer.getPixelRatio();color.setSize(Math.round(w*ratio),Math.round(h*ratio));scenePass.setSize(Math.round(w*ratio),Math.round(h*ratio))},
  preparar:()=>depthPass?.preparar(renderer),
  dispose(){color.dispose();ao.dispose();scenePass.dispose();output.dispose();depthPass?.dispose()}
 };
}
