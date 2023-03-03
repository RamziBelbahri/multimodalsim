import { TestBed } from '@angular/core/testing';

import { BusPositionHandlerService } from './bus-position-handler.service';

describe('EntityHandlerService', () => {
	let service: BusPositionHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(BusPositionHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
