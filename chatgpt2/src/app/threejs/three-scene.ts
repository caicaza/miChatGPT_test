import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type BaseAction = 'Idle';
type AdditiveAction = 'open_mouth';

interface ActionSettings {
  weight: number;
  action?: THREE.AnimationAction;
}

const baseActions: Record<BaseAction, ActionSettings> = {
  Idle: { weight: 1 }
};

const additiveActions: Record<AdditiveAction, ActionSettings> = {
  open_mouth: { weight: 0 }
};

const crossFadeControls: any[] = [];
let currentBaseAction: BaseAction = 'Idle';
const allActions: THREE.AnimationAction[] = [];

interface AnimationMixerEvent extends THREE.Event {
  action: THREE.AnimationAction;
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

/*     const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
    ); 
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    */

    const loader = new GLTFLoader();
    loader.load('assets/models/chica19.glb', (gltf) => {
      const model = gltf.scene;
      this.scene.add(model);

      model.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) (object as THREE.Mesh).castShadow = true;
      });

      const animations = gltf.animations;
      this.mixer = new THREE.AnimationMixer(model);
      const numAnimations = animations.length;

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
          //Controlar frames
          //let clip2 = THREE.AnimationUtils.subclip( clip, clip.name, 2, 10, 30 );
          const action = this.mixer.clipAction(clip);
          this.activateAction(action);
          additiveActions[name as AdditiveAction].action = action;
          allActions.push(action);
        }
      }

      this.createPanel();
      this.renderer.setAnimationLoop(this.animate.bind(this));
    });

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    //this.renderer.setPixelRatio(window.devicePixelRatio);
    //this.renderer.setSize(window.innerWidth, window.innerHeight);//Tamaño de la ventana
    this.renderer.shadowMap.enabled = true;
    if (this.container) {
      this.container.appendChild(this.renderer.domElement);
    }

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100);
    this.camera.position.set(0, 1.25, 0.75);
    this.renderer.setSize(width, height);


    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, 1.25, 0);
    controls.update();

    this.stats = new Stats();
    if (this.container) {
      this.container.appendChild(this.stats.dom);
    }

    //this.window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private createPanel() {
    const panel = new GUI({ width: 310 });

    const folder1 = panel.addFolder('Base Actions');
    const folder2 = panel.addFolder('Additive Action Weights');
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
      folder2.add(panelSettings, name, 0.0, 1.0, 0.01).listen().onChange((weight: number) => {
        this.setWeight(settings.action, weight);
        settings.weight = weight;
      });
    }

    folder3.add(panelSettings, 'modify time scale', 0.0, 1.5, 0.01).onChange(this.modifyTimeScale.bind(this));

    folder1.open();
    folder2.open();
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

  private setWeight(action: THREE.AnimationAction | undefined, weight: number) {
    if (action) {
      action.enabled = true;
      action.setEffectiveTimeScale(1);
      
      const actionType = this.getActionType(action);
      
      if (actionType === 'additive') {
        // Si es un additiveAction y el peso es 1, aplicar transición gradual
        if (weight === 1) {
          console.log(weight);
          action.play();
          action.crossFadeTo(action, 0, true); // Crossfade a 0 en 0.5 segundos
          setTimeout(() => {
            action.stop();
            console.log(stop);

          }, 2500);} else {
            action.setEffectiveWeight(weight);
          }
        } else {
          // Si es un baseAction, simplemente establecer el peso efectivo
          action.setEffectiveWeight(weight);
        }
    }
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




