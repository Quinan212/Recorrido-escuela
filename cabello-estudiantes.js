import * as T from './vendor/three.module.js';

// E01–E15 conservan la correspondencia por ropa y posición del relevamiento.
// Las zonas tapadas en la foto siguen siendo aproximaciones; no se modelan caras.
const ajustes={
 E01:{largo:.45,ondas:.002,frente:1.20},
 E02:{largo:.43,ondas:.021,frente:1.03},
 E03:{largo:.25,ondas:.003,frente:1.20},
 E04:{frente:1.02},
 E05:{copete:.014,raya:.035,frente:1.18},
 E06:{largo:.63,ondas:.009,frente:1.02,raiz:'#30251e',tonoPuntas:'#3b2c22'},
 E07:{copete:.008,frente:1.23},
 E08:{copete:.006,frente:1.24},
 E09:{copete:.018,frente:1.15},
 E10:{copete:.012,frente:1.14},
 E11:{copete:.013,frente:1.15},
 E12:{volumen:.012,frente:1.21},
 E13:{volumen:.026,frente:1.19},
 E14:{copete:.011,frente:1.24},
 E15:{copete:.012,frente:1.16}
};
const texturas={};
function fibras(rizado=false){
 const key=rizado?'rizos':'liso';if(texturas[key])return texturas[key];
 const width=256,height=512,data=new Uint8Array(width*height);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const value=rizado?11*Math.sin(x*.84+Math.sin(y*.21)*2)*Math.cos(y*.82+Math.sin(x*.19)*2)
   :8*Math.sin(x*2.31+Math.sin(y*.021)*.8)+4*Math.sin(x*5.17+y*.008);
  data[y*width+x]=Math.round(128+value);
 }
 const texture=new T.DataTexture(data,width,height,T.RedFormat);
 texture.wrapS=T.RepeatWrapping;texture.magFilter=T.LinearFilter;
 texture.minFilter=T.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;
 texturas[key]=texture;return texture;
}
const smooth=(a,b,x)=>T.MathUtils.smoothstep(x,a,b);

export function crearCabelloEstudiante(persona,parent,original){
 const spec={...original,...ajustes[persona.id]},group=new T.Group();
 group.name='Peinado '+spec.tipo;group.userData.estilo=spec.tipo;parent.add(group);
 const base=new T.Color(persona.pelo),root=new T.Color(spec.raiz||persona.pelo),tips=new T.Color(spec.tonoPuntas||persona.pelo);
 const long=['largo','largo-flequillo','ondas','bob-flequillo'].includes(spec.tipo),curly=spec.tipo==='rizos',blond=persona.id==='E10';
 const material=new T.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.9,bumpMap:fibras(curly),bumpScale:curly?.0015:.00035});
 const tint=new T.Color();
 function color(v,u,top=false){
  const mix=top?(blond?.95:0):smooth(.32,1,v);
  tint.copy(root).lerp(top?base:tips,mix);
  const variation=1+.018*Math.sin(u*91+v*7)+.009*Math.sin(u*173-v*4);
  return [tint.r*variation,tint.g*variation,tint.b*variation];
 }
 function mesh(positions,indices,colors,uvs){
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));
  geo.setIndex(indices);geo.computeVertexNormals();
  const m=new T.Mesh(geo,material);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;
 }
 // Casquete ajustado a la misma elipsoide de la cabeza, con volumen continuo.
 const rings=curly?18:14,slices=curly?52:40,positions=[],indices=[],colors=[],uv=[];
 const volume=curly?spec.volumen:(spec.copete||.008)*.55;
 for(let i=0;i<=rings;i++)for(let j=0;j<=slices;j++){
  const v=i/rings,a=j/slices*Math.PI*2,front=(Math.cos(a)+1)/2;
  const end=T.MathUtils.lerp(long?2.24:2.03,spec.frente,Math.pow(front,2.7));
  const t=v*end,crown=Math.sin(t),wave=curly?(persona.id==='E13'?.0065:.0045)*Math.sin(a*13+t*11)*Math.sin(a*7-t*17):.0007*Math.sin(a*19+t*6);
  const spread=(curly?volume*.40:volume*.18)*crown+wave;
  const x=(.138+spread)*crown*Math.sin(a),z=.006+(.134+spread)*crown*Math.cos(a);
  const y=1.49+(.173+volume)*Math.cos(t)+.002*Math.sin(a*5)*crown;
  positions.push(x,y,z);
  const shade=blond?smooth(.25,1.35,1.65-t):0;
  tint.copy(root).lerp(base,blond?shade:1);const mod=1+.025*Math.sin(a*23+t*5);
  colors.push(tint.r*mod,tint.g*mod,tint.b*mod);uv.push(j/slices,v);
  if(i<rings&&j<slices){const k=i*(slices+1)+j;indices.push(k,k+slices+1,k+1,k+1,k+slices+1,k+slices+2)}
 }
 if(!long)mesh(positions,indices,colors,uv).name='Volumen continuo del cabello';

 // Mechones anchos y aplanados, integrados al volumen; sin tubos redondos.
 function mechon(points,width,thickness,{direction=new T.Vector3(1,0,0),top=false,steps=10}={}){
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');
  const p=[],idx=[],c=[],uv=[],sides=6,axis=new T.Vector3(),normal=new T.Vector3();
  for(let i=0;i<=steps;i++){
   const v=i/steps,center=curve.getPoint(v),tangent=curve.getTangent(v).normalize();
   axis.copy(direction).addScaledVector(tangent,-direction.dot(tangent)).normalize();normal.crossVectors(tangent,axis).normalize();
   const taper=.10+.90*Math.pow(Math.sin(Math.PI*(.12+.88*v)),.6);
   for(let j=0;j<=sides;j++){
    const a=j/sides*Math.PI*2,point=center.clone().addScaledVector(axis,Math.cos(a)*width*taper).addScaledVector(normal,Math.sin(a)*thickness*taper);
    p.push(...point.toArray());c.push(...color(v,j/sides,top));uv.push(j/sides,v);
    if(i<steps&&j<sides){const k=i*(sides+1)+j;idx.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1)}
   }
  }
  return mesh(p,idx,c,uv);
 }
 function frente(x,y){return .006+.134*Math.sqrt(Math.max(.02,1-(x/.138)**2-((y-1.49)/.173)**2))+.005}

 if(long){
  // Una sola superficie desde la coronilla hasta las puntas: sin junta horizontal.
  const cols=44,rows=22,p=[],idx=[],c=[],uv=[],layerSize=(cols+1)*(rows+1),length=spec.largo;
  for(let layer=0;layer<2;layer++)for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){
   const v=i/rows,a=j/cols*Math.PI*2,back=(1-Math.cos(a))/2;
   const boundary=T.MathUtils.lerp(2.24,spec.frente,Math.pow((Math.cos(a)+1)/2,2.7));
   const skirt=smooth(.20,.40,back),frontY=1.49+.173*Math.cos(boundary);
   const hem=1.575-length*(.92+.08*back)+.008*Math.sin(a*5);
   const endY=T.MathUtils.lerp(frontY,hem,skirt),y=T.MathUtils.lerp(1.663,endY,v);
   const below=smooth(1.49,1.49+length,2.98-y);
   const radius=y>1.49?Math.sqrt(Math.max(0,1-((y-1.49)/.173)**2)):1;
   const wave=(spec.ondas||0)*Math.sin(below*10+a*3)*smooth(0,.5,below);
   const groove=.0013*Math.cos(a*29+Math.sin(v*5))*Math.sin(v*Math.PI);
   const rx=Math.max(0,(.138+.011*below)*radius+wave+groove-layer*.012*radius);
   const rz=Math.max(0,(.134+.004*below)*radius+wave*.5+groove-layer*.012*radius);
   p.push(rx*Math.sin(a),y,.006-.025*below+rz*Math.cos(a));
   c.push(...color(below,j/cols));uv.push(j/cols,v);
   if(i<rows&&j<cols){const k=layer*layerSize+i*(cols+1)+j;if(!layer)idx.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);else idx.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1)}
  }
  function close(a,b){idx.push(a,b,a+layerSize,b,b+layerSize,a+layerSize)}
  for(let j=0;j<cols;j++)close(rows*(cols+1)+j,rows*(cols+1)+j+1);
  mesh(p,idx,c,uv).name='Masa de cabello largo';
  for(const side of [-1,1]){
   const w=spec.ondas||0;
   mechon([[side*.076,1.615,.048],[side*.111,1.51,.082],[side*(.112+w*.4),1.33,.081],[side*(.107+w*.8),1.575-length*.92,.071]],.030,.006);
   if(w>.012)mechon([[side*.11,1.57,.025],[side*.14,1.43,.03],[side*.130,1.22,.04],[side*.132,1.575-length*.96,.034]],.026,.006);
  }
 }

 const fringe=spec.tipo.includes('flequillo')||spec.tipo==='cortina';
 if(fringe){
  const n=spec.tipo==='cortina'?6:7;
  for(let i=0;i<n;i++){
   const u=i/(n-1),x=(u-.5)*.218;let endX=x,endY=1.532+.004*Math.sin(i*2.3),shift=0;
   if(spec.tipo==='largo-flequillo'||spec.tipo==='bob-flequillo')endY=1.523+.003*Math.sin(i*1.7);
   if(spec.tipo==='flequillo-corto')endY=1.548+.004*Math.sin(i*2.4);
   if(spec.tipo==='flequillo-irregular')endY=1.541+.008*Math.sin(i*2.1);
   if(spec.tipo==='flequillo-lateral'){shift=.037;endX=T.MathUtils.clamp(x+shift,-.12,.124);endY=1.505+u*.053}
   if(spec.tipo==='cortina'){shift=x<0?-.012:.012;endX=x+shift;endY=1.535+.017*(1-Math.abs(u-.5)*2)}
   const startX=x*.70+(spec.raya||0)*.3,midX=x*.92+shift*.35;
   mechon([[startX,1.627,frente(startX,1.627)],[midX,1.591,frente(midX,1.591)],[endX,endY,frente(endX,endY)]],.022,.0045,{top:blond});
  }
 }else if(!long&&spec.tipo!=='coleta'&&!curly){
  const n=6;
  for(let i=0;i<n;i++){
   const x=(i/(n-1)-.5)*.20,shift=(spec.raya||0)*.8,midX=x*.95+shift*.4,endX=x+shift*.6;
   const endY=1.545+.008*Math.sin(i*1.4)+(spec.tipo==='despeinado'?(i/(n-1)-.5)*.025:0);
   const startX=x*.72+shift*.2;
   mechon([[startX,1.625,frente(startX,1.625)],[midX,1.59,frente(midX,1.59)],[endX,endY,frente(endX,endY)]],.024,.004,{top:true});
  }
 }

 if(curly){
  // El rizo pertenece a la silueta y al relieve, sin bolitas ni resortes sueltos.
  for(let i=0;i<5;i++){
   const x=(i-2)*.043,endY=1.54+(persona.id==='E13'?-.008:.005)+.005*Math.sin(i*2);
   mechon([[x*.8,1.627,frente(x*.8,1.627)],[x+.009,1.59,frente(x+.009,1.59)],[x-.004,endY,frente(x-.004,endY)]],.027,.007,{top:true,steps:8});
  }
 }

 if(spec.tipo==='coleta'){
  mechon([[0,1.535,-.122],[.008,1.47,-.185],[.016,1.31,-.216],[.008,1.17,-.173]],.045,.028);
  const tie=new T.Mesh(new T.TorusGeometry(.036,.0045,4,16),new T.MeshStandardMaterial({color:'#333832',roughness:1}));
  tie.position.set(.005,1.474,-.179);tie.rotation.x=Math.PI/2;tie.castShadow=true;group.add(tie);
  for(const side of [-1,1])mechon([[side*.10,1.59,.045],[side*.132,1.535,-.025],[side*.08,1.51,-.113],[0,1.51,-.14]],.018,.003,{top:true});
 }
 return group;
}
