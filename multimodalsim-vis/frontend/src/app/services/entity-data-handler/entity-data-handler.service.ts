import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { BusEvent } from 'src/app/classes/data-classes/bus-class/bus-event';
import { EntityEvent } from 'src/app/classes/data-classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { getTime } from 'src/app/helpers/parsers';
import { EntityPositionHandlerService } from '../cesium/entity-position-handler.service';
import  PriorityQueue  from 'priority-queue-typescript';

@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	private busEvents: PriorityQueue<BusEvent>;
	private passengerEvents: PriorityQueue<PassengerEvent>;
	private combined: PriorityQueue<EntityEvent>;
	private eventObservations: [];

	private busDrawing = '🚍';
	private passengerDrawing = '🚶🏼';

	constructor(private entityPositionHandlerService: EntityPositionHandlerService) {
		this.busEvents = new PriorityQueue<BusEvent>(100, function(left:BusEvent, right:BusEvent) {
			return (new Date(right.time)).getTime() - (new Date(left.time)).getTime();
		});
		this.passengerEvents = new PriorityQueue<PassengerEvent>(100, function(left:PassengerEvent, right:PassengerEvent) {
			return (new Date(right.time)).getTime() - (new Date(left.time)).getTime();
		});
		this.combined = new PriorityQueue<EntityEvent>(100, function(left:EntityEvent, right:EntityEvent) {
			return (new Date(right.time)).getTime() - (new Date(left.time)).getTime();
		});
		this.eventObservations = [];
	}

	public getBusEvents(): PriorityQueue<BusEvent> {
		return this.busEvents;
	}

	public setBusData(busEvents: BusEvent[]): void {
		for(const busEvent of busEvents) {
			this.busEvents.add(busEvent);
		}
	}

	public setPassengerData(passengerEvents: PassengerEvent[]): void {
		for(const passengerEvent of passengerEvents) {
			this.passengerEvents.add(passengerEvent);
		}
	}

	public setEventObservations(eventObservations: []): void {
		this.eventObservations = eventObservations;
	}

	public getEventObservations(): [] {
		return this.eventObservations;
	}

	public getCombinedEvents(): PriorityQueue<EntityEvent> {
		return this.combined;
	}

	public combinePassengerAndBusEvents(): void {
		for(const busEvent of this.busEvents) {
			this.combined.add(busEvent);
		}
		for(const passengerEvent of this.passengerEvents) {
			this.combined.add(passengerEvent);
		}
	}

	async runVehiculeSimulation(viewer: Viewer, eventsAmount?: number): Promise<void> {
		eventsAmount ? this.runPartialSimulation(viewer, eventsAmount) : this.runFullSimulation(viewer);
	}

	private async runFullSimulation(viewer: Viewer): Promise<void> {
		let previousTime = getTime(this.busEvents.peek()?.time);
		while(! this.combined.empty()) {
			const event:EntityEvent|null = this.combined.poll();
			if (event && event.eventType == 'BUS') {
				await this.entityPositionHandlerService.loadBus(viewer, event as BusEvent, previousTime);
			} else if (event && event.eventType == 'PASSENGER') {
				await this.entityPositionHandlerService.loadPassenger(viewer, event as PassengerEvent, previousTime);
			}
			if(event) {
				previousTime = getTime(event.time);
			}
		}
	}

	//for demo purposes only
	private async runPartialSimulation(viewer: Viewer, eventsAmount: number): Promise<void> {
		let previousTime = getTime(this.getCombinedEvents().peek()?.time);
		eventsAmount = Math.min(eventsAmount, this.busEvents.size());
		let eventCount = 0;
		while (!this.combined.empty() && eventCount < eventsAmount) {
			const event = this.combined.poll();

			if (event && event.eventType == 'BUS') {
				await this.entityPositionHandlerService.loadBus(viewer, event as BusEvent, previousTime);
			} else if (event && event.eventType == 'PASSENGER') {
				await this.entityPositionHandlerService.loadPassenger(viewer, event as PassengerEvent, previousTime);
			}
			if(event) {
				previousTime = getTime(event.time);
				eventCount ++;
			}
		}
	}
}
