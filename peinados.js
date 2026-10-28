import * as THREE from './vendor/three.module.js';

// Interpretaciones estilizadas del pelo visible; las partes ocultas son aproximadas.
export const estilosPelo={
 griselda:{tipo:'melena',largo:.37,ondas:.011,raya:-.045,tonoPuntas:'#cbb88b'},
 carlos:{tipo:'corto',copete:.012,raya:.035},
 gonzalo:{tipo:'barrido',copete:.028,raya:-.04},
 alan:{tipo:'texturado',copete:.022},
 agustin:{tipo:'corto',copete:.006,raya:.03},
 E01:{tipo:'largo-flequillo',largo:.43,ondas:.003,raya:0},
 E02:{tipo:'ondas',largo:.40,ondas:.019,raya:.01,tonoPuntas:'#9e7f61'},
 E03:{tipo:'bob-flequillo',largo:.25,ondas:.006,raya:0},
 E04:{tipo:'coleta',raya:-.025},
 E05:{tipo:'despeinado',copete:.035,raya:.04},
 E06:{tipo:'largo',largo:.49,ondas:.010,raya:-.04},
 E07:{tipo:'flequillo-corto',copete:.015},
 E08:{tipo:'flequillo-corto',copete:.011},
 E09:{tipo:'texturado',copete:.028,raya:.02},
 E10:{tipo:'cortina',copete:.02,raya:0,raiz:'#66553d'},
 E11:{tipo:'flequillo-lateral',copete:.018,raya:-.05},
 E12:{tipo:'rizos',volumen:.011},
 E13:{tipo:'rizos',volumen:.032},
 E14:{tipo:'flequillo-irregular',copete:.018},
 E15:{tipo:'texturado',copete:.018,raya:-.02}
};

export function crearPeinado(persona,parent){
 const spec=estilosPelo[persona.id]||{tipo:'corto'},group=new THREE.Group();group.name='Peinado '+spec.tipo;group.userData.estilo=spec.tipo;parent.add(group);
 const baseColor=new THREE.Color(persona.pelo),rootColor=new THREE.Color(spec.raiz||persona.pelo),tipColor=new THREE.Color(spec.tonoPuntas||persona.pelo);
 const base=new THREE.MeshStandardMaterial({color:rootColor,roughness:.92});const highlight=new THREE.MeshStandardMaterial({color:baseColor.clone().lerp(new THREE.Color('#b7ac92'),.14),roughness:.88});
 function add(geometry,material=base){const m=new THREE.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
 function lock(points,r,material=base){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal'),geo=new THREE.TubeGeometry(curve,16,r,6,false),pos=geo.attributes.position;
 for(let i=0;i<=16;i++){const u=i/16,center=curve.getPointAt(u),factor=.16+.84*Math.pow(Math.sin(Math.PI*u),.38);for(let j=0;j<=6;j++){const k=i*7+j;pos.setXYZ(k,center.x+(pos.getX(k)-center.x)*factor,center.y+(pos.getY(k)-center.y)*factor,center.z+(pos.getZ(k)-center.z)*factor)}}geo.computeVertexNormals();return add(geo,material)}
 const isLong=['melena','largo','largo-flequillo','ondas','bob-flequillo'].includes(spec.tipo),isFringe=spec.tipo.includes('flequillo')||spec.tipo==='cortina';
 const verts=[],idx=[],cols=[];const rings=20,slices=48;
 for(let i=0;i<=rings;i++)for(let j=0;j<=slices;j++){const v=i/rings,a=j/slices*Math.PI*2,front=(Math.cos(a)+1)/2;let end=THREE.MathUtils.lerp(isLong?2.16:1.94,isFringe?1.32:1.04,Math.pow(front,3));const t=v*end,noise=spec.tipo==='texturado'||spec.tipo==='despeinado'?.003*Math.sin(a*11+v*19):.0007*Math.sin(a*21);const lift=(spec.copete||.008)*Math.pow(Math.max(0,Math.sin(t)),2)*Math.max(0,Math.cos(a));verts.push((.134+noise)*Math.sin(t)*Math.sin(a),1.49+(.171+lift+noise)*Math.cos(t),(.131+noise)*Math.sin(t)*Math.cos(a));cols.push(rootColor.r,rootColor.g,rootColor.b);if(i<rings&&j<slices){const k=i*(slices+1)+j;idx.push(k,k+slices+1,k+1,k+1,k+slices+1,k+slices+2)}}
 const cap=new THREE.BufferGeometry();cap.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));cap.setIndex(idx);cap.computeVertexNormals();add(cap);
 if(isLong){const pos=[],indices=[],colors=[],length=spec.largo,segments=38,rows=24;for(let i=0;i<=rows;i++)for(let j=0;j<=segments;j++){const v=i/rows,a=Math.PI*(.35+1.3*j/segments),wave=(spec.ondas||0)*Math.sin(v*13+a*4)*Math.sin(v*Math.PI*.8),rx=.139+.01*Math.sin(v*Math.PI)+wave,rz=.117+wave*.6;const hem=.012*Math.cos(a*7);pos.push(rx*Math.sin(a)+(spec.raya||0)*.14*(1-v),1.57-v*length+hem*Math.pow(v,5),rz*Math.cos(a)-.019);const c=rootColor.clone().lerp(tipColor,Math.pow(v,1.5));colors.push(c.r,c.g,c.b);if(i<rows&&j<segments){const k=i*(segments+1)+j;indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();add(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,side:THREE.DoubleSide}));
 for(let j=0;j<19;j++){const a=Math.PI*(.37+1.26*j/18),pts=[];for(let i=0;i<8;i++){const v=i/7,wave=(spec.ondas||0)*Math.sin(v*13+a*4)*Math.sin(v*Math.PI*.8);pts.push([(.143+wave)*Math.sin(a),1.56-v*length+.012*Math.cos(a*7)*v**5,(.122+wave*.6)*Math.cos(a)-.019])}lock(pts,j%3===0?.004:.0023,j%3===0?highlight:base)}
 // Mechones laterales, con raya y largos distintos, sin pintar rasgos en la cara.
 for(const side of [-1,1])lock([[side*.09,1.60,.058],[side*.133,1.49,.069],[side*.14,1.35,.071],[side*(.125+(spec.ondas||0)),1.58-length,.052]],.018,side<0&&spec.tonoPuntas?highlight:base);
 }
 if(isFringe){const count=spec.tipo==='cortina'?12:16;for(let i=0;i<count;i++){const u=i/(count-1),x=(u-.5)*.235;let endY=1.51+.014*Math.sin(i*2.7),endX=x;if(spec.tipo==='flequillo-lateral'){endX=x+.045;endY=1.48+u*.06}if(spec.tipo==='cortina'){endX=x+(u<.5?-.018:.018);endY=1.52-.035*Math.abs(u-.5)*2}if(spec.tipo==='flequillo-corto')endY=1.53+.01*Math.sin(i*1.8);lock([[x*.7+(spec.raya||0),1.626,.062],[x,1.59,.108],[endX,endY,.125]],.010,i%5===0?highlight:base)}}
 if(['corto','barrido','texturado','despeinado'].includes(spec.tipo)){for(let i=0;i<15;i++){const u=(i/14-.5)*.21,shift=spec.tipo==='barrido'?.055:(spec.raya||0);lock([[u*.8,1.59,-.070],[u*.85+shift*.25,1.651+(spec.copete||0)*.28,-.005],[u*.92+shift*.55,1.615+(spec.copete||0)*.35,.072],[u+shift*.35,1.577,.107]],spec.tipo==='corto'?.0035:.006,i%5===0?highlight:base)}}
 if(spec.tipo==='coleta'){for(let i=0;i<16;i++){const a=i/16*Math.PI*2;lock([[Math.sin(a)*.035,1.48,-.115],[Math.sin(a)*.045,1.43,-.19],[Math.sin(a)*.032,1.28,-.20],[Math.sin(a)*.024,1.20,-.16]],.009,i%4===0?highlight:base)}const tie=add(new THREE.TorusGeometry(.044,.007,5,20),new THREE.MeshStandardMaterial({color:'#393c36',roughness:1}));tie.position.set(0,1.46,-.153);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;lock([[Math.sin(a)*.1,1.58,Math.cos(a)*.08],[Math.sin(a)*.105,1.62,Math.cos(a)*.075],[Math.sin(a)*.035,1.49,-.145]],.003,highlight)}}
 if(spec.tipo==='rizos'){const n=spec.volumen>.02?55:40;for(let i=0;i<n;i++){const a=i*2.39996,t=Math.acos(1-(i+.5)/n*.68),r=.018+(spec.volumen||0)*.3;const center=new THREE.Vector3(.127*Math.sin(t)*Math.cos(a),1.50+(.16+(spec.volumen||0))*Math.cos(t),.123*Math.sin(t)*Math.sin(a));const pts=[];for(let j=0;j<15;j++){const f=j/14,phi=f*Math.PI*3;pts.push([center.x+r*Math.cos(phi),center.y+r*Math.sin(phi),center.z+(f-.5)*.025])}lock(pts,.005,i%6===0?highlight:base)}}
 return group;
}
