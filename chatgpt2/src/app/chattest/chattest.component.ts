import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OpenaiService } from '../services/openai.service';
import { VoiceRecognitionService } from '../services/voice-recognition.service';

interface Viseme {
  audioOffset: number;
  visemeId: number;
}

@Component({
  selector: 'app-chattest',
  templateUrl: './chattest.component.html',
  styleUrls: ['./chattest.component.css']
})
export class ChattestComponent implements OnInit, AfterViewInit {
  messages: { text: string; sender: string; }[] = [];
  userInput: string = '';
  mensajeInicial="Hola, ¿en qué puedo ayudarte?";
  //Archivo y audio
  selectedFile: File | null = null;
  audioUrl: string | null = null;
  //Chat

  //Reconocimiento de voz
  //isListening: boolean = false;

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

  recognizedText = '';

  //Para la animacion Avatar
  @ViewChild('canvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private images: { [key: string]: HTMLImageElement } = {};
  private visemes: Viseme[] = [];
  textInput: string = '';

  private additionalImages: { [key: string]: HTMLImageElement } = {};
  private currentAdditionalImage: HTMLImageElement | undefined;


  constructor(private openaiService: OpenaiService, public voiceService: VoiceRecognitionService) { }

  async ngOnInit(): Promise<void> {
    //Avatar
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    await this.loadImages();
    this.drawViseme('0');
    this.startAdditionalImageSequence(); // Iniciar la secuencia de la imagen adicional

    //bot
    this.addBotMessage(this.mensajeInicial);
    //voice recognition
    this.getAudioDevices();
    this.voiceService.onSpeechDetected.subscribe((message: string) => {
      console.log('Speech detected:', message);
      if (message == 'Silence') {
        this.recognizedText = this.voiceService.getVoice();
        console.log("voz obtenida")
        console.log(this.recognizedText);
        this.userInput=this.recognizedText;
        this.sendMessage();
      }
    });
  }

  ngAfterViewInit(): void {
    this.setupCanvas();
  }

  async sendMessage() {
    if (this.userInput.trim() === '') {
      return;
    }

    this.addUserMessage(this.userInput);
    try {
      const botResponse = await this.openaiService.getChatResponse(this.userInput);
      this.addBotMessage(botResponse.text);
      this.audioUrl = await this.openaiService.getSpeechAudio();
      /* console.log("audio response 0");
      console.log(botResponse.audioUrl);

      console.log("audio response 2");
      console.log(this.audioUrl);
      console.log("Visemas");     
      console.log(botResponse.viseme); */
      this.visemes=botResponse.viseme;
      this.loadImages().then(() => {
        this.startAnimation();
      });

      if (botResponse.audioUrl) { 
        //this.playAudio();
      } else {
        this.audioUrl = null;
        //this.playAudio();
      }
    } catch (error) {
      console.error('Error in sendMessage:', error);
      this.addBotMessage('Lo siento, ha ocurrido un error.');
    }

    this.userInput = '';
  }

  addUserMessage(message: string) {
    this.messages.push({ text: message, sender: 'user' });
  }

  addBotMessage(message: string) {
    this.messages.push({ text: message, sender: 'bot' });
    console.log(message);
    if(message!=this.mensajeInicial){
     // this.playAudio(); ///aQUI COLOCAR NUETRO AUDIO
      //this.openaiService.playAudioBot();
    }
    
  }

/*   async playAudio() {
    const audio = new Audio();
    this.audioUrl = await this.openaiService.getSpeechAudio();
    audio.src = this.audioUrl!;
    console.log(audio.src);
    audio.load();
    audio.play();
  } */

  async playAudio() {
    const audio = new Audio();
    this.audioUrl = await this.openaiService.getSpeechAudio();
    audio.src = this.audioUrl!;
    console.log(audio.src);
    audio.load();
    console.log("audio.currentTime");
    console.log(audio.currentTime);
    console.log("audio.currentTime");
    audio.play();
    
  }

  async sonido(){
    const audio = new Audio();
    this.audioUrl = await this.openaiService.getSpeechAudio();
    audio.src = this.audioUrl!;
    //console.log(audio.src);
    audio.load();
    audio.play();

  }

  //File
  uploadFile(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.openaiService.uploadFile(file)
        .then(() => this.addBotMessage('Archivo cargado correctamente.'))
        .catch(error => {
          console.error('Error uploading file:', error);
          this.addBotMessage('Error al cargar el archivo.');
        });
    }
  }

  //Record voice
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

        this.voiceService.start();
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
    this.voiceService.stop();
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

    if (maxAmplitude < 10) {
      if (!this.silenceTimeoutId) {
        this.silenceTimeoutId = setTimeout(() => {
          console.log('Detected 2 seconds of silence. Stopping recording.');
          this.stopService();
        }, 2000);
      }
    } else {
      clearTimeout(this.silenceTimeoutId);
      this.silenceTimeoutId = null;
    }

    this.animationFrameId = requestAnimationFrame(() => this.draw());
  }

  //Para la animarcion avatar
  private loadImages(): Promise<void> {
    const visemeIds = Array.from({ length: 22 }, (_, i) => i.toString()); // Visemes from 0 to 21
    const promises = visemeIds.map(id => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = `assets/${id}.jpg`;
        img.onload = () => {
          this.images[id] = img;
          resolve();
        };
      });
    });

    return Promise.all(promises).then(() => { });
  }

  private startAnimation() {
    let visemeIndex = 0;

    this.openaiService.playAudioBot();
    
    let currentTimeA = this.visemes.pop()?.audioOffset;
    console.log("currentTimeA");
      
      console.log(this.openaiService.getAudioBot()?.currentTime);

    const update = () => {
      const audio = this.openaiService.getAudioBot();
      const currentTime = audio ? audio.currentTime * 1000 : 0; // Convert to ms
     // console.log(currentTime);          
      
      if (visemeIndex < this.visemes.length && currentTime >= this.visemes[visemeIndex].audioOffset) {
        const visemeId = this.visemes[visemeIndex].visemeId.toString();
        if (this.images[visemeId]) {
          this.drawViseme(visemeId);
        } else {
          console.warn(`Image for viseme ID ${visemeId} not found.`);
        }
        visemeIndex++;
      }
      requestAnimationFrame(update);
      
     
     
      
    };

    update();
  }

  private drawViseme(visemeId: string) {
    const img = this.images[visemeId];
    console.log(this.images[visemeId]);
    if (img) {
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.ctx.drawImage(img, 0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    } else {
      console.warn(`Image for viseme ID ${visemeId} not found.`);
    }
  }

  //Ojos avatar

  private startAdditionalImageSequence() {
    // Cargar las imágenes adicionales
    const img0 = new Image();
    img0.src = 'assets/0ojo.jpg';
    const img1 = new Image();
    img1.src = 'assets/1ojo.jpg';
    const img2 = new Image();
    img2.src = 'assets/2ojo.jpg';

    img0.onload = () => {
        img1.onload = () => {
            img2.onload = () => {
                this.additionalImages['0ojo'] = img0;
                this.additionalImages['1ojo'] = img1;
                this.additionalImages['2ojo'] = img2;

                // Iniciar la secuencia
                setInterval(() => {
                    this.currentAdditionalImage = this.additionalImages['0ojo'];
                    this.drawAdditionalImage();

                    setTimeout(() => {
                        this.currentAdditionalImage = this.additionalImages['1ojo'];
                        this.drawAdditionalImage();

                        setTimeout(() => {
                            this.currentAdditionalImage = this.additionalImages['2ojo'];
                            this.drawAdditionalImage();

                            setTimeout(() => {
                                this.currentAdditionalImage = undefined;
                                this.drawAdditionalImage();
                            }, 100);
                        }, 400);
                    }, 100);
                }, 4000); // Repetir cada 5 segundos
            };
        };
    };
}


  private drawAdditionalImage() {
    // Redibujar el viseme actual
    
    
    if (this.currentAdditionalImage) {

      // Dibujar la imagen adicional superpuesta
      this.ctx.drawImage(this.currentAdditionalImage, 0, 0, this.canvas.nativeElement.width, 84); // Ajustar las coordenadas y tamaño según sea necesario
    }
  }

}