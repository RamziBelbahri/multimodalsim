import { TestBed } from '@angular/core/testing';

import { EntityPositionHandlerService } from './entity-position-handler.service';

describe('EntityPositionHandlerService', () => {
	let service: EntityPositionHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(EntityPositionHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
