import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { GeminiService } from '../services/gemini.service';
import { VoiceRecognitionService } from '../services/voice-recognition.service';

interface Viseme {
  audioOffset: number;
  visemeId: number;
}

@Component({
  selector: 'app-chat-gemini',
  templateUrl: './chat-gemini.component.html',
  styleUrls: ['./chat-gemini.component.css']
})
export class ChatGeminiComponent {
  message: string = '';
  messages: { sender: string, text: string }[] = [];

  reply: string = '';
  isRecording: boolean = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  audioBlob: Blob | null = null;
  audioUrl: string | null = null;
  audioContent: string | null = null; // Definimos la propiedad audioContent

  //Para la animacion Avatar
  @ViewChild('canvas', { static: true }) canvas!:ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private images: { [key: string]: HTMLImageElement } = {};
  private visemes: Viseme[] = [];
  textInput: string = '';
  
  private additionalImages: { [key: string]: HTMLImageElement } = {};
  private currentAdditionalImage: HTMLImageElement | undefined;

  @ViewChild('visualizerCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  canvasContext: CanvasRenderingContext2D | null = null;


   // Escuchar el evento de redimensionar la ventana
 @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
   this.resizeCanvas();
 }

 //Reconocer voz
 availableDevices: MediaDeviceInfo[] = [];
 selectedDeviceId: string = '';
 mediaStream: MediaStream | null = null;
 audioContext: AudioContext | null = null;
 analyserNode: AnalyserNode | null = null;
 dataArray: Uint8Array | null = null;
 animationFrameId: number | null = null;
 silenceTimeoutId: any;

 recognizedText = '';

  constructor(private geminiService: GeminiService, public voiceService: VoiceRecognitionService) {}

  async ngOnInit(): Promise<void> {
    //Avatar
    this.ctx = this.canvas.nativeElement.getContext('2d')!;
    await this.loadImages();
    this.drawViseme('0');
    this.startAdditionalImageSequence(); // Iniciar la secuencia de la imagen adicional

    //bot
   // this.addBotMessage(this.mensajeInicial);
    //voice recognition

    //voice recognition
    this.getAudioDevices();
    this.voiceService.onSpeechDetected.subscribe((message: string) => {
      console.log('SPEECH');
      console.log('Speech detected:', message);
      if (message == 'Silence') {
        this.recognizedText = this.voiceService.getVoice();
        console.log("voz obtenida")
        //this.isRecording=false;
        this.toggleRecording();
       console.log(this.recognizedText);
       // this.userInput=this.recognizedText;
       // this.sendMessage();
      }
    });
    
  }

  sendMessage() {
    this.addUserMessage(this.message);
    this.geminiService.sendMessage(this.message).subscribe(response => {
      this.message = '';
      this.reply = response.reply;
      this.convertTextToSpeech(this.reply);
    });
  }

  addUserMessage(message: string) {
    this.messages.push({ text: message, sender: 'user' });
    

  }

  addBotMessage(message: string) {
    this.messages.push({ text: message, sender: 'bot' });
    console.log(message);
        
  }

  ngAfterViewInit(): void {
    this.resizeCanvas();
    //this.setupCanvas();
  }

  setupCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.canvasContext = canvas.getContext('2d');
    if (!this.canvasContext) {
      console.error('Failed to get canvas context.');
    }
  }


  convertTextToSpeech(text: string) {
    this.geminiService.convertTextToSpeech(text).subscribe(response => {
      this.addBotMessage(text);
      this.audioContent = response.audio;
      this.geminiService.setAudioBot(response.audio);
      const audio = new Audio(`data:audio/mp3;base64,${this.audioContent}`);
      //audio.play();

      // Procesar el viseme (letterTimestamps)
    
      console.log(response.viseme);

       this.visemes=response.viseme;
      this.loadImages().then(() => {
        console.log("comenzar");
        this.startAnimation();
      }); 
    });
  }



  startRecording() {
         
      //this.isRecording = true;
      console.log("isRecording");
      console.log( this.isRecording);
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();
        this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
          this.audioChunks.push(event.data);
        };
        this.mediaRecorder.onstop = () => {
          this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          this.audioUrl = URL.createObjectURL(this.audioBlob);
          this.audioChunks = [];
          this.transcribeAudio();
          
        };
      })
      .catch(error => console.error('Error accessing media devices.', error));
 
         
  }
  cambiarBooleano(bool: boolean): boolean {
    return !bool;
}

  stopRecording() {
    //this.isRecording = false;
      console.log("isRecording");
      console.log( this.isRecording);
    this.mediaRecorder?.stop();
  }

  transcribeAudio() {
    if (this.audioBlob) {
      const reader = new FileReader();
      reader.readAsDataURL(this.audioBlob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const audioContent = base64data.split(',')[1];
        this.geminiService.transcribeAudio(audioContent).subscribe(response => {
          this.message = response.transcription;
          if(this.message != ""){
            console.log("mensaje("+this.message+")");
            this.sendMessage();
          }
         
        }, error => {
          console.error('Error transcribing audio:', error);
        });
      };
    }
  }

  //Evaluar
  Evaluar(){
    this.geminiService.getResults().subscribe(response => {
      this.message = '';
      this.reply = response.reply;
      //this.convertTextToSpeech(this.reply);
    });

  }

    // Método para ajustar el tamaño del canvas
    private resizeCanvas() {
      const canvas = document.getElementById('responsiveCanvas') as HTMLCanvasElement;
      const container = canvas.parentElement as HTMLElement;
      if (container) {
        const width = container.clientWidth;
        const height = width * 4 / 3; // Mantener la proporción 4:3
        canvas.width = width;
        canvas.height = height;
        this.drawViseme('0');
      }
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
      const miWidth = this.canvas.nativeElement.width;
      const miHeight = miWidth*0.372;

      // Dibujar la imagen adicional superpuesta
      this.ctx.drawImage(this.currentAdditionalImage, 0, 0, miWidth, miHeight); // Ajustar las coordenadas y tamaño según sea necesario
    } 
  }

  //Para la animarcion avatar
  private loadImages(): Promise<void> {
    const visemeIds = Array.from({ length: 22 }, (_, i) => i.toString()); // Visemes from 0 to 21
    const promises = visemeIds.map(id => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        console.log(img.src);
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

    this.geminiService.playAudioBot();
    
    //let currentTimeA = this.visemes.pop()?.audioOffset;
  
    const update = () => {
      const audio = this.geminiService.getAudioBot();
      const currentTime = audio ? audio.currentTime : 0; // Convert to ms
    // console.log(currentTime); //AQUI SE MULTIPLICABA POR 1000         
      
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

  async toggleRecording(){
    this.isRecording = this.cambiarBooleano(this.isRecording);

    if (this.isRecording) {
      this.startRecording();
    } else {
      this.stopRecording();
      
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
  
        // Necesitamos reiniciar el servicio de reconocimiento de voz después de cambiar el flujo de medios
        this.voiceService.stop();
        this.voiceService.start();
  
        //this.isRecording = true;
  
        const selectedDevice = this.availableDevices.find(device => device.deviceId === this.selectedDeviceId);
        console.log('Using microphone: ', selectedDevice ? selectedDevice.label : 'Unknown device');
  
        //this.draw();
      } catch (error) {
        console.error('Error accessing selected microphone: ', error);
      }
    } else {
      console.warn('No microphone selected.');
    }
  }

  stopService(): void {
    this.voiceService.stop();
   //this.isRecording = false;
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
}
