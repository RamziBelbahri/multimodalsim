import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';
import { getTime } from 'src/app/helpers/parsers';
import { EntityPositionHandlerService } from '../cesium/entity-position-handler.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const delay = require('delay');
@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	private data: BusEvent[];
	private clock: number;

	constructor(private entityPositionHandlerService: EntityPositionHandlerService) {
		this.data = [];
		this.clock = 0;
	}

	getData(): BusEvent[] {
		return this.data;
	}

	setData(data: BusEvent[]): void {
		this.data = data;
	}

	async runVehiculeSimulation(viewer: Viewer): Promise<void> {
		let previousTime = getTime(this.getData()[0].time);
		for (const event of this.data) {
			if (event) {
				const timeDelay = this.getDelay(getTime(event.time), previousTime) / 10;
				await delay(timeDelay);
				this.entityPositionHandlerService.loadBus(viewer, event);
				previousTime = getTime(event.time);
			}
		}
	}

	getDelay(currentTime: number, previousTime: number) {
		return currentTime - previousTime;
	}
}
