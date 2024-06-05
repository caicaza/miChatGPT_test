import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  private chatUrl = 'http://localhost:3000/chatGemini';
  private transcribeUrl = 'http://localhost:3000/transcribeGemini';
  private textToSpeechUrl = 'http://localhost:3000/textToSpeechGemini';

  constructor(private http: HttpClient) { }

  sendMessage(message: string): Observable<any> {
    return this.http.post<any>(this.chatUrl, { message });
  }

  transcribeAudio(audioContent: string): Observable<any> {
    return this.http.post<any>(this.transcribeUrl, { audioContent });
  }

  convertTextToSpeech(text: string): Observable<any> {
    return this.http.post<any>(this.textToSpeechUrl, { text });
  }
}