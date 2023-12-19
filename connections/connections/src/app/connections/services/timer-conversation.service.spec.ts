import { TestBed } from '@angular/core/testing';

import { TimerConversationService } from './services/timer-conversation.service';

describe('TimerConversationService', () => {
  let service: TimerConversationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimerConversationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
