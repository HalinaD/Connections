import { TestBed } from '@angular/core/testing';

import { ReadTimeService } from './services/read-time.service';

describe('ReadTimeService', () => {
  let service: ReadTimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReadTimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
