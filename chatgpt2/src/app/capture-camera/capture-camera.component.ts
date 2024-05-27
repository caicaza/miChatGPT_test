import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { OpenaiService } from '../services/openai.service';

import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';

@Component({
  selector: 'app-capture-camera',
  templateUrl: './capture-camera.component.html',
  styleUrl: './capture-camera.component.css'
})
export class CaptureCameraComponent {
  @ViewChild('webcam')
  webcamElement!: ElementRef<any>;
  // Propiedades para controlar la cámara
  public trigger: Subject<void> = new Subject<void>();
  public isTriggerDisabled = false;
  public videoOptions: MediaTrackConstraints = {
    facingMode: 'environment', // Puedes cambiar a 'user' si prefieres la cámara frontal
  };

  // Propiedades para capturar la imagen
  public imageCaptured = false;
  public capturedImage!: WebcamImage;

  constructor(private openaiService: OpenaiService) {}

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public handleImageCapture(webcamImage: WebcamImage): void {
    this.capturedImage = webcamImage;
    this.imageCaptured = true;
  }

  public async sendImageToOpenAI(): Promise<void> {
    try {
      const imageFile = this.webcamImageToFile(this.capturedImage);

      const response = await this.openaiService.processImage(imageFile);
      console.log('Respuesta de OpenAI:', response);

      // Puedes manejar la respuesta de OpenAI aquí
    } catch (error) {
      console.error('Error procesando imagen en OpenAI:', error);
    }
  }

  private webcamImageToFile(webcamImage: WebcamImage): File {
    const imageDataBlob = this.dataURItoBlob(webcamImage.imageAsDataUrl);
    const imageFile = new File([imageDataBlob], 'webcam-image.jpg', { type: 'image/jpeg' });
    return imageFile;
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uintArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      uintArray[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeString });
  }
}