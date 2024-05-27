import { Injectable, EventEmitter } from '@angular/core';

declare var webkitSpeechRecognition: any;
declare var SpeechRecognition: any;

//Revisar en ningun momento le asignamos el mircrofono al servicio

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {
  recognition: any;
  text = '';
  tempWords = '';
  isStoppedSpeechRecog = false;
  silenceTimeoutId: any;
  onSpeechDetected = new EventEmitter<string>();

  constructor() {
    this.recognition = new (webkitSpeechRecognition || SpeechRecognition)();
    this.recognition.interimResults = true;
    this.recognition.lang = 'es-ES';

    this.recognition.addEventListener('result', (e: any) => {
      const transcript = Array.from(e.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      this.tempWords = transcript;
      console.log('Transcript:', this.tempWords);

      // Emit the detected speech
     // this.onSpeechDetected.emit(this.getVoice());

      // Restart the silence timer if a word is detected
      clearTimeout(this.silenceTimeoutId);
      this.silenceTimeoutId = setTimeout(() => {
        console.log('Detected 2 seconds of silence.');
        this.onSpeechDetected.emit('Silence');
      }, 2000);
    });

    this.recognition.addEventListener('end', () => {
      if (this.isStoppedSpeechRecog) {
        this.recognition.stop();
        console.log('End speech recognition');
      } else {
        this.wordConcat();
        this.recognition.start();
      }
    });
  }

  start() {
    this.isStoppedSpeechRecog = false;
    this.recognition.start();
    console.log('Speech recognition started');
  }

  stop() {
    this.isStoppedSpeechRecog = true;
    this.wordConcat();
    this.recognition.stop();
    console.log('End speech recognition');
  }

  wordConcat() {
    this.text = this.text + ' ' + this.tempWords + '.';
    this.tempWords = '';
  }

  getVoice(): string {
    const miWords = this.text;
    this.text = '';
    return miWords;
  }
}
