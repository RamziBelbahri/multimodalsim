import { TestBed } from '@angular/core/testing';

import { ViewerSharingService } from './viewer-sharing.service';

describe('ViewerSharingService', () => {
	let service: ViewerSharingService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(ViewerSharingService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
