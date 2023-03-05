import { TestBed } from '@angular/core/testing';

import { RealtimePositionHandlerService } from './realtime-position-handler.service';

describe('RealtimePositionHandlerService', () => {
  let service: RealtimePositionHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RealtimePositionHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
