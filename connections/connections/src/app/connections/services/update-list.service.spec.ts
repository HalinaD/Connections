import { TestBed } from '@angular/core/testing';

import { UpdateListService } from './services/update-list.service';

describe('UpdateListService', () => {
  let service: UpdateListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UpdateListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
