import { TestBed } from '@angular/core/testing';

import { StopPositionHandlerService } from './stop-position-handler.service';

describe('StopPositionHandlerService', () => {
	let service: StopPositionHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(StopPositionHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
