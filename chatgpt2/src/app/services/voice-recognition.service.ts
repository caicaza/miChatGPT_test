import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VoiceRecognitionService {
  recognition: any;
  text = '';
  tempWords = '';
  isStoppedSpeechRecog = false;

  constructor() {
    this.recognition = new (window.webkitSpeechRecognition || window.SpeechRecognition)();
    this.recognition.interimResults = true;
    this.recognition.lang = 'es-ES';

    this.recognition.addEventListener('result', (e: any) => {
      const transcript = Array.from(e.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');

      this.tempWords = transcript;
      console.log("transcrpt");
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
}
