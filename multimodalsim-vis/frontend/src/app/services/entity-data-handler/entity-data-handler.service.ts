import { Injectable } from '@angular/core';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';

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
		const firstTime = this.data[1].time;
		const secondTime = this.data[2].time;
		console.log('firstTime: ', firstTime, 'secondTime: ', secondTime);

		for (const event of this.data) {
			if (event) {
				//console.log(event);
				//this.getDelay(event);
				//this.clock = event.time;
			}
		}
	}

	getDelay(event: any) {
		return event.time - this.clock;
	}
}
