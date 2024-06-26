import { Component, AfterViewInit, Inject, HostListener } from '@angular/core';

import * as THREE from 'three';
import { ThreeScene } from './three-scene'; // Importa la clase ThreeScene desde el archivo separado


@Component({
  selector: 'app-threejs',
  templateUrl: './threejs.component.html',
  styleUrl: './threejs.component.css',
  providers: [
    { provide: Window, useValue: window }
]
})
export class ThreejsComponent implements AfterViewInit {
  private scene: ThreeScene;

  constructor(@Inject(Window) private window: Window) {
    this.scene = new ThreeScene(this.window);
  }

  ngAfterViewInit(): void {
    this.scene.init('three-js-container');
  }

  activarVisema(numViseme: number): void {
    this.scene.visemeFunctions[numViseme]();

  }



}
  




