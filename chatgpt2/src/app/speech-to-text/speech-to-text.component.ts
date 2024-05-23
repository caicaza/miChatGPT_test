import { Component } from '@angular/core';
import { VoiceRecognitionService } from '../services/voice-recognition.service';

@Component({
  selector: 'app-speech-to-text',
  templateUrl: './speech-to-text.component.html',
  styleUrls: ['./speech-to-text.component.css']
})
export class SpeechToTextComponent {
  constructor(public service: VoiceRecognitionService) {}

  startService(): void {
    this.service.start();
  }

  stopService(): void {
    this.service.stop();
  }
}
