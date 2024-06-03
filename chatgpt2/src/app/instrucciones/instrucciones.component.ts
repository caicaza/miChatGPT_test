import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-instrucciones',
  templateUrl: './instrucciones.component.html',
  styleUrl: './instrucciones.component.css'
})
export class InstruccionesComponent implements OnInit {
  permissionsGranted: boolean = false;

  ngOnInit() {
    // Verificar si ya se han concedido los permisos al iniciar el componente
    this.checkPermissions();
  }

  async checkPermissions() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      // Si getUserMedia no lanza una excepción, los permisos ya están concedidos
      stream.getTracks().forEach(track => track.stop());
      this.permissionsGranted = true;
    } catch (error) {
      console.error('Permisos no concedidos:', error);
      this.permissionsGranted = false;
    }
  }

  async requestPermissions() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.permissionsGranted = true;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      this.permissionsGranted = false;
    }
  }
}