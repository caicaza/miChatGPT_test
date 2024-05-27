import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureCameraComponent } from './capture-camera.component';

describe('CaptureCameraComponent', () => {
  let component: CaptureCameraComponent;
  let fixture: ComponentFixture<CaptureCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CaptureCameraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CaptureCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
