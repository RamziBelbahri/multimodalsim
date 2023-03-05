import { TestBed } from '@angular/core/testing';

import { PassengerPositionHandlerService } from './passenger-position-handler.service';

describe('PassengerPositionHandlerService', () => {
	let service: PassengerPositionHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(PassengerPositionHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
