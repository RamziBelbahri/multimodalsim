import { TestBed } from '@angular/core/testing';

import { MenuNotifierService } from './menu-notifier.service';

describe('MenuNotifierService', () => {
	let service: MenuNotifierService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(MenuNotifierService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
