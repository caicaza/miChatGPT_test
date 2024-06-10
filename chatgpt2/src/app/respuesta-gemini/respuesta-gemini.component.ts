import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { GeminiService } from '../services/gemini.service';


// Define los tipos de feedback
export interface AspectoEvaluacion {
  puntuacion: number;
  explicacion: string;
}

export interface Evaluacion {
  [key: string]: AspectoEvaluacion | string;
}


@Component({
  selector: 'app-respuesta-gemini',
  templateUrl: './respuesta-gemini.component.html',
  styleUrl: './respuesta-gemini.component.css'
})
export class RespuestaGeminiComponent implements OnInit {
  evaluacion: Evaluacion = {} as Evaluacion; // Inicializar como un objeto vacío

  private evaluacionJson: string = `
    {
      "uso_tecnicas_marketing": {
        "puntuacion": 0,
        "explicacion": ""
      },
      "profesionalismo": {
        "puntuacion": 0,
        "explicacion": ""
      },
      "caracter": {
        "puntuacion": 0,
        "explicacion": ""
      },
      "atencion_cliente": {
        "puntuacion": 0,
        "explicacion": ""
      },
      "conocimiento_producto": {
        "puntuacion": 0,
        "explicacion": ""
      },
      "reaccion_facial": {
        "puntuacion": 0,
        "explicacion": ""
      },
      "consejos_generales": ""
    }
  `;

  constructor(private geminiService: GeminiService) {

    
  }

  ngOnInit(): void {
    this.evaluacion = JSON.parse(this.evaluacionJson);
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  getEvaluacionText(key: string): string {
    const value = this.evaluacion[key];
    if (typeof value === 'string') {
      return value;
    } else {
      const aspectoEvaluacion = value as AspectoEvaluacion;
      return `<strong>Puntuación:</strong> ${aspectoEvaluacion.puntuacion}<br><strong>Explicación:</strong> ${aspectoEvaluacion.explicacion}`;
    }
  }

/*   async evaluateVendedor() {
    try {
      this.geminiService.getResults().subscribe(response => {
        let reply:any;
        reply = response.reply;
        this.evaluacion = JSON.parse(response);
        //console.log(reply);
        //this.convertTextToSpeech(this.reply);
      });

      
      console.log('Respuesta de evaluación:', this.evaluacion);
      // Aquí puedes manejar la respuesta del servidor como desees
    } catch (error) {
      console.error('Error al evaluar al vendedor:', error);
      // Aquí puedes manejar los errores de la solicitud
    }
  } */

    async evaluateVendedora() {
      try {
        const response = await this.geminiService.getResults();
        console.log(response);
        //this.evaluacion = JSON.parse(response);
  
        
        console.log('Respuesta de evaluación:', this.evaluacion);
        // Aquí puedes manejar la respuesta del servidor como desees
      } catch (error) {
        console.error('Error al evaluar al vendedor:', error);
        // Aquí puedes manejar los errores de la solicitud
      }
    }

      //Evaluar
    async evaluateVendedor() {    
        this.geminiService.getResults().subscribe(response => {
      
      let reply: string = '';
      reply = response.reply;
      let cleanReply = reply.replace(/```json/g, '').replace(/```/g, '').trim();
      
      this.evaluacion = JSON.parse(cleanReply);

    });

  }

    

    
}