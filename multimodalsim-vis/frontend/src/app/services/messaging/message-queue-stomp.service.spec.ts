import { TestBed } from '@angular/core/testing';

import { MessageQueueStompService } from './message-queue-stomp.service';

describe('MessageQueueStompService', () => {
	let service: MessageQueueStompService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
