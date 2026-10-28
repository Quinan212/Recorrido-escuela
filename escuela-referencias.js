import {surfaceTexture} from './texturas.js';
// Detalles observados en las fotografías aportadas el 27/10/2026.
// Las posiciones son aproximaciones dentro del plano previamente construido.
export function detallarReferenciaEscuela({T,root,inventario,H,archBox,clipped,physicalUV,ceilings}){
 const {mat,add,box,rod,common,metal}=H;
 const pink=mat('#ffffff',{map:surfaceTexture({color:'#ad8172',seed:472,grain:14,paintWear:95})}),ivory=mat('#d4c8ab'),black=mat('#242927',{metalness:.45}),silver=mat('#e1e0d5',{metalness:.3});
 function lettering(text,parent,x,y,z,width,height,color='#dddcd1',bg=null,font='500 105px Arial'){const c=document.createElement('canvas');c.width=1536;c.height=256;const ctx=c.getContext('2d');if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height)}ctx.fillStyle=color;ctx.font=font;ctx.textAlign='center';ctx.textBaseline='middle';if(text==='BIENVENIDOS'){ctx.save();ctx.translate(768,0);ctx.scale(.67,1);ctx.fillText(text,0,128,1480);ctx.restore()}else ctx.fillText(text,768,128,1480);if(text==='BIENVENIDOS'){let state=367;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};ctx.globalCompositeOperation='source-atop';for(let i=0;i<4200;i++){ctx.fillStyle=i%3?'rgba(255,224,110,.24)':'rgba(93,60,9,.24)';ctx.fillRect(rand()*1536,rand()*256,.8+rand()*3,.8+rand()*2)}ctx.globalCompositeOperation='source-over'}const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(width,height),clipped(new T.MeshStandardMaterial({map,transparent:true,depthWrite:false,roughness:.8,side:T.DoubleSide})));o.position.set(x,y,z);parent.add(o);return o}
 const old=root.getObjectByName('Pórtico del ingreso principal');if(old){old.visible=false;old.name='Pórtico inicial reemplazado por referencia fotográfica'}
 const entrance=new T.Group();entrance.name='Acceso rosado según fotografías';entrance.position.set(24.25,0,20.84);root.add(entrance);
 // Pórtico saliente: la carpintería queda atrás en el plano de fachada.
 // Saliente decorativo de 1,25 m: con espesores deja unos 1,79 m hasta la puerta.
 const portalDepth=1.25,front=new T.Group();front.position.z=portalDepth;front.name='Frente saliente del pórtico';entrance.add(front);
 // Dos columnas de frente, sin muros ni retornos cerrando los costados del pórtico.
 for(const x of [-2.52,2.52]){const column=archBox(x,1.65,1.39,1.58,3.3,.32,pink,entrance);column.name='Columna frontal del pórtico abierto';inventario.colisiones.push(column)}
 const shape=new T.Shape();[[-3.31,3.3],[3.31,3.3],[3.31,5],[2.55,5],[2.55,5.48],[0,6.75],[-2.55,5.48],[-2.55,5],[-3.31,5]].forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const gable=add(new T.ExtrudeGeometry(shape,{depth:.30,bevelEnabled:false}),clipped(pink),front);gable.name='Frontón escalonado del acceso';
 archBox(0,3.30,.625,6.62,.22,1.85,pink,entrance).name='Cubierta profunda del pórtico';
 archBox(0,3.175,.625,6.58,.035,1.80,ivory,entrance).name='Sofito del acceso retranqueado';
 archBox(0,3.13,.70,.24,.035,.16,mat('#e9e6d6',{emissive:'#e9e6d6',emissiveIntensity:.45}),entrance).name='Luminaria bajo el pórtico';
 archBox(0,.012,.60,6.58,.025,1.85,ivory,entrance).name='Umbral del pórtico';
 archBox(0,3.15,-.05,3.2,.08,.16,silver,entrance);
 archBox(0,2.88,-.05,3.15,.51,.025,common.glass,entrance);for(const x of [-1.58,0,1.58])archBox(x,2.89,-.05,.05,.55,.10,silver,entrance);
 lettering('ESCUELA SECUNDARIA N°8',front,0,4.46,.32,3.35,.42,'#dddcd1',null,'500 120px Arial');lettering('AUGUSTO NIEZ',front,0,4.02,.32,3.35,.50,'#dddcd1',null,'500 180px Arial');
 archBox(0,3.78,.33,3.15,.025,.03,silver,front);archBox(0,4.27,.33,3.18,.018,.03,silver,front);
 for(const x of [-2.58,2.58]){const light=archBox(x,5.12,.35,.18,.11,.12,black,front);archBox(x,5.12,.42,.12,.055,.018,mat('#e9e6c7',{emissive:'#e9e6c7',emissiveIntensity:.5}),front)}
 rod([0,6.73,.1],[0,7.04,.1],.024,black,front);const globe=add(new T.SphereGeometry(.13,12,8),silver,front);globe.position.set(0,7.08,.1);
 // Dos hojas de reja abiertas; el eje central queda libre para la cámara.
 for(const side of [-1,1]){const gate=new T.Group();gate.name='Portón negro abierto';gate.position.set(side*1.86,0,1.72);gate.rotation.y=side<0?-1.42:1.42;entrance.add(gate);const dir=-side;for(const y of [.11,.82,1.66,2.55])archBox(dir*.93,y,0,1.86,.045,.055,black,gate);for(let k=0;k<=8;k++)archBox(dir*k*1.86/8,1.33,0,.027,2.64,.04,black,gate)}
 for(const side of [-1,1]){archBox(side*4.65,.68,1.45,5.4,1.36,.18,pink,entrance);for(let x=2.0;x<=7.25;x+=.21)archBox(side*x,1.91,1.45,.021,1.26,.025,black,entrance);archBox(side*4.65,2.5,1.45,5.4,.03,.04,black,entrance)}
 // Cielorraso del hall con juntas longitudinales y luminarias, sin luz por la cubierta.
 const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#cfceca';ctx.fillRect(0,0,512,512);for(let i=0;i<512;i+=32){ctx.fillStyle='#aaaead';ctx.fillRect(i,0,2,512);ctx.fillStyle='#e0e0db';ctx.fillRect(i+2,0,1,512)}const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(1,1);tex.colorSpace=T.SRGBColorSpace;const panel=clipped(mat('#ffffff',{map:tex,roughness:.55}));
 for(const ceiling of ceilings.children){const r=inventario.ambientes.find(a=>a.id===ceiling.userData.ambienteId);if(r?.tipo==='circulacion'||r?.id==='espacio-hall'){ceiling.material=panel;const pos=ceiling.geometry.attributes.position,uv=ceiling.geometry.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+ceiling.position.x)/3.2,(pos.getZ(i)+ceiling.position.z)/6);uv.needsUpdate=true}}
 const glow=mat('#ecebe0',{emissive:'#f7f4dd',emissiveIntensity:1.3});
 for(const z of [18.9,15.9,8.5,4.5,.5,-3.5,-7.5]){archBox(24.25,3.43,z,.12,.045,.75,glow);rod([24.25,3.48,z-.40],[24.25,3.48,z+.40],.07,ivory)}
 for(const z of [14,17,20])for(const x of [22.6,25.9])archBox(x,1.75,z,.11,3.5,.15,ivory);
 // Viga entre la esquina de la pared clara y la esquina del Centro de Estudiantes.
 const bienvenida=new T.Group();bienvenida.name='Viga de bienvenida junto al hall';
 bienvenida.position.set(24.25,0,7.2);root.add(bienvenida);
 archBox(0,2.83,0,3.42,.32,.22,common.cream,bienvenida);
 const welcome=lettering('BIENVENIDOS',bienvenida,0,2.83,.112,2.70,.24,'#a17a20',null,'900 195px Georgia');
 welcome.name='BIENVENIDOS · viga del hall';welcome.userData.texto='BIENVENIDOS';
 // Reja superior transversal al pasillo que sale del hall hacia el patio.
 const rejaHall=new T.Group();rejaHall.name='Reja superior del pasillo al patio';root.add(rejaHall);
 for(const y of [3.05,3.43])archBox(15.1,y,12.10,.035,.035,2.12,common.frame,rejaHall);
 for(let z=11.06;z<=13.14;z+=.16)archBox(15.1,3.24,z,.032,.38,.025,common.frame,rejaHall);
 // Listones horizontales en las dos paredes interiores de la esquina del hall.
 const tablasHall=[mat('#845337'),mat('#976443'),mat('#795039'),mat('#a16c47'),mat('#88583b')];
 for(let i=0;i<18;i++){const y=.13+i*.12;archBox(20.45,y,7.315,3.55,.102,.035,tablasHall[i%tablasHall.length]);archBox(18.515,y,9.10,.035,.102,3.45,tablasHall[(i+2)%tablasHall.length])}
 // El hall se representa según el plano: Espera abierta, sin cerramiento ni atención de kiosco.
 // Se retiran los accesorios añadidos al interpretar la foto: ventanilla, mostradores,
 // cartel KIOSCO y paneles que habían quedado superpuestos a la apertura de Espera.
 // Unidades de aire y bajadas visibles junto a los canteros.
 for(const z of [-7.8,-.7]){archBox(14.72,3.02,z,.46,.61,.85,common.frame);for(let k=0;k<8;k++)archBox(14.475,3.01,z-.32+k*.09,.02,.43,.025,metal);rod([14.80,3.03,z+.44],[14.80,.12,z+.44],.035,common.frame)}
}
