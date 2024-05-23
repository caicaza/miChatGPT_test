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

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    AssistantConfigComponent,
    ChattestComponent,
    SpeechToTextComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,

    RouterModule.forRoot([
      { path: 'ConfigurarAsistente', component: AssistantConfigComponent },
      { path: 'chat', component: ChatComponent },
      { path: 'recogn', component: SpeechToTextComponent },

      
    ]),

  ],
  
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
