import { Component } from '@angular/core';
import { CompatClient } from '@stomp/stompjs';
import { MessageQueueStompService } from 'src/app/services/messaging/message-queue-stomp.service';
import { EntityDataHandlerService } from 'src/app/services/entity-data-handler/entity-data-handler.service';
@Component({
	selector: 'app-debug-receiver-component',
	templateUrl: './debug-receiver-component.component.html',
	styleUrls: ['./debug-receiver-component.component.css'],
})
export class DebugReceiverComponentComponent {
	private static client: CompatClient;
	dragging = false;

	constructor(
		private entityDataHandlerService: EntityDataHandlerService,
		private messageQueueService:MessageQueueStompService
	) {
		DebugReceiverComponentComponent.client = this.messageQueueService.getClient();
	}

	private onExpandCollapse() {
		const button = document.getElementById('open-close-debug');
		if (button && button.innerText == '-') {
			const holder = document.getElementById('received-text-holder');
			if (holder) {
				holder.style.width = '0px';
				holder.style.height = '0px';
				holder.style.right = '2%';
				button.innerText = '+';
			}
		} else if (button && button.innerText == '+') {
			const holder = document.getElementById('received-text-holder');
			if (holder) {
				holder.style.width = '400px';
				holder.style.height = '400px';
				holder.style.right = '0%';
				holder.style.top = '10%';

				button.innerText = '-';
			}
		}
	}

	handleDragStart(): void {
		this.dragging = true;
	}

	handleClick(): void {
		if (this.dragging) {
			this.dragging = false;
			return;
		}

		this.onExpandCollapse();
	}
}
