import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authredirectGuard } from './authredirect.guard';

describe('authredirectGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authredirectGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
