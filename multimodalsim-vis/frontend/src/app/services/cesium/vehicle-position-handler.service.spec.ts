import { TestBed } from '@angular/core/testing';

import { VehiclePositionHandlerService } from './vehicle-position-handler.service';

describe('VehiclePositionHandlerService', () => {
	let service: VehiclePositionHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(VehiclePositionHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
