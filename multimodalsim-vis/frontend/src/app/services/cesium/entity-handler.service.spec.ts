import { TestBed } from '@angular/core/testing';

import { EntityHandlerService } from './entity-handler.service';

describe('EntityHandlerService', () => {
	let service: EntityHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(EntityHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
