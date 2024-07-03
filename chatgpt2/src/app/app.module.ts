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
import { ViewOpenAIComponent } from './view-open-ai/view-open-ai.component';
import { ViewGeminiComponent } from './view-gemini/view-gemini.component';
import { ThreejsComponent } from './threejs/threejs.component';
import { Chat3dComponent } from './chat3d/chat3d.component';
import { WebSocketService } from './services/web-socket.service';


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
    RespuestaGeminiComponent,
    ViewOpenAIComponent,
    ViewGeminiComponent,
    ThreejsComponent,
    Chat3dComponent
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
      { path: 'openAI', component: ViewOpenAIComponent },
      { path: 'gemini', component: ViewGeminiComponent },    
      { path: 'threejs', component: ThreejsComponent },  
      { path: 'chat3D', component: Chat3dComponent },     
      
    ]),

  ],
  
  providers: [VoiceRecognitionService, WebSocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
