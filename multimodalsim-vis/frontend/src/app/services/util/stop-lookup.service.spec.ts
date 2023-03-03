import { TestBed } from '@angular/core/testing';

import { StopLookupService } from './stop-lookup.service';

describe('StopInterpreterService', () => {
	let service: StopLookupService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(StopLookupService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
