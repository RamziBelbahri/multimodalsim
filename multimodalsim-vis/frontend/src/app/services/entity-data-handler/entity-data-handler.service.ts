import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';
import { getTime } from 'src/app/helpers/parsers';
import { EntityPositionHandlerService } from '../cesium/entity-position-handler.service';
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

	private getBusData(): BusEvent[] {
		return this.data;
	}

	public setBusData(data: BusEvent[]): void {
		this.data = data;
	}

	public async runVehiculeSimulation(viewer: Viewer, eventsAmount?: number): Promise<void> {
		eventsAmount ? this.runPartialSimulation(viewer, eventsAmount) : this.runFullSimulation(viewer);
	}

	private async runFullSimulation(viewer: Viewer): Promise<void> {
		let previousTime = getTime(this.getBusData()[0].time);
		for (const event of this.data) {
			if (event) {
				await this.entityPositionHandlerService.loadBus(viewer, event, previousTime);
				previousTime = getTime(event.time);
			}
		}
	}

	//for demo purposes only
	private async runPartialSimulation(viewer: Viewer, eventsAmount: number): Promise<void> {
		let previousTime = getTime(this.getBusData()[0].time);
		for (let i = 0; i < eventsAmount; i++) {
			const event = this.data[i];
			if (event) {
				await this.entityPositionHandlerService.loadBus(viewer, event, previousTime);
				previousTime = getTime(event.time);
			}
		}
	}
}
