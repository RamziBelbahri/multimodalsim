import { TestBed } from '@angular/core/testing';

import { SimulationParserService } from './simulation-parser.service';

describe('SimulationParserService', () => {
	let service: SimulationParserService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(SimulationParserService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
