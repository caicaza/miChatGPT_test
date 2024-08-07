import {  Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

import { WebcamImage } from 'ngx-webcam';
import { Subject, Observable, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { GeminiService } from '../services/gemini.service';


@Component({
  selector: 'app-capture-camera-gemini',
  templateUrl: './capture-camera-gemini.component.html',
  styleUrl: './capture-camera-gemini.component.css'
})
export class CaptureCameraGeminiComponent implements OnInit, OnDestroy {
  @ViewChild('webcam') webcamElement!: ElementRef<any>;

  public showWebcam = false;
  public allowCapture = false;
  public trigger: Subject<void> = new Subject<void>();
  public isTriggerDisabled = false;
  public videoOptions: MediaTrackConstraints = {
    facingMode: 'environment',
  };

  public imageCaptured = false;
  public capturedImage!: WebcamImage;

  private captureInterval!: any;

  private intervalCapture = 10000;

  constructor(private geminiService: GeminiService) {}

  ngOnInit(): void {
    // Iniciar captura automática si allowCapture es true
    this.startAutoCapture();
  }

  ngOnDestroy(): void {
    this.stopAutoCapture();
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public toggleCapture(): void {
    this.allowCapture = !this.allowCapture;
    if (this.allowCapture) {
      this.startAutoCapture();
    } else {
      this.stopAutoCapture();
    }
  }

  private startAutoCapture(): void {
    this.captureInterval = interval(this.intervalCapture).pipe(
      takeWhile(() => this.allowCapture)
    ).subscribe(() => {
      if (this.allowCapture) {
        this.triggerSnapshot();
      }
    });
  }

  private stopAutoCapture(): void {
    if (this.captureInterval) {
      this.captureInterval.unsubscribe();
    }
  }

  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public handleImageCapture(webcamImage: WebcamImage): void {
    this.capturedImage = webcamImage;
    this.imageCaptured = true;
    this.sendImageToGemini();  // Enviar la imagen a OpenAI automáticamente después de capturarla
  }

  public async sendImageToGemini(): Promise<void> {
    try {
      console.log("ingreso")
      const imageFile = this.webcamImageToFile(this.capturedImage);
      console.log(imageFile);
      const response = await this.geminiService.processImage(imageFile);
      console.log('Respuesta de OpenAI:', response);
      // Manejar la respuesta de OpenAI aquí
    } catch (error) {
      console.error('Error procesando imagen en Gemini:', error);
    }
  }

  private webcamImageToFile(webcamImage: WebcamImage): File {
    const imageDataBlob = this.dataURItoBlob(webcamImage.imageAsDataUrl);
    return new File([imageDataBlob], 'webcam-image.jpg', { type: 'image/jpeg' });
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