import { Component, OnInit } from '@angular/core';
import { OpenaiService } from '../services/openai.service';

@Component({
  selector: 'app-chattest',
  templateUrl: './chattest.component.html',
  styleUrls: ['./chattest.component.css']
})
export class ChattestComponent implements OnInit {
  messages: { text: string; sender: string; }[] = [];
  userInput: string = '';
  mensajeInicial="Hola, ¿en qué puedo ayudarte?";
  //Archivo y audio
  selectedFile: File | null = null;
  audioUrl: string | null = null;
  //Chat

  //Record
  isListening: boolean = false;


  constructor(private openaiService: OpenaiService) { }

  ngOnInit(): void {
    this.addBotMessage(this.mensajeInicial);
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
      console.log("audio response");

      if (botResponse.audioUrl) {
        
        console.log("audio response");
        console.log(this.audioUrl);
        this.playAudio();
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
      this.playAudio();
    }
    
  }

  async playAudio() {
    const audio = new Audio();
    this.audioUrl = await this.openaiService.getSpeechAudio();
    audio.src = this.audioUrl!;
    console.log(audio.src);
    audio.load();
    audio.play();
  }

  async sonido(){
    const audio = new Audio();
    this.audioUrl = await this.openaiService.getSpeechAudio();
    audio.src = this.audioUrl!;
    console.log(audio.src);
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
  startRecognition() {
    const recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      this.isListening = true;
      console.log('Reconocimiento de voz iniciado. Por favor, habla.');
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.userInput = transcript;
      this.sendMessage();
      this.isListening = false;
    };

    recognition.onspeechend = () => {
      recognition.stop();
      this.isListening = false;
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      console.log('Error en el reconocimiento de voz: ' + event.error);
      this.isListening = false;
    };

    recognition.start();
  }
}
