import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OpenaiService {
  private apiUrl = 'http://localhost:3000/chat'; // Asegúrate de que esta URL coincide con la ruta de tu servidor
  private uploadUrl = 'http://localhost:3000/upload';
  private speechUrl = 'http://localhost:3000/audio'; // URL para generar audio
  private speechToTextUrl = 'http://localhost:3000/speech-to-text';
  private visionUrl = 'http://localhost:3000/vision'; // URL para enviar la imagen
  private evaluationUrl = 'http://localhost:3000/evaluate'; // URL para evaluar al usuario


  private audio: HTMLAudioElement | null = null;
  audioBot: HTMLAudioElement | null = null;
  private visemes: { audioOffset: number, visemeId: number }[] = [];

  constructor(private http: HttpClient) { }

  // Método para obtener la respuesta del chat
  async getChatResponse(prompt: string): Promise<{ text: string; audioUrl?: string; viseme: { audioOffset: number, visemeId: number }[] }> {
    try {
      const response = await this.http.post<{ text: string; audioUrl?: string; viseme: { audioOffset: number, visemeId: number }[] }>(this.apiUrl, { prompt }).toPromise();
      if (response) {
        //this.audioBot = new Audio(response.audioUrl);
        this.visemes = response.viseme || [];        
      }
      
      return response || { text: 'Lo siento, ha ocurrido un error.', viseme: [] };
    } catch (error) {
      console.error('Error fetching response from OpenAI proxy:', error);
      return { text: 'Lo siento, ha ocurrido un error.', viseme: [] };
    }
  }
  // Método para obtener el audio del discurso
  async getSpeechAudio(): Promise<string> {
    try {
        const response = await this.http.get(this.speechUrl, { responseType: 'blob' }).toPromise();
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
}

  // Método para subir archivos
  uploadFile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(this.uploadUrl, formData).toPromise()
      .then(() => { })
      .catch(error => {
        console.error('Error uploading file:', error);
        throw new Error('Error uploading file');
      });
  }

  // Método para obtener texto a partir del discurso
  async getSpeechFromText(text: string): Promise<Blob> {
    try {
      const response = await this.http.post(this.speechToTextUrl, { text }, { responseType: 'blob' }).toPromise();
      if (!response) {
        throw new Error('Error: No audio received');
      }

      const audioBlob = new Blob([response], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      //this.audio = new Audio(audioUrl);

      return audioBlob;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw new Error('Error generating speech');
    }
  }

  // Método para procesar imágenes
  async processImage(imageFile: File): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await this.http.post(this.visionUrl, formData).toPromise();
      return response;
    } catch (error) {
      throw new Error('Error procesando imagen en OpenAI');
    }
  }

  // Método para obtener el objeto de audio
  getAudio(): HTMLAudioElement | null {
    return this.audio;
  }

  // Método para obtener los visemas
  getVisemes(): { audioOffset: number, visemeId: number }[] {
    return this.visemes;
  }

  // Método para establecer los visemas
  setVisemes(visemes: { audioOffset: number, visemeId: number }[]): void {
    this.visemes = visemes;
  }

/*   playAudioBot() {
    if (this.audioBot) {
      this.audioBot.play();
    }
  } */

  getAudioBot() {
    return this.audioBot;
  }

   playAudioBot() {
    const audio = new Audio();
    audio.src = `${this.speechUrl}?_=${new Date().getTime()}`;

    this.audioBot = audio;
    //this.audioUrl = await this.openaiService.getSpeechAudio();
    console.log("this.audioBot");
    console.log(this.audioBot);
    this.audioBot.load();
    this.audioBot.play();
    
  }

  //Respuesta
  // Método para evaluar al vendedor y devolver resultados en formato JSON
  async evaluate(): Promise<any> {
    try {
      const response = await this.http.post<any>(`${this.evaluationUrl}`, prompt).toPromise();
      console.log('Respuesta de evaluación:', response);
      return response;
    } catch (error) {
      console.error('Error al evaluar al vendedor:', error);
      throw error;
    }
  }
}
