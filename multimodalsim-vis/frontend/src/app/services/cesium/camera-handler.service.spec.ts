import { TestBed } from '@angular/core/testing';

import { CameraHandlerService } from './camera-handler.service';

describe('CameraHandlerService', () => {
	let service: CameraHandlerService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(CameraHandlerService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
