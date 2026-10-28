import * as T from './vendor/three.module.js';
import {Pass,FullScreenQuad} from './vendor/addons/postprocessing/Pass.js';

// Todas las luces aportan en cada cuadro. Se suman grupos fijos en espacio lineal
// para respetar el límite de texturas de sombra de WebGL, sin selección por cámara.
export class RenderLucesCompletas extends Pass {
    constructor(scene,camera,lights,width,height){
        super();this.scene=scene;this.camera=camera;this.lights=lights;this.needsSwap=false;
        this.groups=[];
        for(let i=0;i<lights.length;i+=6)this.groups.push(lights.slice(i,i+6));
        this.extra=new T.WebGLRenderTarget(width,height,{type:T.HalfFloatType});
        this.addMaterial=new T.ShaderMaterial({
            uniforms:{tDiffuse:{value:this.extra.texture}},
            vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}',
            fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){gl_FragColor=texture2D(tDiffuse,vUv);}',
            transparent:true,depthTest:false,depthWrite:false,toneMapped:false,
            blending:T.CustomBlending,blendEquation:T.AddEquation,
            blendSrc:T.OneFactor,blendDst:T.OneFactor,
            blendEquationAlpha:T.AddEquation,blendSrcAlpha:T.ZeroFactor,blendDstAlpha:T.OneFactor
        });
        this.quad=new FullScreenQuad(this.addMaterial);
        this.black=new T.Color(0,0,0);this.lastGroups=0;
    }
    estado(){
        const allLights=[],materials=new Set();
        this.scene.traverse(o=>{
            if(o.isLight)allLights.push([o,o.visible]);
            if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);
        });
        return {
            background:this.scene.background,
            fog:this.scene.fog?.color.clone(),
            lights:allLights,
            emissives:[...materials].filter(m=>m.emissive).map(m=>[m,m.emissiveIntensity]),
            basics:[...materials].filter(m=>m.isMeshBasicMaterial||m.isSpriteMaterial).map(m=>[m,m.color.clone()])
        };
    }
    grupo(index,state){
        const selected=new Set(this.groups[index]);
        for(const [light,visible] of state.lights)
            light.visible=this.lights.includes(light)?selected.has(light):index===0&&visible;
        this.scene.background=index===0?state.background:this.black;
        if(this.scene.fog)this.scene.fog.color.copy(index===0?state.fog:this.black);
        for(const [m,intensity] of state.emissives)m.emissiveIntensity=index===0?intensity:0;
        for(const [m,color] of state.basics)m.color.copy(index===0?color:this.black);
    }
    restaurar(state){
        this.scene.background=state.background;
        if(this.scene.fog)this.scene.fog.color.copy(state.fog);
        for(const [light,visible] of state.lights)light.visible=visible;
        for(const [m,intensity] of state.emissives)m.emissiveIntensity=intensity;
        for(const [m,color] of state.basics)m.color.copy(color);
    }
    async prepararMateriales(renderer){
        const state=this.estado(),target=renderer.getRenderTarget();
        try{
            renderer.setRenderTarget(this.extra);
            for(let i=0;i<this.groups.length;i++){
                this.grupo(i,state);
                await renderer.compileAsync(this.scene,this.camera);
            }
        }finally{this.restaurar(state);renderer.setRenderTarget(target);}
    }
    render(renderer,writeBuffer,readBuffer){
        const state=this.estado(),target=renderer.getRenderTarget();
        const autoClear=renderer.autoClear,clearColor=renderer.getClearColor(new T.Color()),clearAlpha=renderer.getClearAlpha();
        const refreshShadows=renderer.shadowMap.needsUpdate;
        this.lastGroups=0;
        try{
            renderer.autoClear=false;
            for(let i=0;i<this.groups.length;i++){
                this.grupo(i,state);
                renderer.setRenderTarget(i===0?readBuffer:this.extra);
                renderer.setClearColor(i===0?clearColor:this.black,i===0?clearAlpha:0);
                renderer.clear(true,true,true);
                renderer.shadowMap.needsUpdate=refreshShadows||this.groups[i].some(l=>l.shadow.needsUpdate);
                renderer.render(this.scene,this.camera);
                if(i>0){renderer.setRenderTarget(readBuffer);this.quad.render(renderer);}
                this.lastGroups++;
            }
        }finally{
            this.restaurar(state);renderer.setRenderTarget(target);
            renderer.setClearColor(clearColor,clearAlpha);renderer.autoClear=autoClear;
        }
    }
    setSize(width,height){this.extra.setSize(width,height);}
    dispose(){this.extra.dispose();this.addMaterial.dispose();this.quad.dispose();}
}
