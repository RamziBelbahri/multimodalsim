import { TestBed } from '@angular/core/testing';

import { EntityDataHandlerService } from './entity-data-handler.service';

describe('EntityDataHandlerService', () => {
  let service: EntityDataHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntityDataHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
