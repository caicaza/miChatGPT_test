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

  selectedFile: File | null = null;
  audioUrl: string | null = null;

  mensajeInicial="Hola, ¿en qué puedo ayudarte?";

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
}
