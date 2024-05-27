import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { VoiceRecognitionService } from '../services/voice-recognition.service';

@Component({
  selector: 'app-speech-to-text',
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.css']
})
export class SpeechToTextComponent implements OnInit, AfterViewInit {
  @ViewChild('visualizerCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  availableDevices: MediaDeviceInfo[] = [];
  selectedDeviceId: string = '';
  isRecording: boolean = false;
  mediaStream: MediaStream | null = null;
  audioContext: AudioContext | null = null;
  analyserNode: AnalyserNode | null = null;
  canvasContext: CanvasRenderingContext2D | null = null;
  dataArray: Uint8Array | null = null;
  animationFrameId: number | null = null;
  silenceTimeoutId: any;

  constructor(public service: VoiceRecognitionService) {}

  ngOnInit(): void {
    this.getAudioDevices();
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
  }

  async getAudioDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableDevices = devices.filter(device => device.kind === 'audioinput');
      console.log('Available audio input devices: ', this.availableDevices);

      if (this.availableDevices.length > 0) {
        this.selectedDeviceId = this.availableDevices[0].deviceId;
      }
    } catch (error) {
      console.error('Error fetching audio devices: ', error);
    }
  }

  async toggleRecording() {
    if (this.isRecording) {
      this.stopService();
    } else {
      await this.startService();
    }
  }

  async startService() {
    if (this.selectedDeviceId) {
      try {
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach(track => track.stop());
        }
        this.mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: this.selectedDeviceId }
        });

        this.audioContext = new AudioContext();
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 256;
        this.analyserNode.smoothingTimeConstant = 0.3;

        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        source.connect(this.analyserNode);

        this.dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

        this.service.start();
        this.isRecording = true;

        const selectedDevice = this.availableDevices.find(device => device.deviceId === this.selectedDeviceId);
        console.log('Using microphone: ', selectedDevice ? selectedDevice.label : 'Unknown device');

        this.draw();
      } catch (error) {
        console.error('Error accessing selected microphone: ', error);
      }
    } else {
      console.warn('No microphone selected.');
    }
  }

  stopService(): void {
    this.service.stop();
    this.isRecording = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    }
  }

  async onDeviceChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedDeviceId = selectElement.value;
    if (this.isRecording) {
      this.stopService();
      await this.startService();
    }
  }

  setupCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.canvasContext = canvas.getContext('2d');
    if (!this.canvasContext) {
      console.error('Failed to get canvas context.');
    }
  }

  draw() {
    if (!this.canvasContext || !this.analyserNode || !this.dataArray) return;

    this.analyserNode.getByteFrequencyData(this.dataArray);
    this.canvasContext.clearRect(0, 0, this.canvasContext.canvas.width, this.canvasContext.canvas.height);
    const barWidth = (this.canvasContext.canvas.width / this.analyserNode.frequencyBinCount) * 2.5;
    let barHeight;
    let x = 0;
    let maxAmplitude = 0;

    for (let i = 0; i < this.analyserNode.frequencyBinCount; i++) {
      barHeight = this.dataArray[i] / 2;
      maxAmplitude = Math.max(maxAmplitude, barHeight);

      this.canvasContext.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
      this.canvasContext.fillRect(x, this.canvasContext.canvas.height - barHeight / 2, barWidth, barHeight);

      x += barWidth + 1;
    }

/*     if (maxAmplitude < 10) {
      if (!this.silenceTimeoutId) {
        this.silenceTimeoutId = setTimeout(() => {
          console.log('Detected 2 seconds of silence. Stopping recording.');
          this.stopService();
        }, 2000);
      }
    } else {
      clearTimeout(this.silenceTimeoutId);
      this.silenceTimeoutId = null;
    } */

    this.animationFrameId = requestAnimationFrame(() => this.draw());
  }
}