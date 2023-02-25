import { Stomp, CompatClient, IMessage } from '@stomp/stompjs'
import { EntityDataHandlerService } from '../entity-data-handler/entity-data-handler.service';
import {ConnectionCredentials} from './connection-constants'

// uses STOMP with active MQ
export class MessageQueueStompService {
	// public socketAddress:string;
	public static client:CompatClient;
	public static service:MessageQueueStompService;

	// note: static is needed so that there the callbacks can work
	constructor(private entityDataHandlerService:EntityDataHandlerService, socketAddress:string=ConnectionCredentials.WEBSOCKET, debug:boolean=true) {
		if(MessageQueueStompService.service) {
			return MessageQueueStompService.service;
		}
		MessageQueueStompService.client = Stomp.client(socketAddress, ConnectionCredentials.PROTOCOLS);
		if(!debug){
			MessageQueueStompService.client.debug = function() {};
		}
		MessageQueueStompService.client.connect(ConnectionCredentials.USERNAME,ConnectionCredentials.PASSWORD,this.onConnect, this.onError)
		MessageQueueStompService.service = this;
		return this;
	}
	onConnect() {
		MessageQueueStompService.client.subscribe(ConnectionCredentials.INFO_QUEUE, MessageQueueStompService.onReceivingInfo)
		MessageQueueStompService.client.subscribe(ConnectionCredentials.EVENT_QUEUE, MessageQueueStompService.onReceivingEvent)
		MessageQueueStompService.client.subscribe(ConnectionCredentials.EVENTS_OBSERVATION_QUEUE, MessageQueueStompService.onReceivingEventObservation)
		MessageQueueStompService.client.subscribe(ConnectionCredentials.TRIPS_QUEUE, MessageQueueStompService.onReceivingTripEvent)
		MessageQueueStompService.client.subscribe(ConnectionCredentials.VEHICLE_QUEUE, MessageQueueStompService.onReceivingVehicleEvent)
	}
	onError(err:IMessage){
		console.log(err.body);
	}
	private static onReceivingInfo(msg:IMessage) {
		const p = document.getElementById('received-text');
		if(p) {
			p.innerText = JSON.stringify(msg.body);
		}
	}

	private static onReceivingEvent(msg:IMessage) {
		const p = document.getElementById('received-text');
		if(p) {
			try {
				p.innerText = JSON.stringify(JSON.parse(msg.body),undefined, 2);
			} catch {
				p.innerText = msg.body;
				console.log('==========================================')
				console.log(msg.body)
			}
		}
	}

	private static onReceivingEventObservation(msg:IMessage) {
		const p = document.getElementById('received-text');
		if(p) {
			try {
				p.innerText = JSON.stringify(JSON.parse(msg.body),undefined, 2);
			} catch {
				p.innerText = msg.body;
				console.log('==========================================')
				console.log(msg.body)
			}
		}
	}

	private static onReceivingTripEvent(msg:IMessage) {
		const p = document.getElementById('received-text');
		if(p) {
			try {
				p.innerText = JSON.stringify(JSON.parse(msg.body),undefined, 2);
			} catch {
				p.innerText = msg.body;
				console.log('==========================================')
				console.log(msg.body)
			}
		}
	}

	private static onReceivingVehicleEvent(msg:IMessage) {
		const p = document.getElementById('received-text');
		if(p) {
			try {
				p.innerText = JSON.stringify(JSON.parse(msg.body),undefined, 2);
			} catch {
				p.innerText = msg.body;
				console.log('==========================================')
				console.log(msg.body)
			}
		}
	}

	getClient():CompatClient {
		return MessageQueueStompService.client;
	}
}
