// Columnas desde la galería/puerta hacia las ventanas; fila 0 frente al pizarrón.
// Plaza 0: lado más próximo a la galería. Orden de ambas plazas provisional.
export const asignaciones=[
 {persona:'E04',columna:0,fila:0,plaza:0},
 {persona:'E02',columna:0,fila:0,plaza:1},
 {persona:'E01',columna:1,fila:2,plaza:0},
 {persona:'E06',columna:1,fila:2,plaza:1},
 {persona:'E03',columna:0,fila:2,plaza:0},
 {persona:'E15',columna:0,fila:2,plaza:1},
 {persona:'E09',columna:0,fila:3,plaza:0},
 {persona:'E11',columna:0,fila:3,plaza:1},
 // Columna junto al escritorio docente. Orden individual provisional.
 {persona:'E05',columna:3,fila:0,plaza:0},
 {persona:'E07',columna:3,fila:1,plaza:0},
 {persona:'E08',columna:3,fila:1,plaza:1},
 {persona:'E10',columna:3,fila:2,plaza:0},
 {persona:'E12',columna:3,fila:2,plaza:1},
 {persona:'E13',columna:3,fila:3,plaza:0},
 {persona:'E14',columna:3,fila:3,plaza:1},
 // Al fondo, detrás de las chicas; secuencia hacia el lado de las ventanas.
 {persona:'rol-registro',columna:1,fila:3,plaza:0},
 {persona:'rol-docente',columna:1,fila:3,plaza:1},
 {persona:'carlos',columna:2,fila:3,plaza:0}
];
// Mantener el mobiliario donde estaba: no desplazar mesas para asignar personas.
export const filasPreferidas={};

// Identidad de estos dos roles aún no indicada: figuras provisionales neutras.
export const perfilesDeRol=[
 {id:'rol-registro',nombre:'Practicante · registro',etiqueta:'Registro',ropa:'#656f75',pantalon:'#354856',pelo:'#423a30',rol:true},
 {id:'rol-docente',nombre:'Docente a cargo',etiqueta:'Docente',ropa:'#8c887a',pantalon:'#414744',pelo:'#494236',rol:true}
];
