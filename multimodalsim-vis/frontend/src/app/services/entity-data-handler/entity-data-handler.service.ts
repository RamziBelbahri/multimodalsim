import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { BusEvent } from 'src/app/classes/data-classes/bus-class/bus-event';
import { EntityEvent } from 'src/app/classes/data-classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { getTime } from 'src/app/helpers/parsers';
import { BusPositionHandlerService } from '../cesium/bus-position-handler.service';
import { EntityPositionHandlerService } from '../cesium/entity-position-handler.service';
import { DateParserService } from '../util/date-parser.service';

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

	constructor(private entityPositionHandlerService: EntityPositionHandlerService, private dateParser: DateParserService, private busHandler: BusPositionHandlerService) {
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

	public setEventObservations(eventObservations: []): void {
		this.eventObservations = eventObservations;
	}

	public getEventObservations(): [] {
		return this.eventObservations;
	}

	public getCombinedEvents(): EntityEvent[] {
		return this.combined;
	}

	public combinePassengerAndBusEvents(): void {
		const vehicles: any = this.busEvents.map((e) => ({ ...e }));
		const trips: any = this.passengerEvents.map((e) => ({ ...e }));
		const vehiclesAndTrips = vehicles.concat(trips);
		vehiclesAndTrips.sort((firstEvent: any, secondEvent: any) => {
			const first_time: number = Date.parse(firstEvent.time);
			const second_time: number = Date.parse(secondEvent.time);
			if (first_time > second_time) return 1;
			if (first_time < second_time) return -1;
			return 0;
		});
		this.combined = vehiclesAndTrips;
	}

	async runVehiculeSimulation(viewer: Viewer, eventsAmount?: number): Promise<void> {
		const start = this.dateParser.parseTimeFromString(this.combined[0].time);
		const end = this.dateParser.parseTimeFromString(this.combined[this.combined.length - 1].time);

		viewer.clock.startTime = start.clone();
		viewer.clock.stopTime = end.clone();
		viewer.clock.currentTime = start.clone();
		viewer.timeline.zoomTo(start, end);

		this.testEntityRealTime(viewer);
		//eventsAmount ? this.runPartialSimulation(viewer, eventsAmount) : this.runFullSimulation(viewer);
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
		eventsAmount = Math.min(eventsAmount, this.busEvents.length);
		for (let i = 0; i < eventsAmount; i++) {
			const event = this.combined[i];

			if (event && event.eventType == 'BUS') {
				this.busHandler.compileEvents(event as BusEvent);
			} else if (event && event.eventType == 'PASSENGER') {
				// TODO
			}
		}

		this.busHandler.loadSpawnEvents(viewer);
	}

	private async testEntityRealTime(viewer: Viewer): Promise<void> {
		await this.busHandler.testEntityRealTime(viewer);
	}
}
