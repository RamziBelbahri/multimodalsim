import { Injectable } from '@angular/core';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';
import { getTime } from 'src/app/helpers/parsers';

@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	private data: BusEvent[];
	private clock: number;

	constructor() {
		this.data = [];
		this.clock = 0;
	}

	setData(data: BusEvent[]): void {
		this.data = data;
		this.runVehiculeSimulation();
	}

	// runs the simulation, if the clock is equal
	runVehiculeSimulation() {
		console.log(this.data);
		for (const event of this.data) {
			if (event) {
				console.log(event);
				const delay = this.getDelay(event);
				console.log(delay);
				this.clock = getTime(event.time);
			}
		}
	}

	getDelay(event: BusEvent) {
		return getTime(event.time) - this.clock;
	}
}
