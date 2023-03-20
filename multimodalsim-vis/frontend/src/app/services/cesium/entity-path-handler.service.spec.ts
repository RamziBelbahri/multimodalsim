import { TestBed } from '@angular/core/testing';

import { EntityPathHandlerService } from './entity-path-handler.service';

describe('EntityLabelHandlerService', () => {
	let service: EntityPathHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(EntityPathHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
