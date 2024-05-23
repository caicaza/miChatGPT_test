
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private apiUrl = 'http://localhost:3000/chat'; // Asegúrate de que esta URL coincide con la ruta de tu servidor
  private uploadUrl = 'http://localhost:3000/upload';
  private speechUrl = 'http://localhost:3000/audio'; // URL para generar audio

  constructor(private http: HttpClient) { }
  //Chat
/*   async getChatResponse(prompt: string): Promise<string> {
    try {
      const response = await this.http.post<{ text: string }>(this.apiUrl, { prompt }).toPromise();
      return response?.text || 'Lo siento, ha ocurrido un error.';
    } catch (error) {
      console.error('Error fetching response from OpenAI proxy:', error);
      return 'Lo siento, ha ocurrido un error.';
    }
  } */

  async getChatResponse(prompt: string): Promise<{ text: string; audioUrl?: string }> {
    try {
      const response = await this.http.post<{ text: string; audioUrl?: string }>(this.apiUrl, { prompt }).toPromise();
      return response || { text: 'Lo siento, ha ocurrido un error.' };
    } catch (error) {
      console.error('Error fetching response from OpenAI proxy:', error);
      return { text: 'Lo siento, ha ocurrido un error.' };
    }
  }

  async getSpeechAudio(): Promise<string> {
    try {
      const response = await this.http.get(this.speechUrl, { responseType: 'blob' }).toPromise();
      if (!(response instanceof Blob)) {
        throw new Error('Invalid audio response');
      }
      const audioBlob = new Blob([response], { type: 'audio/mpeg' });
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Error fetching speech audio:', error);
      throw new Error('Error fetching speech audio');
    }
  }

  //Upload
  uploadFile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(this.uploadUrl, formData).toPromise()
      .then(() => {})
      .catch(error => {
        console.error('Error uploading file:', error);
        throw new Error('Error uploading file');
      });
  }
}