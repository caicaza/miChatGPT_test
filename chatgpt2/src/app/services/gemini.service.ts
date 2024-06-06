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
  private processImageUrl = 'http://localhost:3000/processImageGemini';
  private respuestaURL = 'http://localhost:3000/chatGeminiJsonResp';


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
/*   processImage(imageFile: File) {

    try {
      console.log("file:"+imageFile);
      const formData = new FormData();
      formData.append('image', imageFile);
      console.log(formData);

      const response = this.http.post(this.processImageUrl, formData).toPromise();
      return response;
    } catch (error) {
      throw new Error('Error procesando imagen en Gemini proccess');
    }
    
  } */

      // Método para procesar imágenes
  async processImage(imageFile: File): Promise<any> {
    try {
      const formData = new FormData();
      console.log("imageFile:"+imageFile);
      formData.append('image', imageFile);
      console.log("formData:"+formData);

      const response = await this.http.post(this.processImageUrl, formData).toPromise();
      return response;
    } catch (error) {
      throw new Error('Error procesando imagen en Gemini pro');
    }
  }

  getResults(): Observable<any> {
    return this.http.post<any>(this.respuestaURL, {});
  }
} 