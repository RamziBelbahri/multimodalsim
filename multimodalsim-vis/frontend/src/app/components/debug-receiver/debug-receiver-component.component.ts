import { Component } from '@angular/core';
import { CompatClient, IMessage } from '@stomp/stompjs';
import { MessageQueueStompService } from 'src/app/services/messaging/message-queue-stomp.service';
import { ConnectionCredentials } from 'src/app/services/messaging/connection-constants';
import { EntityDataHandlerService } from 'src/app/services/entity-data-handler/entity-data-handler.service';
@Component({
	selector: 'app-debug-receiver-component',
	templateUrl: './debug-receiver-component.component.html',
	styleUrls: ['./debug-receiver-component.component.css']
})
export class DebugReceiverComponentComponent {
	private static client:CompatClient;
	constructor(private entityDataHandlerService:EntityDataHandlerService) {
		const service = new MessageQueueStompService(entityDataHandlerService);
		DebugReceiverComponentComponent.client = service.getClient();
		// DebugReceiverComponentComponent.client.connect(ConnectionCredentials.USERNAME,ConnectionCredentials.PASSWORD,this.onConnect, this.onError)
	}
	onExpandCollapse() {
		const button = document.getElementById('open-close-debug');
		if(button && button.innerText == '-') {
			const holder = document.getElementById('received-text-holder')
			if(holder) {
				holder.style.width = '0px'
				holder.style.height = '0px'
				holder.style.right = '2%'
				button.innerText = '+'
			}
		} else if (button && button.innerText == '+') {
			const holder = document.getElementById('received-text-holder')
			if(holder) {
				holder.style.width = '400px'
				holder.style.height = '400px'
				holder.style.right = '0%'
				holder.style.top = '10%'

				button.innerText = '-'
			}
		}
	}
	// onConnect() {
	// 	DebugReceiverComponentComponent.client.subscribe(ConnectionCredentials.INFO_QUEUE, DebugReceiverComponentComponent.onMessage)
	// }
	// onError(err:IMessage){
	// 	console.log(err.body);
	// }
	// private static onMessage(msg:IMessage) {
	// 	const p = document.getElementById('received-text');
	// 	if(p) {
	// 		p.innerText = JSON.stringify(JSON.parse(msg.body), undefined, 2);
	// 	}
	// }
}
