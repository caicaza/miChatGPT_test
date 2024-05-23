import { TestBed } from '@angular/core/testing';

import { OpenAiChatService } from './open-ai-chat.service';

describe('OpenAiChatService', () => {
  let service: OpenAiChatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpenAiChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
