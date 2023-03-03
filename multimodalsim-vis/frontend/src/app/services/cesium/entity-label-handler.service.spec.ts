import { TestBed } from '@angular/core/testing';

import { EntityLabelHandlerService } from './entity-label-handler.service';

describe('EntityLabelHandlerService', () => {
	let service: EntityLabelHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(EntityLabelHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
