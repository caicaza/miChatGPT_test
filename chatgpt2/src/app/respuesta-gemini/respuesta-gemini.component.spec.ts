import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespuestaGeminiComponent } from './respuesta-gemini.component';

describe('RespuestaGeminiComponent', () => {
  let component: RespuestaGeminiComponent;
  let fixture: ComponentFixture<RespuestaGeminiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RespuestaGeminiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RespuestaGeminiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
