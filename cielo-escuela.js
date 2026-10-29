import * as T from './vendor/three.module.js';

// Fondo determinista compartido entre el recorrido y el video: cielo abierto
// con seis nubes pequeñas, separado de la iluminación física del edificio.
export function crearCielo(){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;
 const ctx=canvas.getContext('2d'),sky=ctx.createLinearGradient(0,0,0,1024);
 for(const [stop,color] of [[0,'#3986bf'],[.28,'#67afda'],[.50,'#b4d8e9'],[.70,'#d2e0df'],[1,'#dfe3db']])sky.addColorStop(stop,color);
 ctx.fillStyle=sky;ctx.fillRect(0,0,2048,1024);
 let seed=98271;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let j=0;j<6;j++){
  const cx=(j+.3+random()*.35)*2048/6,cy=230+random()*170,scale=38+random()*27;
  for(let k=0;k<8;k++){
   const x=cx+(random()-.5)*scale*2.1,y=cy+(random()-.5)*scale*.24,rx=scale*(.28+random()*.31),ry=rx*(.36+random()*.14);
   for(const wrap of [-2048,0,2048]){
    ctx.save();ctx.translate(x+wrap,y);ctx.scale(1,ry/rx);
    const puff=ctx.createRadialGradient(0,0,0,0,0,rx);
    puff.addColorStop(0,'rgba(255,255,255,.30)');puff.addColorStop(.60,'rgba(255,255,255,.14)');puff.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=puff;ctx.beginPath();ctx.arc(0,0,rx,0,Math.PI*2);ctx.fill();ctx.restore();
   }
  }
 }
 const texture=new T.CanvasTexture(canvas);texture.mapping=T.EquirectangularReflectionMapping;texture.colorSpace=T.SRGBColorSpace;
 return texture;
}
