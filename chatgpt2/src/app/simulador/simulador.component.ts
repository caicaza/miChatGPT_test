import { Component } from '@angular/core';

@Component({
  selector: 'app-simulador',
  templateUrl: './simulador.component.html',
  styleUrl: './simulador.component.css'
})
export class SimuladorComponent {
  currentComponent: number = 1;
  changeComponent(componentNumber: number) {
    this.currentComponent = componentNumber;
  }

}
