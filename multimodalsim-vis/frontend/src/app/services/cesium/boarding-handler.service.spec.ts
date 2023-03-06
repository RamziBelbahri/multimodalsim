import { TestBed } from '@angular/core/testing';

import { BoardingHandlerService } from './boarding-handler.service';

describe('BoardingHandlerService', () => {
	let service: BoardingHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(BoardingHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
