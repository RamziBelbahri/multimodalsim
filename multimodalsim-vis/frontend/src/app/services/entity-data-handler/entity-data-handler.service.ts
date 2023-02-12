import { Injectable } from '@angular/core';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';
import { PassengerEvent } from 'src/app/classes/passenger-event/passenger-event';
import { getTime } from 'src/app/helpers/parsers';

@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	private busData: BusEvent[];
	private passengerData:PassengerEvent[];
	private clock: number;

	constructor() {
		this.busData = [];
		this.passengerData = [];
		this.clock = 0;
	}

	setBusData(busData: BusEvent[]): void {
		this.busData = busData;
		this.runVehiculeSimulation();
	}

	setPassengerData(passengerData:PassengerEvent[]):void {
		this.passengerData = passengerData;
		this.runPassengerSimulation()
	}

	// runs the simulation, if the clock is equal
	runVehiculeSimulation() {
		console.log(this.busData);
		for (const event of this.busData) {
			if (event) {
				console.log(event);
				const delay = this.getDelay(event);
				console.log(delay);
				this.clock = getTime(event.time);
			}
		}
	}

	// runs the simulation, if the clock is equal
	runPassengerSimulation() {
		console.log(this.passengerData);
		for (const event of this.passengerData) {
			if (event) {
				console.log(event);
				const delay = this.getDelay(event);
				console.log(delay);
				this.clock = getTime(event.time);
			}
		}
	}

	getDelay(event: BusEvent|PassengerEvent) {
		return getTime(event.time) - this.clock;
	}
}
