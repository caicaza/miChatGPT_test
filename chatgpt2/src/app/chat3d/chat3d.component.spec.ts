import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chat3dComponent } from './chat3d.component';

describe('Chat3dComponent', () => {
  let component: Chat3dComponent;
  let fixture: ComponentFixture<Chat3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Chat3dComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Chat3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
