import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, HostListener, Inject } from '@angular/core';
import { OpenaiService } from '../services/openai.service';
import { VoiceRecognitionService } from '../services/voice-recognition.service';
import { ThreeScene } from './three-scene'; // Importa la clase ThreeScene desde el archivo separado
import { User } from '../model/user';
import { WebSocketService } from '../services/web-socket.service';


interface Viseme {
  audioOffset: number;
  visemeId: number;
}
@Component({
  selector: 'app-chat3d',
  templateUrl: './chat3d.component.html',
  styleUrl: './chat3d.component.css',
  providers: [
    { provide: Window, useValue: window }
]
})
export class Chat3dComponent implements OnInit, AfterViewInit {

  user: User = { id: '1234' };

  messages: { text: string; sender: string; }[] = [];
  userInput: string = '';
  mensajeInicial="Hola, ¿en qué puedo ayudarte?";
  //Archivo y audio
  selectedFile: File | null = null;
  audioUrl: string | null = null;
  //Temporizador
  minutes: number = 2;
  seconds: number = 0;
  private timerInterval: any;
  private timerTimeout: any;

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
  private visemes: Viseme[] = [];
  textInput: string = '';

 // Escuchar el evento de redimensionar la ventana
  private scene: ThreeScene; 

  constructor(private openaiService: OpenaiService, public voiceService: VoiceRecognitionService, @Inject(Window) private window: Window, private socketService: WebSocketService) { 
    this.scene = new ThreeScene(this.window);
  }

  async ngOnInit(): Promise<void> {   
    //bot
    this.addBotMessage(this.mensajeInicial);
    //voice recognition
    this.getAudioDevices();
    this.voiceService.onSpeechDetected.subscribe((message: string) => {
      if (message == 'Silence') {
        this.recognizedText = this.voiceService.getVoice();        
        this.userInput=this.recognizedText;
        this.sendMessage();
      }
    });
    //Socket
    this.socketService.joinRoom(this.user.id);
    //Temporizador   

  }

  async ngAfterViewInit(): Promise<void> {
    await this.scene.init('three-js-container');
    setInterval(() => {
      this.scene.setWeight_Eyes(1);
    }, 3500); 
    //Emocion de alegria
    setTimeout(() => {
      this.animateMorph(0);
    }, 3500);
    this.startTimer();
    
    
  }

  async sendMessage() {
    if (this.userInput.trim() === '') {
      return;
    }

    this.addUserMessage(this.userInput);
    try {
      const botResponse = await this.openaiService.getChatResponse(this.user.id,this.userInput);
      this.addBotMessage(botResponse.text);
      this.audioUrl = await this.openaiService.getSpeechAudio();
      
      this.visemes=botResponse.viseme;
      console.log(botResponse.viseme);
      
      this.startAnimation();
   
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
  }

  async playAudio() {
    const audio = new Audio();
    this.audioUrl = await this.openaiService.getSpeechAudio();
    audio.src = this.audioUrl!;
    audio.load();

    
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
  
        // Necesitamos reiniciar el servicio de reconocimiento de voz después de cambiar el flujo de medios
        this.voiceService.stop();
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

  private startAnimation() {
    let visemeIndex = 0;  
    this.openaiService.playAudioBot();

    setTimeout(()=>{
      this.animationArms();
    },1200);
  
    const update = () => {
      const audio = this.openaiService.getAudioBot();
      const currentTime = audio ? audio.currentTime * 1000 : 0; // Convert to ms
  
      while (visemeIndex < this.visemes.length && currentTime >= this.visemes[visemeIndex].audioOffset) {
        const viseme = this.visemes[visemeIndex];
        const visemeId = viseme.visemeId; 
        // Call the viseme function with the interpolation factor
        this.scene.visemeFunctions[visemeId]();
  
        visemeIndex++;
      }
      requestAnimationFrame(update);
    };
  
    update();
  }

  ojos(){
    this.scene.setWeight_Eyes(1);
  }
  arms(index:number){
    this.scene.armMovements[index]();
  }

  animationArms(){
    const valores = [ 0, 1, 2, null];
    const indiceAleatorio = Math.floor(Math.random() * valores.length);
    const index=valores[indiceAleatorio];
    
    if (index != null) {
      console.log(index);
      this.scene.armMovements[index]();
    }

  }
  animationArms2(){
    this.scene.armMovements[0]();
  }

  animateMorph(index:number){
    this.scene.applyWeights(index);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.seconds === 0) {
        if (this.minutes === 0) {
          this.stopTimer();
        } else {
          this.minutes--;
          this.seconds = 59;
        }
      } else {
        this.seconds--;
      }
    }, 1000);

    this.timerTimeout = setTimeout(() => {
      this.timerFinished();
    }, 2 * 60 * 1000); // 2 minutos en milisegundos
  }

  stopTimer() {
    clearInterval(this.timerInterval);
    clearTimeout(this.timerTimeout);
  }

  timerFinished() {
    this.stopTimer();
    console.log('El tiempo se ha acabado!');
    // Aquí puedes agregar cualquier lógica adicional que necesites cuando el temporizador se acabe
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
    //temporizador
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.timerTimeout) {
      clearTimeout(this.timerTimeout);
    }
  }


}