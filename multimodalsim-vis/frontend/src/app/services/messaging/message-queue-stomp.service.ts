import { Stomp, CompatClient, IMessage } from '@stomp/stompjs';
import { EntityEvent } from 'src/app/classes/data-classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { EntityDataHandlerService } from '../entity-data-handler/entity-data-handler.service';
import { ConnectionCredentials } from './connection-constants';
import { VehicleStatus } from 'src/app/classes/data-classes/vehicle-class/vehicle-status';
import { PassengersStatus } from 'src/app/classes/data-classes/passenger-event/passengers-status';
import { FlowControl } from '../entity-data-handler/flow-control';
import { RealTimePolyline } from 'src/app/classes/data-classes/realtime-polyline';
import { EventType } from '../util/event-types';
import { Injectable } from '@angular/core';
const DEBUG = false;
// uses STOMP with active MQ
@Injectable({
	providedIn: 'root',
})
export class MessageQueueStompService {
	public static client: CompatClient;
	public static service: MessageQueueStompService;
	public static readonly DURATION_WAIT_NEXT = 'DURATION_WAIT_NEXT';
	private nLogs = 0;
	/*
	id --> entityEnvents associated with this id
	*/
	private currentTimeStampEventLookup: Map<string, EntityEvent[]> = new Map<string, EntityEvent[]>();
	private nextTimeStampEventLookup: Map<string, EntityEvent[]> = new Map<string, EntityEvent[]>();
	private currentTimeStamp: number | undefined;
	private nextTimeStamp: number | undefined;

	// if the event has these status, make sure that they are still at the same stop
	private static readonly USE_CURRENT_STOP: Set<string> = new Set([
		PassengersStatus.ASSIGNED,
		PassengersStatus.READY,
		PassengersStatus.ONBOARD,
		VehicleStatus.ALIGHTING, // time to departure time
		VehicleStatus.BOARDING, // time to departure time
		VehicleStatus.IDLE, // time to departure time
	]);
	// we know these events have zero duration
	private static readonly ALWAYS_ZERO_DURATION: Set<string> = new Set([PassengersStatus.RELEASE, PassengersStatus.COMPLETE, VehicleStatus.RELEASE, VehicleStatus.COMPLETE]);
	// MOVING --> use the time it takes to get to the next stop
	private static readonly USE_NEXT_STOP: Set<string> = new Set([VehicleStatus.ENROUTE]);
	// private dateParserService:DateParserService = new DateParserService();
	// note: static is needed so that there the callbacks can work
	constructor(private entityDataHandlerService: EntityDataHandlerService) {
		if (MessageQueueStompService.service) {
			return MessageQueueStompService.service;
		}
		MessageQueueStompService.client = Stomp.client(ConnectionCredentials.WEBSOCKET, ConnectionCredentials.PROTOCOLS);
		MessageQueueStompService.client.debug = function () {
			return;
		};
		MessageQueueStompService.client.connect(ConnectionCredentials.USERNAME, ConnectionCredentials.PASSWORD, this.onConnect, this.onError);
		MessageQueueStompService.service = this;
	}

	private onConnect = () => {
		MessageQueueStompService.client.subscribe(ConnectionCredentials.INFO_QUEUE, this.onReceivingInfo);
		// MessageQueueStompService.client.subscribe(ConnectionCredentials.EVENT_QUEUE, this.onReceivingEvent);
		MessageQueueStompService.client.subscribe(ConnectionCredentials.EVENTS_OBSERVATION_QUEUE, this.onReceivingEventObservation);
		MessageQueueStompService.client.subscribe(ConnectionCredentials.ENTITY_EVENTS_QUEUE, this.onReceivingEntityEvent);
	};
	private onError = (err: IMessage) => {
		console.log(err.body);
	};
	private onReceivingEvent = (msg: IMessage) => {
		const receivedText = document.getElementById('received-text');
		if (receivedText) {
			try {
				receivedText.innerText = Date.now() + ':\n' + JSON.stringify(JSON.parse(msg.body), undefined, 2);
			} catch {
				receivedText.innerText = msg.body;
			}
		}
	};

	// for now these are useless
	private onReceivingInfo = (msg: IMessage) => {
		// if(DEBUG) {console.log(msg.body);}

		const container = document.getElementById('received-text-holder') as HTMLDivElement;
		if (this.nLogs > 100) {
			for (const p of Array.from(container.childNodes)) container.removeChild(p);
			this.nLogs = 0;
		}
		const newMessage = document.createElement('p');
		newMessage.innerText = '========================' + '\n' + msg.body + '\n';
		container.appendChild(newMessage);
		// console.log(msg.body);
		this.nLogs++;
	};
	private onReceivingEventObservation = (msg: IMessage) => {
		if (DEBUG) {
			console.log(msg.body);
		}
	};

	// JSON object, you can't know what is will be
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private eventJSONToObject = (eventJson: any): VehicleEvent | PassengerEvent => {
		if (eventJson['event_type'] == 'PASSENGER') {
			return new PassengerEvent(
				eventJson['id'],
				eventJson['time'],
				eventJson['status'],
				eventJson['assigned_vehicle'],
				eventJson['current_location'],
				eventJson['previous_legs'],
				eventJson['current_leg'],
				eventJson['next_legs'],
				eventJson['duration'] == undefined ? MessageQueueStompService.DURATION_WAIT_NEXT : eventJson['duration'],
				true
			);
		} else {
			return new VehicleEvent(
				eventJson['id'],
				eventJson['time'],
				eventJson['status'],
				eventJson['previous_stops'],
				eventJson['current_stop'],
				eventJson['next_stops'],
				eventJson['assigned_legs'],
				eventJson['onboard_legs'],
				eventJson['alighted_legs'],
				eventJson['cumulative_distance'],
				eventJson['stop_lon'],
				eventJson['stop_lat'],
				eventJson['polylines'],
				eventJson['mode'],
				eventJson['duration'] == undefined ? MessageQueueStompService.DURATION_WAIT_NEXT : eventJson['duration'],
				true
			);
		}
	};

	private onReceivingEntityEvent = (msg: IMessage) => {
		if (msg.body === ConnectionCredentials.SIMULATION_COMPLETED) {
			return;
		}
		if (msg.body === 'None') {
			return;
		}
		// 1. event is parsed as JSON
		const eventJson = JSON.parse(msg.body);
		let entityEvent: PassengerEvent | VehicleEvent = this.eventJSONToObject(eventJson);

		let realtimePolyline: RealTimePolyline | undefined;
		const polylinesJSON = eventJson['polylines'];
		if (polylinesJSON && !this.entityDataHandlerService.realtimePolylineLookup.has(entityEvent.id) && entityEvent.eventType == EventType.VEHICLE) {
			// status = release, pretty much guaranteed to have a current stop and a next stop
			realtimePolyline = new RealTimePolyline(polylinesJSON, [(entityEvent as VehicleEvent).current_stop].concat((entityEvent as VehicleEvent).next_stops));
			this.entityDataHandlerService.realtimePolylineLookup.set(entityEvent.id, realtimePolyline);
		}
		realtimePolyline = this.entityDataHandlerService.realtimePolylineLookup.get(entityEvent.id);

		if (realtimePolyline && entityEvent.eventType == EventType.VEHICLE) {
			(entityEvent as VehicleEvent).polylines = realtimePolyline;
			entityEvent = entityEvent as VehicleEvent;
			this.entityDataHandlerService.vehicleStopLookup.set(
				entityEvent.id,
				Number(entityEvent.current_stop) ? entityEvent.current_stop : entityEvent.previous_stops[entityEvent.previous_stops.length - 1]
			);
		}

		entityEvent.eventType == EventType.PASSENGER
			? this.entityDataHandlerService.passengerEvents.push(entityEvent as PassengerEvent)
			: this.entityDataHandlerService.vehicleEvents.push(entityEvent as VehicleEvent);

		const firstTimeNextTimeStamp =
			this.currentTimeStamp != undefined && // current time set
			new Date(entityEvent.time).getTime() > new Date(this.currentTimeStamp).getTime() && // bigger than current time
			this.nextTimeStamp == undefined; // next time stamp not set

		const nextTimestampOver = this.nextTimeStamp != undefined ? new Date(entityEvent.time).getTime() > new Date(this.nextTimeStamp).getTime() : false;

		if (this.currentTimeStamp == undefined) {
			this.currentTimeStamp = entityEvent.time;
		}
		// next timestamp can only be set if current time stamp has already been set
		if (firstTimeNextTimeStamp) {
			this.nextTimeStamp = entityEvent.time;
		}
		// event arrive at current time
		if (entityEvent.time == this.currentTimeStamp) {
			if (!this.currentTimeStampEventLookup.has(entityEvent.id)) {
				// if not already in lookup, add it
				this.currentTimeStampEventLookup.set(entityEvent.id, [entityEvent]);
			} else {
				// else, an event for this bus/passenger already arrived and we append it
				this.currentTimeStampEventLookup.get(entityEvent.id)?.push(entityEvent);
			}
		}
		// if next timestamp, put it in lookup
		if (entityEvent.time == this.nextTimeStamp) {
			if (!this.nextTimeStampEventLookup.has(entityEvent.id)) {
				// if not already in lookup, add it
				this.nextTimeStampEventLookup.set(entityEvent.id, [entityEvent]);
			} else {
				// else, an event for this bus/passenger already arrived and we append it
				this.nextTimeStampEventLookup.get(entityEvent.id)?.push(entityEvent);
			}
		}
		if (nextTimestampOver) {
			// combine
			this.sendCurrentTimeStamp();
			this.currentTimeStamp = this.nextTimeStamp;
			this.nextTimeStamp = entityEvent.time;
			this.currentTimeStampEventLookup = this.nextTimeStampEventLookup;
			this.nextTimeStampEventLookup = new Map<string, EntityEvent[]>();
			this.nextTimeStampEventLookup.set(entityEvent.id, [entityEvent]);
		}
	};

	private sendCurrentTimeStamp = () => {
		for (const key of this.currentTimeStampEventLookup.keys()) {
			const value = this.currentTimeStampEventLookup.get(key);
			// ============================== this is just to make typescript compile ==============================
			if (value == undefined) {
				continue;
			}
			// ============================== this is just to make typescript compile ==============================

			const toSend: EntityEvent[] = [];
			// if there is already the next event in the same timestamp, use the one in current timestamp
			if (value.length > 1) {
				// <---- pretty sure this almost never runs
				// if 2 events for the same entity arrived in the same timestamp, the duration is zero
				for (let i = 0; i < value.length - 1; i++) {
					value[i].duration = '0';
					toSend.push(value[i]);
				}
				// only the last event of each timestamp remains
				this.currentTimeStampEventLookup.set(key, [value[value.length - 1]]);
			}

			const tmp_currentEvent = this.currentTimeStampEventLookup.get(key);
			const currentEvent = tmp_currentEvent ? tmp_currentEvent[0] : undefined;

			// if the next timestamp has this event, use the next timestamp
			if (currentEvent && this.nextTimeStampEventLookup.has(currentEvent.id)) {
				const tmp_nextEvent = this.nextTimeStampEventLookup.get(currentEvent.id);
				const nextEvent = tmp_nextEvent ? tmp_nextEvent[0] : undefined;
				if (currentEvent && nextEvent) {
					// <---------- pretty much guaranteed to be true
					currentEvent.duration = (nextEvent.time - currentEvent.time).toString();
					toSend.push(currentEvent);
					this.currentTimeStampEventLookup.delete(key);
				}
			}
			// if there is no events in the next timestamp, create an event in the next timestamp
			else if (!this.nextTimeStampEventLookup.has(key) && currentEvent) {
				// RELEASE and COMPLETE are guaranteed to have a duration of zero
				if (currentEvent && MessageQueueStompService.ALWAYS_ZERO_DURATION.has(currentEvent.status)) {
					currentEvent.duration = '0';
					toSend.push(currentEvent);
				}
				// RELEASE, COMPLETE: duration is always 0
				// if it's idle, alighting, etc. just duplicate an event with the same status
				// it will look like this:
				// backend  : T = 1: IDLE --------------------------------------------------------------- T = 5: ENROUTE
				// frontend : T = 1: IDLE ------ T = 2: IDLE ------ T = 3: IDLE ------ T = 4: IDLE ------ T = 5: ENROUTE
				else if (MessageQueueStompService.USE_CURRENT_STOP.has(currentEvent.status)) {
					const createdEvent = currentEvent.eventType == 'PASSENGER' ? ({ ...currentEvent } as PassengerEvent) : { ...(currentEvent as VehicleEvent) };
					createdEvent.status = createdEvent.status + FlowControl.FRONTEND_EVENT;
					if (this.nextTimeStamp) {
						createdEvent.time = this.nextTimeStamp;
					}
					// put an artificial event in the next time stamp
					this.nextTimeStampEventLookup.set(currentEvent.id, [createdEvent]);
					currentEvent.duration = (createdEvent.time - currentEvent.time).toString();
					toSend.push(currentEvent);
				}
				// if it's ENROUTE, we can just use the time it takes to get to the next stop since we already have this info
				else if (MessageQueueStompService.USE_NEXT_STOP.has(currentEvent.status)) {
					toSend.push(currentEvent);
				}
			}
			for (const event of toSend) {
				this.entityDataHandlerService.combined.push(event);
			}
		}
		this.entityDataHandlerService.pauseEventEmitter.emit(FlowControl.ON_NEW_EVENTS);
	};

	getClient(): CompatClient {
		return MessageQueueStompService.client;
	}
}
