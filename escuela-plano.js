// Coordenadas iniciales en metros. Norte del dibujo arriba, no norte geográfico.
// Las fotos y las correcciones de Alan prevalecen sobre las divisiones del plano.
// Los sectores sin función confirmada se conservan sin inventar oficinas ni puertas.
const d=(side,at=.5,width=1.05)=>({side,at,width,type:'door',sill:0,height:2.25});
const v=(side,at=.5,width=2,sill=.90,height=1.74)=>({side,at,width,type:'window',sill,height});
const p=(side,at=.5,width=3.25)=>({side,at,width,type:'passage',sill:0,height:3.20});
const abierto=side=>({...p(side,.5,999),height:3.5,sinJambas:true});
export const ambientes=[];
function room(id,nombre,tipo,x0,x1,z0,z1,aberturas=[]){ambientes.push({id,nombre,tipo,x0,x1,z0,z1,aberturas});}
// Ala de cuatro aulas sobre calle de los Viñedos.
for(let i=0;i<4;i++){const x0=-15+i*7.5;room('aula-sur-'+(i+1),i===1?'Aula de 2.º C':'Aula sur '+(i+1),'aula',x0,x0+7.5,13.2,20.6,[d('N',.88),...(i===1?[v('N',.21,2.35,2.35,.58)]:[v('N',.32,3.1,2.35,.58)]),v('S',.25,2.02),v('S',.75,2.02),...(i===0?[v('W',.35,1.6),v('W',.73,1.6)]:[])]);}
room('deposito-galeria','Depósito galería','deposito',-15,-12,11.4,13.2,[d('N',.55,.85)]);
// Ala norte: dos aulas mayores, sanitarios, aula y paso a otra aula.
room('aula-norte-1','Aula norte 1','aula',-15,-3.5,-20.6,-13.2,[d('S',.88),v('S',.27,2.5,2.35,.58),v('S',.57,2.5,2.35,.58),v('N',.25,2.2),v('N',.7,2.2),v('W',.5,2)]);
room('aula-norte-2','Aula norte 2','aula',-3.5,8,-20.6,-13.2,[d('S',.88),v('S',.27,2.5,2.35,.58),v('S',.57,2.5,2.35,.58),v('N',.25,2.2),v('N',.7,2.2)]);
room('sanitarios-1','Sanitarios 1','sanitarios',8,11.5,-20.6,-13.2,[d('S',.5,.9),v('N',.5,1.95,2.35,.55),v('S',.5,1.95,2.55,.48)]);
room('sanitarios-2','Sanitarios 2','sanitarios',11.5,15,-20.6,-13.2,[d('S',.5,.9),v('N',.5,1.95,2.35,.55),v('S',.5,1.95,2.55,.48)]);
room('aula-norte-3','Aula norte 3','aula',15,22.5,-20.6,-13.2,[d('S',.88),v('S',.32,3.1,2.35,.58),v('N',.3,2),v('N',.75,2)]);
room('circulacion-norte','Circulación norte','circulacion',22.5,26,-20.6,-13.2,[{...d('N',.5,1.15),opaca:true,openAngle:0,sinRotulo:true},p('S',.5,3.25)]);
room('aula-noreste','Aula noreste','aula',26,33.4,-20.6,-13.2,[d('W',.7),v('N',.3,2),v('N',.73,2),v('E',.3,1.75),v('E',.73,1.75)]);
// Bloque interior junto a los canteros y al corredor.
room('aula-interior','Aula interior','aula',15,22.5,-11,-3.8,[d('E',.20),v('W',.3,1.8),v('W',.73,1.8)]);
room('prodise','Aula PRODISE','prodise',15,22.5,-3.8,3.4,[d('E',.25,1.2),v('W',.3,1.8),v('W',.73,1.8)]);
room('office','Office','office',15,18.2,3.4,7.2,[d('E',.75,.85),v('W',.5,1.5)]);
room('deposito-interior','Depósito interior','deposito',18.2,22.5,3.4,5.8,[d('S',.15,.85),{...v('E',.55,1.20,.90,1.50),sinRejas:true,divisiones:[1/3,2/3]}]);
room('paso-office','Paso office','circulacion',18.2,22.5,5.8,7.2,[{...p('E',.5,1.25),height:2.70}]);
// Baños confirmados por Alan: se conservan sus posiciones y puertas originales.
room('sanitario-accesible','Sanitario accesible','bano',15,16.7,7.2,11,[d('S',.5,.8),v('W',.65,.75,2.3,.5)]);
room('sanitario-docente','Sanitario docente','bano',16.7,18.4,7.2,11,[d('S',.5,.8)]);
// El plano de mayor calidad rotula este sector Espacio; conserva sus asientos dibujados.
room('espacio-hall','Espacio','espera',18.4,22.5,7.2,11,[abierto('E'),abierto('S')]);
room('circulacion-central','Circulación central','circulacion',22.5,26,-11,11,[abierto('N'),abierto('S')]);
// Bloque exterior oriental.
room('aula-este-1','Aula este 1','aula',26,33.4,-11,-3.8,[d('W',.2),v('E',.28,1.8),v('E',.72,1.8)]);
room('aula-este-2','Aula este 2','aula',26,33.4,-3.8,3.4,[d('W',.2),v('E',.28,1.8),v('E',.72,1.8)]);
// Acceso de Centro de Estudiantes al sur, hacia el ensanche del hall.
room('centro-estudiantes','Centro de estudiantes','centro',26,33.4,3.4,7.2,[{...d('S',.16,.95),openAngle:-.85},v('E',.5,1.6)]);
// Cooperadora se conserva en la ubicación del plano; no corresponde al kiosco marcado.
// Retranqueo del plano delante de Cooperadora.
room('ensanche-cooperadora','Ensanche del hall frente a Cooperadora','circulacion',26,29,7.2,11,[abierto('W'),abierto('S')]);
room('cooperadora','Cooperadora','office',29,33.4,7.2,11,[{...d('W',.22,.9),hingeRight:true,openAngle:.85},v('E',.5,1.5)]);
room('paso-norte-patio','Galería transversal norte','circulacion',15,33.4,-13.2,-11,[p('W',.5,1.95),p('E',.5,1.95)]);
room('hall','Paso · conexión al patio','circulacion',15,33.4,11,13.2,[{...p('W',.5,1.95),height:3.5},d('E',.5,1.2)]);
// Administración y acceso principal sobre calle de los Viñedos.
room('administracion','Administración','administracion',15,18.4,13.2,20.6,[{...d('N',.78,.85),height:2.62,openAngle:1.25,estiloPreceptoria:true},{...v('N',.43,1.15,.90,1.72),sinRejas:true,divisiones:[.37,.73]},{...v('S',.65,1.7,.90,1.74),divisiones:[.34,.68]}]);
// Dependencias y conexiones del recorte: Administración conecta con Vicedirección y esta con Dirección.
room('vicedireccion','Vicedirección','administracion',18.4,22.5,13.2,16.8,[d('W',.55,.85),v('N',.5,1.6,1.0,1.2)]);
room('direccion','Dirección','administracion',18.4,22.5,16.8,20.6,[d('N',.58,.85),v('S',.45,1.7)]);
room('ingreso','Ingreso principal','circulacion',22.5,26,13.2,20.6,[abierto('N'),{...d('S',.5,2.8),height:3,type:'entrance'}]);
// Ala derecha según la nomenclatura del plano de referencia.
room('maestros','Sala de maestros','maestros',26,29.6,13.2,20.6,[d('N',.25),v('N',.72,.95,1.0,1.2),v('S',.25,.9),v('S',.75,.9)]);
room('coordinacion','Coordinación pedagógica','administracion',29.6,33.4,13.2,20.6,[d('N',.5),v('N',.16,.78,1.0,1.2),v('N',.84,.78,1.0,1.2),v('E',.3,1.7),v('E',.72,1.7),v('S',.5,1.8)]);

// Vista aérea: alas norte y sur unidas por una cubierta continua oriental.
// Esta última incluye el hall y toda la espina de circulación, antes sin cubierta.
export const zonasCubierta=[
 {nombre:'Ala sur y aulas',x:0,z:13.2,length:30,depth:7.4,rotation:Math.PI},
 {nombre:'Ala norte y aulas',x:0,z:-13.2,length:30,depth:7.4,rotation:0},
 {nombre:'Bloque oriental completo, hall y pasillos',x:15,z:0,length:41.2,depth:18.4,rotation:-Math.PI/2}
];
