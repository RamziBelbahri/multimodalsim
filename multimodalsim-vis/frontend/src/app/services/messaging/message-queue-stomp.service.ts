import { Stomp, CompatClient, IMessage } from '@stomp/stompjs';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { EntityDataHandlerService } from '../entity-data-handler/entity-data-handler.service';
import {ConnectionCredentials} from './connection-constants';

// uses STOMP with active MQ
export class MessageQueueStompService {
	// public socketAddress:string;
	public static client:CompatClient;
	public static service:MessageQueueStompService;
	public static readonly DURATION_WAIT_NEXT = 'DURATION_WAIT_NEXT';

	// note: static is needed so that there the callbacks can work
	constructor(private entityDataHandlerService:EntityDataHandlerService, socketAddress:string=ConnectionCredentials.WEBSOCKET, debug=true) {
		if(MessageQueueStompService.service) {
			return MessageQueueStompService.service;
		}
		MessageQueueStompService.client = Stomp.client(socketAddress, ConnectionCredentials.PROTOCOLS);
		if(!debug){
			MessageQueueStompService.client.debug = function() {return;};
		}
		MessageQueueStompService.client.connect(ConnectionCredentials.USERNAME,ConnectionCredentials.PASSWORD,this.onConnect, this.onError);
		MessageQueueStompService.service = this;
		return this;
	}
	private onReceivingInfo = (msg:IMessage) => {
		const p = document.getElementById('received-text');
		if(p) {
			p.innerText = JSON.stringify(msg.body);
		}
	}
	private onConnect = () => {
		MessageQueueStompService.client.subscribe(ConnectionCredentials.INFO_QUEUE, this.onReceivingInfo);
		MessageQueueStompService.client.subscribe(ConnectionCredentials.EVENT_QUEUE, this.onReceivingEvent);
		MessageQueueStompService.client.subscribe(ConnectionCredentials.EVENTS_OBSERVATION_QUEUE, this.onReceivingEventObservation);
		// MessageQueueStompService.client.subscribe(ConnectionCredentials.TRIPS_QUEUE, this.onReceivingTripEvent);
		// MessageQueueStompService.client.subscribe(ConnectionCredentials.VEHICLE_QUEUE, this.onReceivingVehicleEvent);
		MessageQueueStompService.client.subscribe(ConnectionCredentials.ENTITY_EVENTS_QUEUE, this.onReceivingEntityEvent);
	}
	private onError = (err:IMessage) => {
		console.log(err.body);
	}

	private onReceivingEvent = (msg:IMessage) => {
		const p = document.getElementById('received-text');
		if(p) {
			try {
				p.innerText = JSON.stringify(JSON.parse(msg.body),undefined, 2);
			} catch {
				p.innerText = msg.body;
				console.log(msg.body);
			}
		}
	}

	private onReceivingEventObservation = (msg:IMessage) => {
		const p = document.getElementById('received-text');
		if(p) {
			try {
				p.innerText = JSON.stringify(JSON.parse(msg.body),undefined, 2);
			} catch {
				p.innerText = msg.body;
				console.log(msg.body);
			}
		}
	}

	// private onReceivingTripEvent = (msg:IMessage) => {
	// 	const p = document.getElementById('received-text');
	// 	if(p) {
	// 		try {
	// 			p.innerText = JSON.stringify(JSON.parse(msg.body),undefined, 2);
	// 		} catch {
	// 			p.innerText = msg.body;
	// 			console.log('==========================================');
	// 			console.log(msg.body);
	// 		}
	// 	}
	// }

	// private onReceivingVehicleEvent = (msg:IMessage) => {
	// 	const p = document.getElementById('received-text');
	// 	if(p) {
	// 		try {
	// 			p.innerText = JSON.stringify(JSON.parse(msg.body),undefined, 2);
	// 		} catch {
	// 			p.innerText = msg.body;
	// 			console.log('==========================================');
	// 			console.log(msg.body);
	// 		}
	// 	}
	// }

	private onReceivingEntityEvent = (msg:IMessage) => {
		console.log(msg.body == 'SIMULATION_COMPLETED')
		console.log(msg.body === 'SIMULATION_COMPLETED')
		if(msg.body === ConnectionCredentials.SIMULATION_COMPLETED) {
			console.log("================================", msg.body);
			this.entityDataHandlerService.simulationCompleted = true;
			return;
		}
		if(msg.body === 'None') {
			console.log(msg.body);
			return;
		}
		const event = JSON.parse(msg.body)
		var entityEvent: PassengerEvent | VehicleEvent;
		if(event['event_type'] == 'PASSENGER') {
			entityEvent = new PassengerEvent(
				event['id'],
				event['time'],
				event['status'],
				event['assigned_vehicle'],
				event['current_location'],
				event['previous_legs'],
				event['current_leg'],
				event['next_legs'],
				MessageQueueStompService.DURATION_WAIT_NEXT
			)
			this.entityDataHandlerService.passengerEvents.push(entityEvent);
		} else {
			entityEvent = new VehicleEvent(
				event['id'],
				event['time'],
				event['status'],
				event['previous_stops'],
				event['current_stop'],
				event['next_stops'],
				event['assigned_legs'],
				event['onboard_legs'],
				event['alighted_legs'],
				event['cumulative_distance'],
				event['stop_lon'],
				event['stop_lat'],
				MessageQueueStompService.DURATION_WAIT_NEXT
			)
			this.entityDataHandlerService.vehicleEvents.push(entityEvent);
		}
		this.entityDataHandlerService.combined.push(entityEvent);
		this.entityDataHandlerService.eventQueue.enqueue(entityEvent);
	}

	getClient():CompatClient {
		return MessageQueueStompService.client;
	}
}
