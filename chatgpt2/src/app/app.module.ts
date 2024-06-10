import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';



import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChatComponent } from './chat/chat.component';
import { AssistantConfigComponent } from './assistant-config/assistant-config.component';
import { RouterModule } from '@angular/router';
import { ChattestComponent } from './chattest/chattest.component';
import { SpeechToTextComponent } from './speech-to-text/speech-to-text.component';
import { VoiceRecognitionService } from './services/voice-recognition.service';
import { CaptureCameraComponent } from './capture-camera/capture-camera.component';

import { WebcamModule } from 'ngx-webcam';
import { VisemeSyncComponent } from './viseme-sync/viseme-sync.component';
import { InstruccionesComponent } from './instrucciones/instrucciones.component';
import { RespuestaComponent } from './respuesta/respuesta.component';
import { ChatGeminiComponent } from './chat-gemini/chat-gemini.component';
import { CaptureCameraGeminiComponent } from './capture-camera-gemini/capture-camera-gemini.component';
import { RespuestaGeminiComponent } from './respuesta-gemini/respuesta-gemini.component';


@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    AssistantConfigComponent,
    ChattestComponent,
    SpeechToTextComponent,
    CaptureCameraComponent,
    VisemeSyncComponent,
    InstruccionesComponent,
    RespuestaComponent,
    ChatGeminiComponent,
    CaptureCameraGeminiComponent,
    RespuestaGeminiComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,

    WebcamModule,

    RouterModule.forRoot([
      { path: 'ConfigurarAsistente', component: AssistantConfigComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'recogn', component: SpeechToTextComponent },
      { path: 'camara', component: CaptureCameraComponent },
      { path: 'viseme', component: VisemeSyncComponent }, 
      { path: 'respuesta', component: RespuestaComponent },     
      { path: 'camaraGemini', component: CaptureCameraGeminiComponent },      
    ]),

  ],
  
  providers: [VoiceRecognitionService],
  bootstrap: [AppComponent]
})
export class AppModule { }
