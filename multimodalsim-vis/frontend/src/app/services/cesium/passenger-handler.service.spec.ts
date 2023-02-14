import { TestBed } from '@angular/core/testing';

import { PassengerHandlerService } from './passenger-handler.service';

describe('PassengerHandlerService', () => {
	let service: PassengerHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(PassengerHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
