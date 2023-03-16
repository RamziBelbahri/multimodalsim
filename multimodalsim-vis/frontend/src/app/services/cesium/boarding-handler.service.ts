import { Injectable } from '@angular/core';
import { Clock, Viewer } from 'cesium';
import { BoardingEvent } from 'src/app/classes/data-classes/boardingEvent';
import { StopPositionHandlerService } from './stop-position-handler.service';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';

@Injectable({
	providedIn: 'root',
})
export class BoardingHandlerService {
	private readonly SPEED_MULTIPLIER_LIMIT = 100;

	private lastEvent: BoardingEvent | undefined;

	constructor(private stopHandler: StopPositionHandlerService, private vehicleHandler: VehiclePositionHandlerService) {
		this.lastEvent = stopHandler.boardingEventPop();
	}

	// Initialise les Event listener. Permet de mettre à jour les passagers quand le bon tick de temps arrive.
	initBoarding(viewer: Viewer): void {
		viewer.clock.onTick.addEventListener((clock) => {
			const currentTime = clock.currentTime;

			this.limitSimulationSpeed(clock);

			if (!this.lastEvent) {
				this.lastEvent = this.stopHandler.boardingEventPop();
			}

			if (this.lastEvent) {
				while (currentTime >= this.lastEvent.time) {
					if (this.lastEvent.isBoardingVehicle) {
						this.vehicleHandler.addPassenger(this.lastEvent.passengerId, this.lastEvent.targetId);
						this.stopHandler.removePassenger(this.lastEvent.passengerId, this.lastEvent.originId);
					} else {
						this.stopHandler.addPassenger(this.lastEvent.passengerId, this.lastEvent.targetId);
						this.vehicleHandler.removePassenger(this.lastEvent.passengerId, this.lastEvent.originId);
					}

					this.lastEvent = this.stopHandler.boardingEventPop();
					if (!this.lastEvent) {
						break;
					}
				}
			}
		});
	}

	private limitSimulationSpeed(clock: Clock): void {
		if (clock.multiplier > this.SPEED_MULTIPLIER_LIMIT) {
			clock.multiplier = this.SPEED_MULTIPLIER_LIMIT;
		} else if (clock.multiplier < -this.SPEED_MULTIPLIER_LIMIT) {
			clock.multiplier = -this.SPEED_MULTIPLIER_LIMIT;
		}
	}
}
