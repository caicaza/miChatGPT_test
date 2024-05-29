import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisemeSyncComponent } from './viseme-sync.component';

describe('VisemeSyncComponent', () => {
  let component: VisemeSyncComponent;
  let fixture: ComponentFixture<VisemeSyncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VisemeSyncComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VisemeSyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
