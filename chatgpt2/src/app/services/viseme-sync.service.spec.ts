import { TestBed } from '@angular/core/testing';

import { VisemeSyncService } from './viseme-sync.service';

describe('VisemeSyncService', () => {
  let service: VisemeSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VisemeSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
