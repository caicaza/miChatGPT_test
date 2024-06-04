import { Component } from '@angular/core';
import { GeminiService } from '../services/gemini.service';

@Component({
  selector: 'app-chat-gemini',
  templateUrl: './chat-gemini.component.html',
  styleUrls: ['./chat-gemini.component.css']
})
export class ChatGeminiComponent {
  messages: string[] = [];
  inputMessage: string = '';

  constructor(private geminiService: GeminiService) {}

  sendMessage(): void {
    if (this.inputMessage.trim() === '') {
      return;
    }

    this.geminiService.sendMessage(this.inputMessage).subscribe(
      response => {
        this.messages.push(`User: ${this.inputMessage}`);
        this.messages.push(`Gemini: ${response.reply}`);
        this.inputMessage = '';
      },
      error => {
        console.error('Error:', error);
      }
    );
  }
}
