import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssistantConfigComponent } from './assistant-config.component';

describe('AssistantConfigComponent', () => {
  let component: AssistantConfigComponent;
  let fixture: ComponentFixture<AssistantConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssistantConfigComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssistantConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
