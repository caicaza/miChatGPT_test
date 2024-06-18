import { Component, AfterViewInit, Inject, HostListener } from '@angular/core';

import * as THREE from 'three';

@Component({
  selector: 'app-threejs',
  templateUrl: './threejs.component.html',
  styleUrl: './threejs.component.css',
  providers: [
    { provide: Window, useValue: window }
]
})
export class ThreejsComponent implements AfterViewInit {
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private container: HTMLDivElement | null = null;


  constructor(@Inject(Window) private window: Window) {}

  ngAfterViewInit(): void {
    // Use setTimeout to ensure Angular has finished rendering the view
    setTimeout(() => {
      this.container = this.window.document.getElementById('three-js-container') as HTMLDivElement;

      if (this.container) {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 10);
        this.camera.position.z = 1;

        this.scene = new THREE.Scene();

        const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
        const material = new THREE.MeshNormalMaterial();

        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000, 0); // Transparent background

        if (this.container) {
          this.container.appendChild(this.renderer.domElement);
        }

        this.renderer.setAnimationLoop(this.animate.bind(this));

        this.onResize();
      }
    }, 0);
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

  private animate(time: number) {
    const mesh = this.scene.children[0] as THREE.Mesh;
    mesh.rotation.x = time / 2000;
    mesh.rotation.y = time / 1000;

    this.renderer.render(this.scene, this.camera);
  }



}
  




