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
import { AppModule } from 'src/app/app.module';
import { EventObservation } from 'src/app/classes/data-classes/event-observation/event-observation';

@Injectable({
	providedIn: 'root',
})
export class MessageQueueStompService {
	// Évènement d'une durée constante nulle
	private static readonly ALWAYS_ZERO_DURATION: Set<string> = new Set([PassengersStatus.RELEASE, PassengersStatus.COMPLETE, VehicleStatus.RELEASE, VehicleStatus.COMPLETE]);
	private static readonly USE_NEXT_STOP: Set<string> = new Set([VehicleStatus.ENROUTE]);
	public static readonly DURATION_WAIT_NEXT = 'DURATION_WAIT_NEXT';

	public static client: CompatClient;
	public static service: MessageQueueStompService;
	private nLogs = 0;
	private currentTimeStampEventLookup: Map<string, EntityEvent[]> = new Map<string, EntityEvent[]>();
	private nextTimeStampEventLookup: Map<string, EntityEvent[]> = new Map<string, EntityEvent[]>();
	private currentTimeStamp: number | undefined;
	private nextTimeStamp: number | undefined;
	private firstEntiyEventArrived = false;

	private static readonly USE_CURRENT_STOP: Set<string> = new Set([
		PassengersStatus.ASSIGNED,
		PassengersStatus.READY,
		PassengersStatus.ONBOARD,
		VehicleStatus.ALIGHTING,
		VehicleStatus.BOARDING,
		VehicleStatus.IDLE,
	]);

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
		MessageQueueStompService.client.subscribe(ConnectionCredentials.EVENTS_OBSERVATION_QUEUE, this.onReceivingEventObservation);
		MessageQueueStompService.client.subscribe(ConnectionCredentials.ENTITY_EVENTS_QUEUE, this.onReceivingEntityEvent);
	};

	private onError = (err: IMessage) => {
		console.log(err.body);
	};

	private onReceivingInfo = (msg: IMessage) => {
		const container = document.getElementById('received-text-holder') as HTMLDivElement;
		if (this.nLogs > 100) {
			for (const p of Array.from(container.childNodes)) container.removeChild(p);
			this.nLogs = 0;
		}
		const newMessage = document.createElement('p');
		newMessage.innerText = '========================' + new Date().toLocaleTimeString() + '========================' + '\n' + msg.body + '\n';
		container.appendChild(newMessage);
		container.scrollTop = newMessage.offsetTop;
		this.nLogs++;
	};

	private onReceivingEventObservation = (msg: IMessage) => {
		const observation = JSON.parse(msg.body);
		AppModule.injector
			.get(EntityDataHandlerService)
			.getEventObservations()
			.push(new EventObservation(Number(observation['index']), observation['name'], Number(observation['priority']), observation['time']));
	};

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

		// L'évènement est traiter en tant que JSON
		const eventJson = JSON.parse(msg.body);
		let entityEvent: PassengerEvent | VehicleEvent = this.eventJSONToObject(eventJson);

		let realtimePolyline: RealTimePolyline | undefined;
		const polylinesJSON = eventJson['polylines'];

		if (polylinesJSON && !this.entityDataHandlerService.realtimePolylineLookup.has(entityEvent.id) && entityEvent.eventType == EventType.VEHICLE) {
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

		const firstTimeNextTimeStamp = this.currentTimeStamp != undefined && new Date(entityEvent.time).getTime() > new Date(this.currentTimeStamp).getTime() && this.nextTimeStamp == undefined;

		const nextTimestampOver = this.nextTimeStamp != undefined ? new Date(entityEvent.time).getTime() > new Date(this.nextTimeStamp).getTime() : false;

		if (this.currentTimeStamp == undefined) {
			this.currentTimeStamp = entityEvent.time;
		}
		// Le prochain temps peut seulement être fixé si le temps courant est fixé
		if (firstTimeNextTimeStamp) {
			this.nextTimeStamp = entityEvent.time;
		}

		// L'évènement arrive au temps courant
		if (entityEvent.time == this.currentTimeStamp) {
			if (!this.currentTimeStampEventLookup.has(entityEvent.id)) {
				this.currentTimeStampEventLookup.set(entityEvent.id, [entityEvent]);
			} else {
				this.currentTimeStampEventLookup.get(entityEvent.id)?.push(entityEvent);
			}
		}

		// L'évènement arrive au prochain temps
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
			if (value == undefined) continue;

			const toSend: EntityEvent[] = [];
			if (value.length > 1) {
				for (let i = 0; i < value.length - 1; i++) {
					// Si deux évènements arrivent au même timestamp, leur durée est nulle
					value[i].duration = '0';
					toSend.push(value[i]);
				}

				this.currentTimeStampEventLookup.set(key, [value[value.length - 1]]);
			}

			const tmp_currentEvent = this.currentTimeStampEventLookup.get(key);
			const currentEvent = tmp_currentEvent ? tmp_currentEvent[0] : undefined;

			if (currentEvent && this.nextTimeStampEventLookup.has(currentEvent.id)) {
				const tmp_nextEvent = this.nextTimeStampEventLookup.get(currentEvent.id);
				const nextEvent = tmp_nextEvent ? tmp_nextEvent[0] : undefined;
				if (currentEvent && nextEvent) {
					currentEvent.duration = (nextEvent.time - currentEvent.time).toString();
					toSend.push(currentEvent);
					this.currentTimeStampEventLookup.delete(key);
				}
			} else if (!this.nextTimeStampEventLookup.has(key) && currentEvent) {
				if (currentEvent && MessageQueueStompService.ALWAYS_ZERO_DURATION.has(currentEvent.status)) {
					currentEvent.duration = '0';
					toSend.push(currentEvent);
				} else if (MessageQueueStompService.USE_CURRENT_STOP.has(currentEvent.status)) {
					const createdEvent = currentEvent.eventType == 'PASSENGER' ? ({ ...currentEvent } as PassengerEvent) : { ...(currentEvent as VehicleEvent) };
					createdEvent.status = createdEvent.status + FlowControl.FRONTEND_EVENT;

					if (this.nextTimeStamp) {
						createdEvent.time = this.nextTimeStamp;
					}

					this.nextTimeStampEventLookup.set(currentEvent.id, [createdEvent]);
					currentEvent.duration = (createdEvent.time - currentEvent.time).toString();
					toSend.push(currentEvent);
				} else if (MessageQueueStompService.USE_NEXT_STOP.has(currentEvent.status)) {
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
