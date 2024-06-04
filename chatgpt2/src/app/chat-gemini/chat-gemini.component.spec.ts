import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatGeminiComponent } from './chat-gemini.component';

describe('ChatGeminiComponent', () => {
  let component: ChatGeminiComponent;
  let fixture: ComponentFixture<ChatGeminiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatGeminiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatGeminiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
