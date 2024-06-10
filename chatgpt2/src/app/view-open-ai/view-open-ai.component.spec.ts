import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOpenAIComponent } from './view-open-ai.component';

describe('ViewOpenAIComponent', () => {
  let component: ViewOpenAIComponent;
  let fixture: ComponentFixture<ViewOpenAIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewOpenAIComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewOpenAIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
