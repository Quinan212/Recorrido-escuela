# Recorrido digital de la Escuela Don Augusto Niez

Visita interactiva de la Escuela Secundaria N.º 8 «Don Augusto Niez», Concordia, y del aula de 2.º C.

## Abrir el recorrido

[Abrir el recorrido interactivo](https://quinan212.github.io/Recorrido-escuela/).

La versión pública se publica con GitHub Pages desde la rama `main`.

## Controles

| Acción | Control |
| --- | --- |
| Avanzar y retroceder | W / S o ↑ / ↓ |
| Moverse hacia los costados | A / D o ← / → |
| Mirar alrededor | Arrastrar sobre la escena |
| Entrar directamente al aula | Botón «Ir al aula de 2.º C» |
| Regresar al hall | Botón «Caminar» |
| Ver la escuela desde arriba | Botón «Vista aérea» |
| Acercar o alejar en vista aérea | Rueda del mouse |
| Moverse en celular o tablet | Flechas táctiles en pantalla |
| Mirar en celular o tablet | Deslizar sobre la escena |

## Ejecutar localmente

Desde esta carpeta:

```sh
python -m http.server 8080
```

Abrir `http://localhost:8080` en un navegador con WebGL 2.

## Proyecto

Los modelos, las texturas procedurales y los controles se incluyen en este repositorio. No se necesita instalar paquetes ni compilar. Las rutas son relativas para que el recorrido funcione dentro de un sitio de proyecto en GitHub Pages.

- `index.html`, `vista.css` e `inicio.js`: interfaz y carga.
- `escuela-viewer.js`: cámaras, movimiento y colisiones.
- `escuela-escena.js`, `escuela-plano.js` y módulos de mobiliario: modelo de la escuela.
- `estilo-escuela.js`: acabados, luces, sombras y oclusión ambiental.
- `vendor/`: Three.js r181 y los complementos utilizados.

El recorrido interactivo usa iluminación adaptada a la posición de la cámara para mantener la fluidez.

## Dependencias

Three.js se distribuye bajo licencia MIT. Se conserva su aviso en `vendor/LICENSE` y en `vendor/addons/LICENSE`.
