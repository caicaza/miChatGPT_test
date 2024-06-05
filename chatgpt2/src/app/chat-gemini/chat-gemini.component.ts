import { Component } from '@angular/core';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-chat-gemini',
  templateUrl: './chat-gemini.component.html',
  styleUrls: ['./chat-gemini.component.css']
})
export class ChatGeminiComponent {
  message: string = '';
  reply: string = '';
  isRecording: boolean = false;
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  audioBlob: Blob | null = null;
  audioUrl: string | null = null;
  audioContent: string | null = null; // Definimos la propiedad audioContent

  constructor(private geminiService: GeminiService) {}

  sendMessage() {
    this.geminiService.sendMessage(this.message).subscribe(response => {
      this.reply = response.reply;
      this.convertTextToSpeech(this.reply);
    });
  }

  convertTextToSpeech(text: string) {
    this.geminiService.convertTextToSpeech(text).subscribe(response => {
      this.audioContent = response.audioContent;
      const audio = new Audio(`data:audio/mp3;base64,${this.audioContent}`);
      audio.play();
    });
  }

  startRecording() {
    this.isRecording = true;
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

  stopRecording() {
    this.isRecording = false;
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
          this.sendMessage();
        }, error => {
          console.error('Error transcribing audio:', error);
        });
      };
    }
  }
}
