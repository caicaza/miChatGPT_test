import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureCameraGeminiComponent } from './capture-camera-gemini.component';

describe('CaptureCameraGeminiComponent', () => {
  let component: CaptureCameraGeminiComponent;
  let fixture: ComponentFixture<CaptureCameraGeminiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaptureCameraGeminiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CaptureCameraGeminiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
