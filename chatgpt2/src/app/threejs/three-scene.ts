// three-scene.ts

import { Injectable, HostListener } from '@angular/core';
import * as THREE from 'three';

@Injectable({
    providedIn: 'root'
  })

export class ThreeScene {
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private scene!: THREE.Scene;
    private container: HTMLDivElement | null = null;

  constructor(private window: Window) {}

  init(containerId: string) {
    this.container = this.window.document.getElementById(containerId) as HTMLDivElement;

    if (!this.container) {
      throw new Error(`Container element '#${containerId}' not found.`);
    }

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

    this.container.appendChild(this.renderer.domElement);

    this.animate();

    this.onResize();
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

    const mesh = this.scene.children[0] as THREE.Mesh;
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;

    this.renderer.render(this.scene, this.camera);
  }
}

