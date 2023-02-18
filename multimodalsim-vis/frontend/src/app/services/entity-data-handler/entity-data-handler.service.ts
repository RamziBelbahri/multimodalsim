import { Injectable } from '@angular/core';
import { Entity, Viewer } from 'cesium';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';
import { EntityEvent } from 'src/app/classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/passenger-event/passenger-event';
import { ZipHandlerComponent } from 'src/app/components/zip-handler/zip-handler.component';
import { getTime } from 'src/app/helpers/parsers';
import { EntityPositionHandlerService } from '../cesium/entity-position-handler.service';
@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	private busEvents: BusEvent[];
	private passengerEvents:PassengerEvent[];
	private combined: EntityEvent[];
	private eventObservations:any[];

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

	public getPassengerData(passengerEvents: PassengerEvent[]): void {
		this.passengerEvents = passengerEvents;
	}

	public setEventObservations(eventObservations: any[]) {
		this.eventObservations = eventObservations;
	}

	public getEventObservations() {
		return this.eventObservations;
	}
	public combinePassengerAndBusEvents(component:ZipHandlerComponent): void {
		// component.tupleStringToArray(component, component.csvData.get(component.vehicleDataFileName));
		// component.csvData.set(component.vehicleDataFileName, component.parser.parseToBusData(component.csvData.get(component.vehicleDataFileName)));
		// component.tupleStringToArray(component, component.csvData.get(component.tripsDataFileName));
		// component.csvData.set(component.tripsDataFileName, component.parser.parseToPassengerData(component.csvData.get(component.tripsDataFileName)));
		
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
		console.log(this.combined);
	}

	public async runVehiculeSimulation(viewer: Viewer, eventsAmount?: number): Promise<void> {
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
		let previousTime = getTime(this.getBusEvents()[0].time);
		for (let i = 0; i < eventsAmount; i++) {
			const event = this.busEvents[i];
			if (event) {
				await this.entityPositionHandlerService.loadBus(viewer, event, previousTime);
				previousTime = getTime(event.time);
			}
		}
	}
}
