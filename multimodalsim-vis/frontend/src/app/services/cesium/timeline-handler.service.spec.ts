import { TestBed } from '@angular/core/testing';

import { TimelineHandlerService } from './timeline-handler.service';

describe('TimelineHandlerService', () => {
	let service: TimelineHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(TimelineHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
