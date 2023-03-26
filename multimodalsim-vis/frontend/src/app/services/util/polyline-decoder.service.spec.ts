import { TestBed } from '@angular/core/testing';

import { PolylineDecoderService } from './polyline-decoder.service';

describe('PolylineDecoderService', () => {
	let service: PolylineDecoderService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(PolylineDecoderService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
