// chat.component.ts

import { Component, OnInit } from '@angular/core';
import { OpenaiService } from '../services/openai.service';
import { User } from '../model/user';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messages: { text: string; sender: string; }[] = [];
  userInput: string = '';
  user: User = { id: '1234' };

  constructor(private openaiService: OpenaiService) { }

  ngOnInit(): void {
    this.addBotMessage('Hola, ¿en qué puedo ayudarte?');
  }

  async sendMessage() {
    if (this.userInput.trim() === '') {
      return;
    }

    this.addUserMessage(this.userInput);
    try {
      const botResponse = await this.openaiService.getChatResponse(this.user.id, this.userInput);
     // this.addBotMessage(botResponse);
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
  }
}
