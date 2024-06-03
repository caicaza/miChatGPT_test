import { Component, OnInit } from '@angular/core';
import { OpenaiService } from '../services/openai.service';
import { HttpClient } from '@angular/common/http';


// Define los tipos de feedback
interface FeedbackItem {
  puntuacion: number;
  explicacion: string;
}

interface ConsejosGeneralesItem {
  consejos_generales: string;
}

type FeedbackData = {
  [key: string]: FeedbackItem | ConsejosGeneralesItem;
};

@Component({
  selector: 'app-respuesta',
  templateUrl: './respuesta.component.html',
  styleUrl: './respuesta.component.css'
})
export class RespuestaComponent{

  feedbackData: FeedbackData ;

/*   prompt: any = {
    uso_tecnicas_marketing: { puntuacion: 8, explicacion: "Buen uso de técnicas de marketing" },
    profesionalismo: { puntuacion: 9, explicacion: "Muy profesional en su trato" },
    caracter: { puntuacion: 7, explicacion: "Carácter agradable y amigable" },
    atencion_cliente: { puntuacion: 9, explicacion: "Excelente atención al cliente" },
    conocimiento_producto: { puntuacion: 8, explicacion: "Conocimiento profundo del producto" },
    reaccion_facial: { puntuacion: 6, explicacion: "Reacciones faciales poco expresivas" },
    consejos_generales: "Ofreció buenos consejos sobre el producto"
  }; */

  constructor(private openaiService: OpenaiService) {
    const feedbackJsonText = `{\n` +
    `  "uso_tecnicas_marketing": {\n` +
    `    "puntuacion": 0,\n` +
    `    "explicacion": ""\n` +
    `  },\n` +
    `  "profesionalismo": {\n` +
    `    "puntuacion": 0,\n` +
    `    "explicacion": ""\n` +
    `  },\n` +
    `  "caracter": {\n` +
    `    "puntuacion": 0,\n` +
    `    "explicacion": ""\n` +
    `  },\n` +
    `  "atencion_cliente": {\n` +
    `    "puntuacion": 0,\n` +
    `    "explicacion": ""\n` +
    `  },\n` +
    `  "conocimiento_producto": {\n` +
    `    "puntuacion": 0,\n` +
    `    "explicacion": ""\n` +
    `  },\n` +
    `  "reaccion_facial": {\n` +
    `    "puntuacion": 0,\n` +
    `    "explicacion": ""\n` +
    `  },\n` +
    `  "consejos_generales": ""\n` +
    `}`;

    this.feedbackData = JSON.parse(feedbackJsonText);

  }

  async evaluateVendedor() {
    try {
      const response = await this.openaiService.evaluate();
      console.log('Respuesta de evaluación:', response);
      // Aquí puedes manejar la respuesta del servidor como desees
    } catch (error) {
      console.error('Error al evaluar al vendedor:', error);
      // Aquí puedes manejar los errores de la solicitud
    }
  }

  objectKeys(): string[] {
    return Object.keys(this.feedbackData);
  }

  isFeedbackItem(item: any): item is FeedbackItem {
    return 'puntuacion' in item && 'explicacion' in item;
  }
}