import { Stomp, CompatClient, IMessage } from '@stomp/stompjs';
import { EntityEvent } from 'src/app/classes/data-classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { EntityDataHandlerService } from '../entity-data-handler/entity-data-handler.service';
import { DateParserService } from '../util/date-parser.service';
import {ConnectionCredentials} from './connection-constants';
import { Queue } from 'queue-typescript';
import { VehicleStatus } from 'src/app/classes/data-classes/vehicle-class/vehicle-status';
import { PassengersStatus } from 'src/app/classes/data-classes/passenger-event/passengers-status';
import { FlowControl } from '../entity-data-handler/flow-control';
var LinkedList = require('dbly-linked-list')

// uses STOMP with active MQ
export class MessageQueueStompService {
	public static client:CompatClient;
	public static service:MessageQueueStompService;
	public static readonly DURATION_WAIT_NEXT = 'DURATION_WAIT_NEXT';

	// probably gonna have to replace this one
	private eventLookup:Map<string, EntityEvent> = new Map<string, EntityEvent>();

	private eventQueue = new LinkedList();

	private dateParserService:DateParserService = new DateParserService();
	// note: static is needed so that there the callbacks can work
	constructor(private entityDataHandlerService:EntityDataHandlerService,
		socketAddress:string=ConnectionCredentials.WEBSOCKET,
		debug=false
	) {
		if(MessageQueueStompService.service) {
			return MessageQueueStompService.service;
		}
		MessageQueueStompService.client = Stomp.client(socketAddress, ConnectionCredentials.PROTOCOLS);
		if(!debug){
			MessageQueueStompService.client.debug = function() {return;};
		}
		MessageQueueStompService.client.connect(ConnectionCredentials.USERNAME,ConnectionCredentials.PASSWORD,this.onConnect, this.onError);
		MessageQueueStompService.service = this;
	}
	private onReceivingInfo = (msg:IMessage) => {
		const p = document.getElementById('received-text');
		if(p) {
			p.innerText = JSON.stringify(Date.now() + ':\n' + msg.body);
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
		const receivedText = document.getElementById('received-text');
		if(receivedText) {
			try {
				receivedText.innerText = Date.now() + ':\n' + JSON.stringify(JSON.parse(msg.body),undefined, 2);
			} catch {
				receivedText.innerText = msg.body;
				console.log(msg.body);
			}
		}
	}

	private onReceivingEventObservation = (msg:IMessage) => {
		const receivedText = document.getElementById('received-text');
		if(receivedText) {
			try {
				receivedText.innerText = Date.now() + ':\n' + JSON.stringify(JSON.parse(msg.body),undefined, 2);
			} catch {
				receivedText.innerText = msg.body;
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

	// private sendPreviousEventToSimulator = (entityEvent:EntityEvent) => {
		// const eventType:string = entityEvent.eventType;
		// if(this.eventLookup.has(entityEvent.id)) {
		// const previousEvent = eventType == 'PASSENGER' ?
		// 	this.eventLookup.get(entityEvent.id) as PassengerEvent :
		// 	this.eventLookup.get(entityEvent.id) as VehicleEvent;

		// previousEvent.duration = this.dateParserService.substractDateString(entityEvent.time, previousEvent.time);
		
		// // TODO make it insert at the right place
		// eventType == 'PASSENGER' ?
		// 	this.entityDataHandlerService.passengerEvents.push(previousEvent as PassengerEvent) :
		// 	this.entityDataHandlerService.vehicleEvents.push(previousEvent as VehicleEvent);
		
		// this.eventLookup.set(previousEvent.id, entityEvent);
		// this.entityDataHandlerService.combined.push(previousEvent);
		// this.entityDataHandlerService.pauseEventEmitter.emit(FlowControl.ON_NEW_EVENTS);
		// console.log("emitted signal new event!")
		// this.entityDataHandlerService.eventQueue.enqueue(previousEvent);
		// } else {
		// 	this.eventLookup.set(entityEvent.id, entityEvent);
		// }
		// let entityEventToSend:EntityEvent
	// }
	private static I = 0;
	private onReceivingEntityEvent = (msg:IMessage) => {
		if(msg.body === ConnectionCredentials.SIMULATION_COMPLETED) {
			console.log("================================", msg.body);
			this.entityDataHandlerService.simulationCompleted = true;
			const leftOverEntityEvents:Array<EntityEvent> = Array.from(this.eventLookup.values());
			leftOverEntityEvents.sort(
				(a:EntityEvent,	b:EntityEvent) => {
					return Date.parse(a.time) - Date.parse(b.time)
				}
			)
			for(let leftOverEntityEvent of leftOverEntityEvents) {
				leftOverEntityEvent.duration = '0 days 00:00:00';
				this.entityDataHandlerService.combined.push(leftOverEntityEvent);
			}
			this.entityDataHandlerService.pauseEventEmitter.emit(FlowControl.ON_NEW_EVENTS);
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
				// event['duration']
				MessageQueueStompService.DURATION_WAIT_NEXT
			)
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
				// event['duration']
				MessageQueueStompService.DURATION_WAIT_NEXT
			)
		}
		entityEvent.eventType == 'PASSENGER' ?
			this.entityDataHandlerService.passengerEvents.push(entityEvent as PassengerEvent) :
			this.entityDataHandlerService.vehicleEvents.push(entityEvent as VehicleEvent);
		// if (event['duration'] != '0 days 00:00:00')
			// console.log(event['duration'])
		// this.entityDataHandlerService.combined.push(entityEvent);
		this.eventQueue.insert(event);
		if(event['status'] == VehicleStatus.RELEASE 
			|| event['status'] == VehicleStatus.COMPLETE 
			|| event['status'] == PassengersStatus.RELEASE
			|| event['status'] == PassengersStatus.COMPLETE) {
			this.entityDataHandlerService.combined.push(event);
			this.entityDataHandlerService.pauseEventEmitter.emit(FlowControl.ON_NEW_EVENTS);
		}
		else {

			try {
				this.eventQueue.forEach( (waitingEventNode:any) => {
					const waitingEvent = waitingEventNode.getData();
					const sameEntity = waitingEvent.id == event.id;
					const noDuration = waitingEvent.duration == MessageQueueStompService.DURATION_WAIT_NEXT
					if(noDuration)
						console.log(waitingEvent.id, waitingEvent.duration)
					if( sameEntity && noDuration ) {
						waitingEvent.duration = this.dateParserService.substractDateString(event.time, waitingEvent.time);
						this.eventQueue.interruptEnumeration();
					}
				}, false)
				const toSend:EntityEvent[] = [];
				const currentTime = this.eventQueue.getHeadNode().getData().time;
				// console
				this.eventQueue.forEach((waitingEventNode:any) => {
					const waitingEvent = waitingEventNode.getData();
					if(waitingEvent.time == currentTime) {
						toSend.push(waitingEvent);
					} else {
						this.eventQueue.interruptEnumeration();
					}
				}, false)
				if(toSend.length > 0) {
					for(const eventToSend of toSend) {
						this.eventQueue.removeNode(eventToSend);
						this.entityDataHandlerService.combined.push(eventToSend);
						eventToSend.eventType == 'PASSENGER' ? 
							this.entityDataHandlerService.passengerEvents.push(eventToSend as PassengerEvent) :
							this.entityDataHandlerService.vehicleEvents.push(eventToSend as VehicleEvent);

					}
				}
				this.entityDataHandlerService.pauseEventEmitter.emit(FlowControl.ON_NEW_EVENTS);
			} catch(e) {
				console.log(e)
			}
		}

	}

	getClient():CompatClient {
		return MessageQueueStompService.client;
	}
}
