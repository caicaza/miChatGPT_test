import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisemeSyncService {
  private apiUrl = 'http://localhost:3000/synthesize'; // URL para generar audio y visemes
  private audioUrl = 'http://localhost:3000/audio'; // URL para obtener el archivo de audio
  private visemesUrl = 'http://localhost:3000/visemes'; // URL para obtener el archivo JSON de visemes

  private audio: HTMLAudioElement | null = null;
  private visemes: any[] = [];

  constructor(private http: HttpClient) { }

  async synthesizeSpeech(text: string): Promise<void> {
    try {
      const response = await this.http.post<{ audioFilePath: string, visemesFilePath: string }>(this.apiUrl, { text }).toPromise();

      if (response && response.audioFilePath) {
        const audioFilePath = `${this.audioUrl}?_=${new Date().getTime()}`; // Agregar una cadena aleatoria
        this.audio = new Audio(audioFilePath);
      } else {
        throw new Error('No audioFilePath found in response');
      }

      const visemes = await this.http.get<any[]>(this.visemesUrl).toPromise();
      this.visemes = visemes || []; // Asegurarse de que visemes siempre sea un array
    } catch (error) {
      console.error('Error synthesizing speech:', error);
      throw new Error('Failed to synthesize speech');
    }
  }

  playAudio() {
    if (this.audio) {
      this.audio.play();
    }
  }

  getAudio() {
    return this.audio;
  }

  getVisemes() {
    return this.visemes;
  }
}
