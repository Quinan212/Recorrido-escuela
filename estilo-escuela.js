import * as T from './vendor/three.module.js';
import {EffectComposer} from './vendor/addons/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/addons/postprocessing/RenderPass.js';
import {SSAOPass} from './vendor/addons/postprocessing/SSAOPass.js';
import {OutputPass} from './vendor/addons/postprocessing/OutputPass.js';
import {RenderLucesCompletas} from './render-luces-completas.js';
import {OclusionSinCopia,crearCompositorEficiente} from './render-oclusion-eficiente.js';

// Acabados e iluminación compartidos por el recorrido y el visor de la escuela.
export function prepararEstiloEscuela({scene,renderer,school,lucesCompletas=false}) {
    renderer.toneMappingExposure=1.15;
    const hemi=[];
    scene.traverse(o=>{if(o.isHemisphereLight){o.intensity=1.95;hemi.push(o);}});
    const rooms=school.inventario.ambientes;
    for(const room of rooms){
        const m=room.suelo.material;
        m.roughness=1;m.metalness=0;
        if(room.id==='aula-sur-2'){
            m.color.set('#a8aaa5');m.bumpMap=m.map;m.bumpScale=.0011;
        }
        m.needsUpdate=true;
    }
    school.root.traverse(o=>{
        if(!o.isMesh||!/^(Patio|Vereda|Suelo|Terreno)/.test(o.name))return;
        for(const m of Array.isArray(o.material)?o.material:[o.material]){
            if(m.isMeshStandardMaterial){m.roughness=1;m.metalness=0;}
        }
    });
    const fixtures=new T.Group();fixtures.name='Luminarias del recorrido';
    school.ceilings.add(fixtures);
    const panelMat=new T.MeshStandardMaterial({color:'#dedfd7',roughness:1});
    const housingMat=new T.MeshStandardMaterial({color:'#c9ccc5',roughness:.9});
    const emitterMat=new T.MeshStandardMaterial({color:'#ffffff',emissive:'#ffffff',emissiveIntensity:1.2,roughness:.8});
    function box(x,y,z,w,h,d,material,name){
        const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);
        mesh.position.set(x,y,z);mesh.name=name;mesh.castShadow=false;mesh.receiveShadow=true;
        fixtures.add(mesh);return mesh;
    }
    // Mismas cuatro luminarias y retícula del modelo independiente del aula.
    for(let x=-7.2;x<0;x+=.6)for(let z=13.5;z<20.6;z+=.6)
        box(x,3.485,z,.594,.025,.594,panelMat,'Panel del cielorraso del aula');
    const specs=[];
    function fixture(x,z,{room,height=3.5}={}){
        box(x,height-.067,z,1.18,.055,.19,housingMat,'Carcasa de luminaria · '+room);
        box(x,height-.105,z,1.13,.025,.15,emitterMat,'Difusor de luminaria · '+room);
        specs.push({x,z,y:height-.17,room});
    }
    for(const x of [-5.4,-2.1])for(const z of [15.272,18.528])fixture(x,z,{room:'aula-sur-2'});
    const visited=new Set(['ingreso','hall','circulacion-central','espacio-hall','ensanche-cooperadora']);
    for(const r of rooms.filter(r=>visited.has(r.id))){
        const nx=Math.max(1,Math.round((r.x1-r.x0)/4.5));
        const nz=Math.max(1,Math.round((r.z1-r.z0)/4.5));
        for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++)
            fixture(r.x0+(ix+.5)*(r.x1-r.x0)/nx,r.z0+(iz+.5)*(r.z1-r.z0)/nz,{room:r.id});
    }
    // Galería cubierta entre el hall, el patio y el aula.
    for(const x of [-12,-6,0,6,12])fixture(x,12.1,{room:'galeria-sur',height:3.28});
    // Seis luces reutilizables mantienen estable el shader al pasar entre espacios.
    const lights=Array.from({length:lucesCompletas?specs.length:6},(_,i)=>{
        const spec=lucesCompletas?specs[i]:null;
        const light=new T.SpotLight(0xf5f2e9,spec?(spec.room==='aula-sur-2'?16:14):0,9,1.15,.95,2);
        light.name='Luz interior del recorrido · '+i;
        light.position.set(spec?.x??24,spec?.y??3.33,spec?.z??17);light.target.position.set(spec?.x??24,.65,spec?.z??17);
        light.castShadow=true;light.shadow.mapSize.set(2048,2048);
        light.shadow.camera.near=.15;light.shadow.camera.far=12;
        light.shadow.bias=-.00015;light.shadow.normalBias=.015;
        light.shadow.autoUpdate=false;light.shadow.needsUpdate=lucesCompletas;
        light.visible=lucesCompletas;
        light.userData.fixture=-1;scene.add(light,light.target);return light;
    });
    const daylight=new T.DirectionalLight(0xe9f4ff,.65);
    daylight.name='Luz difusa de las ventanas del aula';
    daylight.position.set(-4.6,3.4,20.1);daylight.target.position.set(-3.1,.7,14.1);
    daylight.intensity=lucesCompletas?.65:0;scene.add(daylight,daylight.target);
    let lastLights='';
    function actualizar(camera,{mapa=false,forceShadows=false}={}){
        const {x,y,z}=camera.position;
        const room=rooms.find(r=>x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1&&y<3.65);
        const gallery=x>=-15&&x<=15&&z>=11&&z<=13.2&&y<3.3;
        const inside=!mapa&&!!(room||gallery);
        const aula=rooms.find(r=>r.id==='aula-sur-2');
        if(!mapa)aula.suelo.material.color.set('#a8aaa5');
        if(lucesCompletas){
            if(forceShadows)for(const light of lights)light.shadow.needsUpdate=true;
            return {changed:false,inside};
        }
        daylight.intensity=inside&&room?.id==='aula-sur-2' ? .65 : 0;
        const nearby=!mapa&&y<5?specs.map((s,i)=>({i,d:Math.hypot(x-s.x,z-s.z)}))
            .filter(s=>s.d<7.5).sort((a,b)=>a.d-b.d).slice(0,6).map(s=>s.i).sort((a,b)=>a-b):[];
        const key=nearby.slice().sort((a,b)=>a-b).join(',');
        const changed=key!==lastLights;
        const retained=new Set();
        for(const light of lights)if(nearby.includes(light.userData.fixture))retained.add(light.userData.fixture);
        const pending=nearby.filter(i=>!retained.has(i));
        lights.forEach(light=>{
            const index=nearby.includes(light.userData.fixture)?light.userData.fixture:pending.shift()??-1,s=specs[index];
            light.visible=nearby.length>0;
            light.intensity=s?(s.room==='aula-sur-2'?16:14):0;
            if(s&&light.userData.fixture!==index){
                light.position.set(s.x,s.y,s.z);light.target.position.set(s.x,.65,s.z);
                light.shadow.needsUpdate=true;
            }
            if(s&&forceShadows)light.shadow.needsUpdate=true;
            light.userData.fixture=index;
        });
        if(changed){
            lastLights=key;renderer.shadowMap.needsUpdate=true;
        }
        return {changed,inside};
    }
    return {actualizar,fixtures,specs,lights,daylight,rooms,hemi,lucesCompletas};
}

export function crearRenderConOclusion({scene,camera,renderer,estilo,width,height,escalaAO=.75,prepasoProfundidad=false}){
    const scenePass=estilo.lucesCompletas?new RenderLucesCompletas(scene,camera,estilo.lights,width,height):new RenderPass(scene,camera);
    let seed=281026,ao;
    const previousRandom=Math.random;
    try{
        Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
        const AmbientPass=estilo.lucesCompletas?SSAOPass:OclusionSinCopia;
        ao=new AmbientPass(scene,camera,width,height,64);
    }finally{Math.random=previousRandom;}
    ao.kernelRadius=.35;ao.minDistance=.001;ao.maxDistance=.035;
    const composer=estilo.lucesCompletas?new EffectComposer(renderer):crearCompositorEficiente(renderer,scenePass,ao,{prepasoProfundidad});
    if(estilo.lucesCompletas){composer.addPass(scenePass);composer.addPass(ao);composer.addPass(new OutputPass())}
    function setSize(w,h){
        composer.setSize(w,h);
        const pixelRatio=renderer.getPixelRatio();
        ao.setSize(Math.round(w*pixelRatio*escalaAO),Math.round(h*pixelRatio*escalaAO));
    }
    function render({mapa=false}={}){
        const state=estilo.actualizar(camera,{mapa,forceShadows:renderer.shadowMap.needsUpdate});
        if(prepasoProfundidad)composer.prepasoActivo=state.inside;
        ao.kernelRadius=estilo.lucesCompletas ? .35 : state.inside ? .35 : .65;
        ao.ssaoMaterial.uniforms.cameraNear.value=camera.near;
        ao.ssaoMaterial.uniforms.cameraFar.value=camera.far;
        ao.ssaoMaterial.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);
        ao.ssaoMaterial.uniforms.cameraInverseProjectionMatrix.value.copy(camera.projectionMatrixInverse);
        composer.render();return state;
    }
    setSize(width,height);
    async function preparar(){
        if(scenePass.prepararMateriales)return scenePass.prepararMateriales(renderer);
        await renderer.compileAsync(scene,camera);
        const visibility=estilo.lights.map(l=>l.visible);
        try{
            for(const light of estilo.lights)light.visible=false;
            await renderer.compileAsync(scene,camera);
        }finally{estilo.lights.forEach((l,i)=>{l.visible=visibility[i]})}
        await composer.preparar?.();
    }
    return {composer,ao,render,setSize,preparar,scenePass};
}
