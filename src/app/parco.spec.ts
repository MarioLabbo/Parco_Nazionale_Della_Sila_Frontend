import { TestBed } from '@angular/core/testing';

import { Parco } from './parco';

describe('Parco', () => {
  let service: Parco;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Parco);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
