import { Component } from '@angular/core';
import { CompatClient, IMessage } from '@stomp/stompjs';
import { MessageQueueStompService } from 'src/app/services/messaging/message-queue-stomp.service';
import { ConnectionCredentials } from 'src/app/services/messaging/connection-constants';
@Component({
	selector: 'app-debug-receiver-component',
	templateUrl: './debug-receiver-component.component.html',
	styleUrls: ['./debug-receiver-component.component.css']
})
export class DebugReceiverComponentComponent {
	private static client:CompatClient;
	constructor() {
		const service = new MessageQueueStompService();
		DebugReceiverComponentComponent.client = service.getClient();
		DebugReceiverComponentComponent.client.connect(ConnectionCredentials.USERNAME,ConnectionCredentials.PASSWORD,this.onConnect, this.onError)
	}
	onConnect() {
		DebugReceiverComponentComponent.client.subscribe(ConnectionCredentials.INFO_QUEUE, DebugReceiverComponentComponent.onMessage)
	}
	onError(err:IMessage){
		console.log(err.body);
	}
	private static onMessage(msg:IMessage) {
		const p = document.getElementById('received-text');
		if(p) {
			p.innerText = JSON.stringify(JSON.parse(msg.body), undefined, 2);
		}
	}
}
