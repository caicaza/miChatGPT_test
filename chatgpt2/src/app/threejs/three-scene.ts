// three-scene.ts

import { Injectable, HostListener } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import * as dat from 'dat.gui';





@Injectable({
    providedIn: 'root'
  })

export class ThreeScene {
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private container: HTMLDivElement | null = null;
    private mixer!: THREE.AnimationMixer; // Añadido: Mezclador de animaciones

        // Añadir propiedades para GUI
    private gui!: dat.GUI;
    private morphFolder!: dat.GUI;
    private morphCtrls: dat.GUIController[] = [];

    private boneFolder !: dat.GUI;
    private boneCtrls: dat.GUIController[] = [];



  constructor(private window: Window) {}

  init(containerId: string) {
    this.container = this.window.document.getElementById(containerId) as HTMLDivElement;

    if (!this.container) {
      throw new Error(`Container element '#${containerId}' not found.`);
    }

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 100);
    this.camera.position.z = 0.5;
    this.camera.position.y = 1.5;

    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });    
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0); // Transparent background

    this.container.appendChild(this.renderer.domElement);
    this.addLights();

    this.loadGLTFModel('assets/models/chica18.glb'); // Ruta al archivo GLB en la carpeta assets

    this.animate();
    this.onResize();

    // Inicializar dat.GUI y las carpetas
    this.gui = new dat.GUI();
    this.morphFolder = this.gui.addFolder('Morph Targets');
    this.morphFolder.close(); // Ocultarlo inicialmente

    this.boneFolder = this.gui.addFolder('Bones');
    this.boneFolder.close(); // Ocultarlo inicialmente
  }

  private loadGLTFModel(path: string) {
    const loader = new GLTFLoader();

    loader.load(
        path,
        (gltf) => {
            let model = gltf.scene;
            console.log(model);

            this.scene.add(model);
            console.log("glb added");

            // Añadido: Configuración del mezclador de animaciones
            this.mixer = new THREE.AnimationMixer(model);

            // Obtén y lista las animaciones
            const animations = gltf.animations;
            animations.forEach((clip, index) => {
                console.log(`Animation ${index}: ${clip.name}`);
            });

            // Reproduce todas las animaciones
            animations.forEach((clip) => {
                this.mixer.clipAction(clip).play();
            });

            // Añadido: Obtener y listar los morph targets
            const morphMeshes: any[] = [];
            const boneNames = new Set<string>();

            model.traverse((object) => {
              //Para ver los meshes y morphTargetInfluences
              if (object instanceof THREE.Mesh && object.morphTargetInfluences && object.geometry) {
                morphMeshes.push(object);
                }
                // Añadido: Acceder al esqueleto y a los huesos
                 if (object instanceof THREE.SkinnedMesh) {
                  const skeleton = object.skeleton;
                  
                  for (let index = 0; index < skeleton.bones.length; index++) {
                    const bone = skeleton.bones[index];
                    const boneName = bone.name;
            
                    if (boneNames.has(boneName)) {
                        //console.error(`Duplicate bone name found: ${boneName}. Exiting loop.`);
                        break;
                    }
            
                    boneNames.add(boneName);
                   // console.log(`Bone ${index}: ${boneName}`);
            
                    // Crear controladores para las rotaciones de los huesos
                    const boneFolder = this.boneFolder.addFolder(`Bone ${index}: ${boneName}`);
                    this.boneCtrls.push(
                        boneFolder.add(bone.rotation, 'x', -Math.PI, Math.PI, 0.01).name('Rotation X').listen()
                    );
                    this.boneCtrls.push(
                        boneFolder.add(bone.rotation, 'y', -Math.PI, Math.PI, 0.01).name('Rotation Y').listen()
                    );
                    this.boneCtrls.push(
                        boneFolder.add(bone.rotation, 'z', -Math.PI, Math.PI, 0.01).name('Rotation Z').listen()
                    );
                }
              } 
          });

            if (morphMeshes.length) {
                this.morphFolder.open();
                morphMeshes.forEach((mesh) => {
                  if (mesh.morphTargetInfluences.length) {
                    const nameCtrl = this.morphFolder.add(
                            { name: mesh.name || 'Untitled' },
                            'name',
                        );
                        this.morphCtrls.push(nameCtrl);
                    }
                    for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
                        const ctrl = this.morphFolder
                            .add(mesh.morphTargetInfluences, i, 0, 1, 0.01)
                            .listen();
                        Object.keys(mesh.morphTargetDictionary).forEach((key) => {
                            if (key && mesh.morphTargetDictionary[key] === i) ctrl.name(key);
                        });
                        this.morphCtrls.push(ctrl);
                    }
                });
            }
        },
        undefined,
        (error) => {
            console.error('An error happened', error);
        }
    );
}



  private addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Luz ambiental
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Luz direccional
    directionalLight.position.set(5, 5, 5).normalize();
    this.scene.add(directionalLight);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.container) {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    }
  }

  private animate() {
    requestAnimationFrame(() => this.animate());    
    this.renderer.render(this.scene, this.camera);
    //Animamos al personaje
    if (this.mixer) {
      this.mixer.update(0.05); // Actualiza el mezclador de animaciones (~60fps)
  }
  this.renderer.render(this.scene, this.camera);
  }
}


