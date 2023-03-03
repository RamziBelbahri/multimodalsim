import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { EntityEvent } from 'src/app/classes/data-classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { VehiclePositionHandlerService } from '../cesium/vehicle-position-handler.service';
import { PassengerPositionHandlerService } from '../cesium/passenger-position-handler.service';
import { DateParserService } from '../util/date-parser.service';

@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	private vehicleEvents: VehicleEvent[];
	private passengerEvents: PassengerEvent[];
	private combined: EntityEvent[];
	private eventObservations: [];

	constructor(private dateParser: DateParserService, private vehicleHandler: VehiclePositionHandlerService, private passengerHandler: PassengerPositionHandlerService) {
		this.vehicleEvents = [];
		this.passengerEvents = [];
		this.combined = [];
		this.eventObservations = [];
	}

	public getVehicleEvents(): VehicleEvent[] {
		return this.vehicleEvents;
	}

	public setVehicleData(vehicleEvents: VehicleEvent[]): void {
		this.vehicleEvents = vehicleEvents;
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

	public combinePassengerAndVehicleEvents(): void {
		const vehicles: any = this.vehicleEvents.map((e) => ({ ...e }));
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

		if (eventsAmount) {
			this.runPartialSimulation(viewer, eventsAmount);
		}
	}

	//for demo purposes only
	private runPartialSimulation(viewer: Viewer, eventsAmount: number): void {
		eventsAmount = Math.min(eventsAmount, this.vehicleEvents.length);
		for (let i = 0; i < eventsAmount; i++) {
			const event = this.combined[i];

			if (event && event.eventType == 'VEHICLE') {
				this.vehicleHandler.compileEvents(event as VehicleEvent);
			} else if (event && event.eventType == 'PASSENGER') {
				this.passengerHandler.compileEvents(event as PassengerEvent);
			}
		}

		this.vehicleHandler.loadSpawnEvents(viewer);
		this.passengerHandler.loadSpawnEvents(viewer);
	}
}
