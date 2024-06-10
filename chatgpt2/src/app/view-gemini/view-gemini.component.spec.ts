import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGeminiComponent } from './view-gemini.component';

describe('ViewGeminiComponent', () => {
  let component: ViewGeminiComponent;
  let fixture: ComponentFixture<ViewGeminiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewGeminiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewGeminiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
