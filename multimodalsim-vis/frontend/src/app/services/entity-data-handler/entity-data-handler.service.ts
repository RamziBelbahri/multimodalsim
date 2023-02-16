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
	private busDrawing = '🚍';
	private passengerDrawing = '🚶🏼';

	constructor(private entityPositionHandlerService: EntityPositionHandlerService) {
		this.data = [];
	}

	getBusData(): BusEvent[] {
		return this.data;
	}

	setBusData(data: BusEvent[]): void {
		this.data = data;
	}

	async runVehiculeSimulation(viewer: Viewer): Promise<void> {
		let previousTime = getTime(this.getBusData()[0].time);
		for (const event of this.data) {
			if (event) {
				const timeDelay = this.getDelay(getTime(event.time), previousTime) / 100;
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
