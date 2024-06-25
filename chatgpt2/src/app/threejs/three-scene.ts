import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type BaseAction = 'Idle';
type AdditiveAction = 'openMouth';

interface ActionSettings {
  weight: number;
  action?: THREE.AnimationAction;
}

const baseActions: Record<BaseAction, ActionSettings> = {
  Idle: { weight: 1 }
};

const additiveActions: Record<AdditiveAction, ActionSettings> = {
  openMouth: { weight: 0 }
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


export class ThreeScene {
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private stats!: Stats;
  private container: HTMLDivElement | null = null;
  private mixer!: THREE.AnimationMixer;
  private clock!: THREE.Clock;
  private boneNames!: Set<string>;

  morphMeshes: any[] = [];   
  
  private visemesCharacter: Viseme[] = [
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

  constructor(private window: Window) {
    this.clock = new THREE.Clock();
    this.boneNames = new Set<string>();
  }

  init(containerId: string) {
    this.container = this.window.document.getElementById(containerId) as HTMLDivElement;

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
    loader.load('assets/models/Chica_sim1.glb', (gltf) => {
      //Cargar escena
      const model = gltf.scene;
      this.scene.add(model);

      model.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) (object as THREE.Mesh).castShadow = true;
      });

      const animations = gltf.animations;
      this.mixer = new THREE.AnimationMixer(model);
      const numAnimations = animations.length;

      //Animaciones  de los huesos

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
    this.camera.position.set(0, 1.5, 0.75);
    this.renderer.setSize(width, height);


    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, 1.4, 0);
    controls.update();

    this.stats = new Stats();
    if (this.container) {
      this.container.appendChild(this.stats.dom);
    }

  }

  private createPanel() {
    const panel = new GUI({ width: 310 });

    const folder1 = panel.addFolder('Base Actions');
    const folder2 = panel.addFolder('Additive Action Weights');    
    const folder4 = panel.addFolder('Custom Animations');
    const folder5 = panel.addFolder('Morph Targets');
    const folder3 = panel.addFolder('General Speed');


    const panelSettings: any = {
      'modify time scale': 1.0
    };

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

      crossFadeControls.push(folder1.add(panelSettings, name));
    }

    for (const name of Object.keys(additiveActions) as AdditiveAction[]) {
      const settings = additiveActions[name];

      

      panelSettings[name] = settings.weight;
      folder2.add(panelSettings, name).listen().onChange((weight: number) => {
        //console.log('change');
        this.setWeight(settings.action, weight);
        settings.weight = weight;
      });
    }

    // Add custom animation A_mouth control
    this.visemesCharacter.forEach(element => {
      panelSettings[element.nombre] = 0.0;
      folder4.add(panelSettings, element.nombre, 0.0, 1.0, 0.01).listen().onChange((weight: number) => {
          const openMouthAction = additiveActions['openMouth'].action;
          this.setWeight_A(openMouthAction, weight, 1, element.morphTarject, element.isOpenMouth, element.porcentaje, element.porcentajeMorph);
          panelSettings[element.nombre] = weight;
      }); 
      
    });
    /* 
    let miVisema=this.visemesCharacter[0];
    panelSettings[miVisema.nombre] = 0.0;
    folder4.add(panelSettings, miVisema.nombre, 0.0, 1.0, 0.01).listen().onChange((weight: number) => {
        const openMouthAction = additiveActions['openMouth'].action;
        this.setWeight_A(openMouthAction, weight, 1, miVisema.morphTarject);
        panelSettings[miVisema.nombre] = weight;
    }); 
    */

   // Add morph targets control
  this.morphMeshes.forEach((mesh,index) => {
    //console.log(this.morphMeshes[0].name);
    console.log(index);
    switch (index) {
      case 0:
        for (const morphName in mesh.morphTargetDictionary) {
          if (allowedMorphNames.includes(morphName)) {
            const index = mesh.morphTargetDictionary[morphName];
            if (index !== undefined) {
              panelSettings[morphName] = mesh.morphTargetInfluences[index];
              folder5.add(panelSettings, morphName, 0.0, 1.0, 0.01).listen().onChange((weight: number) => {
                console.log(morphName + ' change');
                mesh.morphTargetInfluences[index] = weight;
              });
            }
          }
        }        
        break;
      case 1:
        for (const morphName in mesh.morphTargetDictionary) {
          //solo para animar parpados
          if (allowedMorphNames.includes(morphName) && morphName=='Eye_Blink') {
            console.log(morphName);
            let morphName2=morphName+"_2";
            const index = mesh.morphTargetDictionary[morphName];
            if (index !== undefined) {
              panelSettings[morphName2] = mesh.morphTargetInfluences[index];
              folder5.add(panelSettings, morphName2, 0.0, 1.0, 0.01).listen().onChange((weight: number) => {
                console.log(morphName2 + ' change');
                mesh.morphTargetInfluences[index] = weight;
              });
            }
          }
        } 
        
        break;
    
      default:
        break;
    }
    
  });

    folder3.add(panelSettings, 'modify time scale', 0.0, 1.5, 0.01).onChange(this.modifyTimeScale.bind(this));

    folder1.open();
    folder2.open();
    folder4.open();    
    folder5.open();
    folder3.open();
    

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

setWeight_A(action: THREE.AnimationAction | undefined, targetWeight: number, duration: number = 2, morph: string, isOpenMouth:boolean = false, porcentaje:number=1, porcentajeMorph: number = 1) {
  if (!action) return;

  const actionType = this.getActionType(action);

  if (actionType === 'additive') {
    if (!action) return;
    
        const initialWeight = action.getEffectiveWeight();
        const deltaWeight = targetWeight - initialWeight;
        const start = performance.now();
    
        const updateWeight = () => {
            const elapsed = performance.now() - start;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            const newWeight = initialWeight + deltaWeight * progress;
            if (isOpenMouth) {
              action.setEffectiveWeight(newWeight*porcentaje);
            }
            
    
            // Sincronizar el morph target LipOpen
            const lipOpenMorphTarget = this.getMorphTarget(morph);
            
            //console.log(lipOpenMorphTarget);
            if (lipOpenMorphTarget) {
                lipOpenMorphTarget.mesh.morphTargetInfluences[lipOpenMorphTarget.index] = newWeight*porcentajeMorph;
            }
    
            if (progress < 1) {
                requestAnimationFrame(updateWeight);
            }
        };
    
    updateWeight();
    /* console.log('A_mouth');
      this.setAMouthWeight(action, targetWeight, duration); */
  }  
  //action.setEffectiveWeight(targetWeight);
  
}    
      private setAMouthWeight(action: THREE.AnimationAction | undefined, targetWeight: number, duration: number = 2) {
        console.log('LipOpen');
        if (!action) return;
    
        const initialWeight = action.getEffectiveWeight();
        const deltaWeight = targetWeight - initialWeight;
        const start = performance.now();
    
        const updateWeight = () => {
            const elapsed = performance.now() - start;
            const progress = Math.min(elapsed / (duration * 1000), 1);
            const newWeight = initialWeight + deltaWeight * progress;
            action.setEffectiveWeight(newWeight);
    
            // Sincronizar el morph target LipOpen
            const lipOpenMorphTarget = this.getMorphTarget('Tight-O');
            
            //console.log(lipOpenMorphTarget);
            if (lipOpenMorphTarget) {
                lipOpenMorphTarget.mesh.morphTargetInfluences[lipOpenMorphTarget.index] = newWeight;
            }
    
            if (progress < 1) {
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



  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
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
    this.stats.update();
  }
}




