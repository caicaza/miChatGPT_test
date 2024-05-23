import { Injectable } from '@angular/core';
import { OpenAI } from 'openai';
import { environment } from '../../environments/environment';






@Injectable({
  providedIn: 'root'
})
export class OpenAiChatService {
  /* private apiUrl = 'https://api.openai.com/v1/images/generations';
  private API_KEY= 'mikey';

  constructor(private http: HttpClient) {}

  generateRespuesta(prompt: string, model: string) {
    const headers = new HttpHeaders().set('Authorization', 'Bearer ' + "YOUR_API_KEY");/////Poner la clave
    const body = {
      'model': model,
      'prompt': prompt,
      'num_images': 1,
      'size': '512x512',
      'response_format': 'url'
    };
    return this.http.post(this.apiUrl, body, { headers: headers });
  } */

/*   private apiUrl = environment.apiUrl; 
  constructor(private http: HttpClient) { }

  public sendMessage(message: string) {
    return this.http.post<any>(`${this.apiUrl}/chat`, { message });
  } */

  private openaiInstance: any;

  constructor() {
    this.openaiInstance = new OpenAI({
      apiKey: environment.openaiApiKey,
      dangerouslyAllowBrowser: true
      //organizationId: environment.openaiOrganizationId // Opcional, si usas OpenAI GPT-4
    });
  }

  async getChatResponse(prompt: string): Promise<string> {
    try {
      const completions = await this.openaiInstance.completions.create({
        engine: 'davinci-codex',
        prompt: prompt,
        max_tokens: 150
      });

      return completions.choices[0].text.trim();
    } catch (error) {
      console.error('Error fetching response from OpenAI:', error);
      return 'Lo siento, ha ocurrido un error.';
    }
  }
}