import { Injectable, HostListener } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type BaseAction = 'Idle';
type AdditiveAction = 'openMouth' | 'arms_move1' | 'arms_move2' | 'arms_move3' ;

interface ActionSettings {
  weight: number;
  action?: THREE.AnimationAction;
}

interface personaje {
  id: number;
  glb: string;
  camPY: number;
  camTargectY: number;

}

const baseActions: Record<BaseAction, ActionSettings> = {
  Idle: { weight: 1 }
};

const additiveActions: Record<AdditiveAction, ActionSettings> = {
  openMouth: { weight: 0 },
  arms_move2: { weight: 0 },
  arms_move1: { weight: 0 },
  arms_move3: { weight: 0 },
};

const crossFadeControls: any[] = [];
let currentBaseAction: BaseAction = 'Idle';
const allActions: THREE.AnimationAction[] = [];

interface AnimationMixerEvent extends THREE.Event {
  action: THREE.AnimationAction;
}

const allowedMorphNames = [
  'Lip_Open', 'Mouth_Widen', 'Mouth_Plosive', 'Mouth_Lips_Part', 
  'Dental_Lip', 'Mouth_Lips_Open', 'Mouth_Pucker_Open', 'Mouth_Open', 
  'Eye_Blink', 'Tight-O'
];

interface Viseme {
  nombre: string;
  tiempo: number;
  isOpenMouth: boolean;
  morphTarject: string;
  porcentaje: number;
  porcentajeMorph: number;
}

type VisemeFunction = () => void;
type ArmsFunction = () => void;


@Injectable({
  providedIn: 'root'
})


export class ThreeScene {
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private container: HTMLDivElement | null = null;
  private mixer!: THREE.AnimationMixer;
  private clock!: THREE.Clock;

  morphMeshes: any[] = [];   
  
  private visemesCharacter: Viseme[] = [
    { nombre: "0_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Tight-O', porcentaje: 0, porcentajeMorph: 0 },  
    { nombre: "1_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Lip_Open', porcentaje: 0.3, porcentajeMorph: 1  },
    { nombre: "2_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Lips_Open', porcentaje: 0.1, porcentajeMorph: 0.5 },
    { nombre: "3_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Pucker_Open', porcentaje: 0.2, porcentajeMorph: 0.5 },
    { nombre: "4_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Lips_Open', porcentaje: 0.2, porcentajeMorph: 0.3 },
    { nombre: "5_viseme", tiempo: 0.3,isOpenMouth: false, morphTarject:'Mouth_Lips_Open', porcentaje: 0.4, porcentajeMorph: 0.5 },
    { nombre: "6_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Lips_Open', porcentaje: 0.2, porcentajeMorph: 0.5 },
    { nombre: "7_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Pucker_Open', porcentaje: 0.3, porcentajeMorph: 0.6 },
    { nombre: "8_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Tight-O', porcentaje: 0.4, porcentajeMorph: 0.7 },
    { nombre: "9_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Lips_Open', porcentaje: 0.25, porcentajeMorph: 0.3 },
    { nombre: "10_viseme", tiempo: 0.3,isOpenMouth: false, morphTarject:'Mouth_Pucker_Open', porcentaje: 0.4, porcentajeMorph: 0.7 },
    { nombre: "11_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Open', porcentaje: 0.2, porcentajeMorph: 0.4 },
    { nombre: "12_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Pucker_Open', porcentaje: 0.2, porcentajeMorph: 0.35 },
    { nombre: "13_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Pucker_Open', porcentaje: 0.3, porcentajeMorph: 0.5 },
    { nombre: "14_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Lips_Open', porcentaje: 0.25, porcentajeMorph: 0.3},
    { nombre: "15_viseme", tiempo: 0.3,isOpenMouth: false, morphTarject:'Mouth_Lips_Open', porcentaje: 0.25, porcentajeMorph: 0.35},
    { nombre: "16_viseme", tiempo: 0.3,isOpenMouth: false, morphTarject:'Mouth_Pucker_Open', porcentaje: 0.4, porcentajeMorph: 0.6 },
    { nombre: "17_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Lips_Open', porcentaje: 0.2, porcentajeMorph: 0.45 },
    { nombre: "18_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Plosive', porcentaje: 0.4, porcentajeMorph: 1 },
    { nombre: "19_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Open', porcentaje: 0.4, porcentajeMorph: 0.5 },
    { nombre: "20_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Mouth_Open-O', porcentaje: 0.6, porcentajeMorph: 1 },
    { nombre: "21_viseme", tiempo: 0.3,isOpenMouth: true, morphTarject:'Tight-O', porcentaje: 0, porcentajeMorph: 0 },  
  ];

  visemeFunctions!: VisemeFunction[];
  weigthSettings: any={}; 

  armMovements: ArmsFunction[]=[];

  personajes:personaje[]=[{
    id: 1,
    glb: 'assets/models/Chica_sim3.glb',
    camPY: 1.5,
    camTargectY: 1.35,
  },
  {
    id: 2,
    glb: 'assets/models/Chico_sim2.glb',
    camPY: 1.65,
    camTargectY: 1.55,
  }

  ];

  constructor(private window: Window) {
    this.clock = new THREE.Clock();
  }

  init(containerId: string) {
    this.container = this.window.document.getElementById(containerId) as HTMLDivElement;
    const personajeElejido = this.personajes[1];
    this.scene = new THREE.Scene();
    //this.scene.background = new THREE.Color(0xa0a0a0);
    //this.scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);
    //LUCES
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);
    //SOMBRAS
    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(3, 10, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    this.scene.add(dirLight);

    const loader = new GLTFLoader();
    loader.load(personajeElejido.glb, (gltf) => {
      //Cargar escena
      const model = gltf.scene;
      this.scene.add(model);

      model.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) (object as THREE.Mesh).castShadow = true;
      });

      const animations = gltf.animations;
      this.mixer = new THREE.AnimationMixer(model);
      const numAnimations = animations.length;

      //Animaciones  de lol cuerpo

      for (let i = 0; i < numAnimations; ++i) {
        let clip = animations[i];
        const name = clip.name as BaseAction | AdditiveAction;

        if (name in baseActions) {
          const action = this.mixer.clipAction(clip);
          this.activateAction(action);
          baseActions[name as BaseAction].action = action;
          allActions.push(action);
        } else if (name in additiveActions) {
          THREE.AnimationUtils.makeClipAdditive(clip);
          //clip = THREE.AnimationUtils.subclip( clip, clip.name, 2, 30, 30 );
          
          const action = this.mixer.clipAction(clip);
          this.activateAction(action);
          additiveActions[name as AdditiveAction].action = action;
          allActions.push(action);
        }
      }
      //Morphs expresiones faciales             

      model.traverse((object) => {
        //Para ver los meshes y morphTargetInfluences
        if (object instanceof THREE.Mesh && object.morphTargetInfluences && object.geometry) {                
          if (object.name == "CC_Base_Body_1") {
            //console.log(object);
            this.morphMeshes.push(object);

          }
          if (object.name == "CC_Base_Body_6") {
            //console.log(object);
            this.morphMeshes.push(object);

          }
        }               
    });        
      this.createPanel();
      this.renderer.setAnimationLoop(this.animate.bind(this));
      
    });

    this.renderer = new THREE.WebGLRenderer({ antialias: true });   
    
    this.renderer.shadowMap.enabled = true;
    if (this.container) {
      this.container.appendChild(this.renderer.domElement);
    }

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100);
    this.camera.position.set(-0.2, personajeElejido.camPY, 0.7);
    this.renderer.setSize(width, height);

    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enabled = false;

    controls.target.set(0, personajeElejido.camTargectY, 0);
    controls.update();
   
  }

  private createPanel() {

    const panelSettings: any = {};

    const baseNames: (BaseAction | 'None')[] = ['None', ...Object.keys(baseActions) as BaseAction[]];

    for (let i = 0; i < baseNames.length; ++i) {
      const name = baseNames[i];
      const settings = name !== 'None' ? baseActions[name] : undefined;
      panelSettings[name] = () => {
        const currentSettings = baseActions[currentBaseAction];
        const currentAction = currentSettings ? currentSettings.action : null;
        const action = settings ? settings.action : null;

        if (currentAction !== action) {
          this.prepareCrossFade(currentAction || null, action || null, 0.35);
        }
      };
    }

    for (const name of Object.keys(additiveActions) as AdditiveAction[]) {
      const settings = additiveActions[name];
      panelSettings[name] = settings.weight;
      if (name != 'openMouth') {
        //Movimientos de brazos
        this.armMovements.push(() => {        
          const armAction = additiveActions[name].action;
          this.setWeight_Arms(armAction,1);                           
        });        
      }      
    }

    // Add custom animation A_mouth control
    this.visemeFunctions = this.visemesCharacter.map((element) => {
      return () => {
        let weight: number = 1;
        const openMouthAction = additiveActions['openMouth'].action;
          this.setWeight_A(openMouthAction, weight, element.tiempo, element.morphTarject, element.isOpenMouth, element.porcentaje, element.porcentajeMorph);                
      };
    });
  
    // Add morph targets control
    this.morphMeshes.forEach((mesh,index) => {      
      switch (index) {
        case 0:
          for (const morphName in mesh.morphTargetDictionary) {
            if (allowedMorphNames.includes(morphName)) {
              const index = mesh.morphTargetDictionary[morphName];
              if (index !== undefined) {
                panelSettings[morphName] = mesh.morphTargetInfluences[index];               
              }
            }
          }        
          break;
        case 1:
          for (const morphName in mesh.morphTargetDictionary) {
            //solo para animar parpados
            if (allowedMorphNames.includes(morphName) && morphName=='Eye_Blink') {
              let morphName2=morphName+"_2";
              const index = mesh.morphTargetDictionary[morphName];
              if (index !== undefined) {
                panelSettings[morphName2] = mesh.morphTargetInfluences[index];
              }
            }
          }         
          break;      
        default:
          break;
      }
      
    });

    crossFadeControls.forEach((control) => {
        control.setInactive = () => {
          control.domElement.classList.add('control-inactive');
        };
        control.setActive = () => {
          control.domElement.classList.remove('control-inactive');
        };

        const settings = baseActions[control.property as BaseAction];

        if (!settings || !settings.weight) {
          control.setInactive();
        }
      });
    
      //console.log('panelSettings'+ panelSettings['Lip_Open']);
      this.weigthSettings =  panelSettings;
  }

  activateAction(action: THREE.AnimationAction) {
    const clip = action.getClip();
    const settings = baseActions[clip.name as BaseAction] || additiveActions[clip.name as AdditiveAction];
    this.setWeight(action, settings.weight);
    
    if (!baseActions[clip.name as BaseAction]) {
      // Configurar acciones additive para que no se repitan en bucle
      action.setLoop(THREE.LoopOnce, 1); // LoopOnce: reproducir una vez
      action.clampWhenFinished = true; // ClampWhenFinished: mantener el último fotograma
    }
    
    action.play();
  }  

  private modifyTimeScale(speed: number) {
    this.mixer.timeScale = speed;
  }

  private prepareCrossFade(startAction: THREE.AnimationAction | null, endAction: THREE.AnimationAction | null, duration: number) {
    if (currentBaseAction === 'Idle' || !startAction || !endAction) {
      this.executeCrossFade(startAction, endAction, duration);
    } else {
      this.synchronizeCrossFade(startAction, endAction, duration);
    }

    if (endAction) {
      const clip = endAction.getClip();
      currentBaseAction = clip.name as BaseAction;
    } else {
      currentBaseAction = 'None' as BaseAction;
    }

    crossFadeControls.forEach((control) => {
      const name = control.property as BaseAction;

      if (name === currentBaseAction) {
        control.setActive();
      } else {
        control.setInactive();
      }
    });
  } 

  private synchronizeCrossFade(startAction: THREE.AnimationAction | null, endAction: THREE.AnimationAction | null, duration: number) {
    this.mixer.addEventListener('loop', this.onLoopFinished.bind(this, startAction, endAction, duration));
  }
  
  private onLoopFinished(startAction: THREE.AnimationAction | null, endAction: THREE.AnimationAction | null, duration: number, event: THREE.Event) {
    const animationEvent = event as AnimationMixerEvent;
    if (animationEvent.action === startAction) {
      this.mixer.removeEventListener('loop', this.onLoopFinished.bind(this, startAction, endAction, duration));
      this.executeCrossFade(startAction, endAction, duration);
    }
  }

   executeCrossFade(startAction: THREE.AnimationAction | null, endAction: THREE.AnimationAction | null, duration: number) {
    if (endAction) {
      this.setWeight(endAction, 1);
      endAction.time = 0;

      if (startAction) {
        startAction.crossFadeTo(endAction, duration, true);
      } else {
        endAction.fadeIn(duration);
      }
    } else {
      if (startAction) startAction.fadeOut(duration);
    }
  }
//Animación de los pesos

setWeight(action: THREE.AnimationAction | undefined, targetWeight: number, duration: number = 2) {
  if (!action) return;

  const actionType = this.getActionType(action);

  if (actionType === 'additive') {
      const initialWeight = action.getEffectiveWeight();
      const deltaWeight = targetWeight - initialWeight;
      const start = performance.now();

      const updateWeight = () => {
          const elapsed = performance.now() - start;
          const progress = Math.min(elapsed / (duration * 1000), 1);
          const newWeight = initialWeight + deltaWeight * progress;
          action.setEffectiveWeight(newWeight);

          if (progress < 1) {
              requestAnimationFrame(updateWeight);              
          }
      };

      updateWeight();
  } else {
      action.enabled = true;
      action.setEffectiveTimeScale(1);
      action.setEffectiveWeight(targetWeight);
  }
}

setWeight_Arms(action: THREE.AnimationAction | undefined, targetWeight: number, duration: number = 1, reverseDuration: number = 0.7) {
  if (!action) return;

 const initialWeight = action.getEffectiveWeight();
  const deltaWeight = targetWeight - initialWeight;
  const start = performance.now();

  const updateWeight = () => {
    const elapsed = performance.now() - start;
    const progress = Math.min(elapsed / (duration * 1000), 1);
    const newWeight = initialWeight + deltaWeight * progress;
    action.setEffectiveWeight(newWeight);

    if (progress < 1) {
      requestAnimationFrame(updateWeight);
    } else {
      // Start reducing the weight back to zero after reaching the target weight
      

      setTimeout(()=>{
        const reverseStart = performance.now();

        const reverseWeight = () => {
          const reverseElapsed = performance.now() - reverseStart;
          const reverseProgress = Math.min(reverseElapsed / (reverseDuration * 1000), 1);
          const revWeight = targetWeight - targetWeight * reverseProgress;
          action.setEffectiveWeight(revWeight);

          if (reverseProgress < 1) {
            requestAnimationFrame(reverseWeight);
          }
        };
        requestAnimationFrame(reverseWeight);
        
      },500);
      
    }
  }; 

  updateWeight(); 

}
private prevMorph: string | null = null;


setWeight_A(
  action: THREE.AnimationAction | undefined,
  targetWeight: number,
  duration: number = 2,
  morph: string,
  isOpenMouth: boolean = false,
  porcentaje: number = 1,
  porcentajeMorph: number = 1
) {
  if (!action) return;

  const actionType = this.getActionType(action);

  if (actionType === 'additive') {
    if (!action) return;
    targetWeight = porcentajeMorph;
    let weightPrevMorph  = 0;     

    if (this.prevMorph) {
      weightPrevMorph  = this.weigthSettings[this.prevMorph];     
    }
    const weightOpenMouthIni = this.weigthSettings['openMouth'];
    const weightMorpghhIni = this.weigthSettings[morph] || 0;
    const initialWeight = action.getEffectiveWeight();
    const deltaWeight = targetWeight - initialWeight;
    const start = performance.now();

    const updateWeight = () => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      let newWeight = initialWeight + deltaWeight * progress;

      if (isOpenMouth) {
        let mouthWeight;
        if (porcentaje > weightOpenMouthIni) {
          mouthWeight = weightOpenMouthIni + (porcentaje - weightOpenMouthIni) * progress;
        } else {
          mouthWeight = weightOpenMouthIni - (weightOpenMouthIni - porcentaje) * progress;
        }
        action.setEffectiveWeight(mouthWeight);
        this.weigthSettings['openMouth'] = mouthWeight;
      }

      // Sincronizar el morph target LipOpen
      const lipOpenMorphTarget = this.getMorphTarget(morph);
      if (lipOpenMorphTarget) {
        if (this.prevMorph === morph) {
          if (weightMorpghhIni > porcentajeMorph) {
            lipOpenMorphTarget.mesh.morphTargetInfluences[lipOpenMorphTarget.index] = weightMorpghhIni - (weightMorpghhIni - porcentajeMorph) * progress;
            this.weigthSettings[morph] = weightMorpghhIni - (weightMorpghhIni - porcentajeMorph) * progress;
          } else {
            lipOpenMorphTarget.mesh.morphTargetInfluences[lipOpenMorphTarget.index] = weightMorpghhIni + (porcentajeMorph - weightMorpghhIni) * progress;
            this.weigthSettings[morph]= weightMorpghhIni + (porcentajeMorph - weightMorpghhIni) * progress;
          }
        } else {
          lipOpenMorphTarget.mesh.morphTargetInfluences[lipOpenMorphTarget.index] = newWeight ;
          this.weigthSettings[morph]=newWeight ;
          
          if (this.prevMorph) {
            const prevMorphTarget = this.getMorphTarget(this.prevMorph);
            if (prevMorphTarget) {
              let restarMorph=weightPrevMorph - progress;
              if(restarMorph>0){
                prevMorphTarget.mesh.morphTargetInfluences[prevMorphTarget.index] = (restarMorph);
              }
              else{
                restarMorph=0;
                prevMorphTarget.mesh.morphTargetInfluences[prevMorphTarget.index] = (0);
              }
              this.weigthSettings[this.prevMorph]=restarMorph ;
              //console.log( this.weigthSettings[this.prevMorph]);
            }
          }
        }        
      }
      //console.log(this.weigthSettings[morph]);
      if (progress < 1) {
        requestAnimationFrame(updateWeight);
      } else {
        this.prevMorph = morph;
      }
    };
    updateWeight();
  }
}

setWeight_Eyes(targetWeight: number, duration: number = 0.3, decayDuration: number = 0.3) {
  const initialWeight = 0;
  const deltaWeight = targetWeight - initialWeight;
  const start = performance.now();

  const updateWeight = () => {
    const elapsed = performance.now() - start;
    let progress = Math.min(elapsed / (duration * 1000), 1);
    
    if (progress >= 1) {
      progress = 1; // Ensure progress is capped at 1 when target weight is reached
    }

    const newWeight = initialWeight + deltaWeight * progress;

    // Synchronize morph targets
    const eyesMorphTarget = this.getMorphTarget('Eye_Blink');
    const eyes2MorphTarget = this.getMorphTarget('Eye_Blink_2');

    if (eyesMorphTarget) {
      eyesMorphTarget.mesh.morphTargetInfluences[eyesMorphTarget.index] = newWeight;
    }
    if (eyes2MorphTarget) {
      eyes2MorphTarget.mesh.morphTargetInfluences[eyes2MorphTarget.index] = newWeight;
    }

    if (progress >= 1) {
      // Start decay after reaching target weight
      const decayStart = performance.now();

      const decayWeight = newWeight;
      const decayDelta = -decayWeight;
      
      const decayUpdate = () => {
        const decayElapsed = performance.now() - decayStart;
        const decayProgress = Math.min(decayElapsed / (decayDuration * 1000), 1);
        const decayNewWeight = decayWeight + decayDelta * decayProgress;

        if (eyesMorphTarget) {
          eyesMorphTarget.mesh.morphTargetInfluences[eyesMorphTarget.index] = decayNewWeight;
        }
        if (eyes2MorphTarget) {
          eyes2MorphTarget.mesh.morphTargetInfluences[eyes2MorphTarget.index] = decayNewWeight;
        }

        if (decayProgress < 1) {
          requestAnimationFrame(decayUpdate);
        }
      };

      decayUpdate();
    } else {
      requestAnimationFrame(updateWeight);
    }
  };

  updateWeight();
}

private getMorphTarget(name: string) {
  for (const mesh of this.morphMeshes) {
      const index = mesh.morphTargetDictionary[name];
      if (index !== undefined) {
          return { mesh, index };
      }
  }
  return null;
}    
  
  getActionType(action: THREE.AnimationAction): 'base' | 'additive' {
    const clip = action.getClip();
    if (clip.name in baseActions) {
      return 'base';
    } else if (clip.name in additiveActions) {
      return 'additive';
    } else {
      return 'base'; // Manejar casos no esperados como base por defecto
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    console.log(this.container);
    if (this.container) {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      console.log(width + " "+ height);

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    }
  }

  private animate() {
    for (let i = 0; i < allActions.length; ++i) {
      const action = allActions[i];
      const clip = action.getClip();
      const settings = baseActions[clip.name as BaseAction] || additiveActions[clip.name as AdditiveAction];
      settings.weight = action.getEffectiveWeight();
    }

   
    const mixerUpdateDelta = this.clock.getDelta();
    this.mixer.update(mixerUpdateDelta);
    this.renderer.render(this.scene, this.camera);

     // Configurar animación de parpadeo de ojos cada 10 segundos
     
     
  }
}




