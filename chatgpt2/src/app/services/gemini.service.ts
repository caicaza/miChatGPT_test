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

  audioBot: HTMLAudioElement | null = null;



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

/*     async convertTextToSpeech(): Promise<string> {
      try {
          const response = await this.http.get(this.textToSpeechUrl, { responseType: 'blob' }).toPromise();
          if (!(response instanceof Blob)) {
              throw new Error('Invalid audio response');
          }
  
          // Liberar el URL anterior si existe
          if (this.audioBot) {
              URL.revokeObjectURL(this.audioBot.src);
          }
  
          const audioBlob = new Blob([response], { type: 'audio/mpeg' });
          const audioUrl = URL.createObjectURL(audioBlob);
  
          // Guardar el audio para su posterior uso
          this.audioBot = new Audio(audioUrl);
          return audioUrl;
      } catch (error) {
          console.error('Error fetching speech audio:', error);
          throw new Error('Error fetching speech audio');
      }
  } */

    
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

  //Audio para la animacion
  getAudioBot() {
    return this.audioBot;
  }

  setAudioBot(audioContent:String) {
    this.audioBot=new Audio(`data:audio/mp3;base64,${audioContent}`);
  }

   playAudioBot() {
/*     const audio = new Audio();
    audio.src = `${this.textToSpeechUrl}?_=${new Date().getTime()}`;

    this.audioBot = audio; */
    //this.audioUrl = await this.openaiService.getSpeechAudio();
    /* console.log("this.audioBot");
    console.log(this.audioBot); */
    if(this.audioBot){
      this.audioBot.load();
      this.audioBot.play(); 
    }
    
    
  }
} 