import { Component, OnInit } from '@angular/core';
import { OpenaiService } from '../services/openai.service';
import { HttpClient } from '@angular/common/http';


// Define los tipos de feedback
export interface AspectoEvaluacion {
  puntuacion: number;
  explicacion: string;
}

export interface Evaluacion {
  [key: string]: AspectoEvaluacion | string;
}



@Component({
  selector: 'app-respuesta',
  templateUrl: './respuesta.component.html',
  styleUrl: './respuesta.component.css'
})
export class RespuestaComponent implements OnInit {
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

  constructor(private openaiService: OpenaiService) {

    
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

  async evaluateVendedor() {
    try {
      const response = await this.openaiService.getEvaluation();
      this.evaluacion = JSON.parse(response);

      
      console.log('Respuesta de evaluación:', this.evaluacion);
      // Aquí puedes manejar la respuesta del servidor como desees
    } catch (error) {
      console.error('Error al evaluar al vendedor:', error);
      // Aquí puedes manejar los errores de la solicitud
    }
  }
}