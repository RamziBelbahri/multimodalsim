import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';
import { EntityEvent } from 'src/app/classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/passenger-event/passenger-event';
import { getTime } from 'src/app/helpers/parsers';
import { EntityPositionHandlerService } from '../cesium/entity-position-handler.service';
@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	private busEvents: BusEvent[];
	private passengerEvents: PassengerEvent[];
	private combined: EntityEvent[];
	private eventObservations: [];

	private busDrawing = '🚍';
	private passengerDrawing = '🚶🏼';

	constructor(private entityPositionHandlerService: EntityPositionHandlerService) {
		this.busEvents = [];
		this.passengerEvents = [];
		this.combined = [];
		this.eventObservations = [];
	}

	public getBusEvents(): BusEvent[] {
		return this.busEvents;
	}

	public setBusData(busEvents: BusEvent[]): void {
		this.busEvents = busEvents;
	}

	public setPassengerData(passengerEvents: PassengerEvent[]): void {
		this.passengerEvents = passengerEvents;
	}

	public setEventObservations(eventObservations: []) {
		this.eventObservations = eventObservations;
	}

	public getEventObservations() {
		return this.eventObservations;
	}

	public getCombinedEvents() {
		return this.combined;
	}

	public combinePassengerAndBusEvents(): void {
		const vehicles: any = this.busEvents.map((e) => ({ ...e }));
		const trips: any = this.passengerEvents.map((e) => ({ ...e }));
		const vehiclesAndTrips: any = vehicles.concat(trips);
		vehiclesAndTrips.sort((a: any, b: any) => {
			const a_time: number = Date.parse(a.time);
			const b_time: number = Date.parse(b.time);
			if (a_time > b_time) return 1;
			if (a_time < b_time) return -1;
			return 0;
		});
		this.combined = vehiclesAndTrips;
		console.log('combined:' , this.combined);
	}

	public async runVehiculeSimulation(viewer: Viewer, eventsAmount?: number): Promise<void> {
		console.log(this.passengerEvents);
		eventsAmount ? this.runPartialSimulation(viewer, eventsAmount) : this.runFullSimulation(viewer);
	}

	private async runFullSimulation(viewer: Viewer): Promise<void> {
		let previousTime = getTime(this.getBusEvents()[0].time);
		for (const event of this.busEvents) {
			if (event) {
				await this.entityPositionHandlerService.loadBus(viewer, event, previousTime);
				previousTime = getTime(event.time);
			}
		}
	}

	//for demo purposes only
	private async runPartialSimulation(viewer: Viewer, eventsAmount: number): Promise<void> {
		let previousTime = getTime(this.getCombinedEvents()[0].time);
		eventsAmount = Math.min(eventsAmount, this.busEvents.length);
		for (let i = 0; i < eventsAmount; i++) {
			const event = this.combined[i];

			if (event && event.eventType == 'BUS') {
				await this.entityPositionHandlerService.loadBus(viewer, event as BusEvent, previousTime);
				previousTime = getTime(event.time);
			} else if (event && event.eventType == 'PASSENGER') {
				await this.entityPositionHandlerService.loadPassenger(viewer, event as PassengerEvent, previousTime);
			}
		}
	}
}
