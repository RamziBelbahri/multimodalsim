import { Stomp, CompatClient, IMessage } from '@stomp/stompjs'
import {ConnectionCredentials} from './connection-constants'

// uses STOMP with active MQ
export class MessageQueueStompService {
	// public socketAddress:string;
	public static client:CompatClient;
	public static service:MessageQueueStompService;

	// note: static is needed so that there the callbacks can work
	constructor(socketAddress:string=ConnectionCredentials.WEBSOCKET, debug:boolean=true) {
		if(MessageQueueStompService.service) {
			return MessageQueueStompService.service;
		}
		MessageQueueStompService.client = Stomp.client(socketAddress, ConnectionCredentials.PROTOCOLS);
		if(!debug){
			MessageQueueStompService.client.debug = function() {};
		}
		MessageQueueStompService.service = this;
		return this;
	}

	getClient():CompatClient {
		return MessageQueueStompService.client;
	}
}
