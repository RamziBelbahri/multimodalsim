import { Injectable } from '@angular/core';
import { JulianDate, Viewer } from 'cesium';
import { BoardingEvent } from 'src/app/classes/data-classes/boardingEvent';
import { StopPositionHandlerService } from './stop-position-handler.service';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';

@Injectable({
	providedIn: 'root',
})
export class BoardingHandlerService {
	private lastEvent: BoardingEvent | undefined;
	private pastEventQueue;
	private lastTime: JulianDate | undefined;

	constructor(private stopHandler: StopPositionHandlerService, private vehicleHandler: VehiclePositionHandlerService) {
		this.lastEvent = stopHandler.boardingEventPop();
		this.pastEventQueue = new Array<BoardingEvent>();
	}

	// Initialise les Event listener. Permet de mettre à jour les passagers quand le bon tick de temps arrive.
	initBoarding(viewer: Viewer): void {
		viewer.clock.onTick.addEventListener((clock) => {
			const currentTime = clock.currentTime;
			if (!this.lastTime) this.lastTime = currentTime;

			if (viewer.clock.multiplier < 0 || Cesium.JulianDate.greaterThan(this.lastTime, currentTime)) {
				this.reversedTimeBoarding(viewer, currentTime);
				this.lastTime = currentTime;
			} else {
				this.forwardTimeBoarding(viewer, currentTime);
				this.lastTime = currentTime;
			}
		});
	}

	// Gère les évènements quand le temps avance.
	private forwardTimeBoarding(viewer: Viewer, currentTime: JulianDate): void {
		if (!this.lastEvent) {
			this.lastEvent = this.stopHandler.boardingEventPop();
			if (this.lastEvent) this.pastEventQueue.push(this.lastEvent);
		}

		if (this.lastEvent) {
			while (currentTime >= this.lastEvent.time) {
				if (this.lastEvent.isBoardingVehicle) {
					this.vehicleHandler.addPassenger(this.lastEvent.passengerId, this.lastEvent.targetId);
					this.stopHandler.removePassenger(this.lastEvent.passengerId, this.lastEvent.originId);

					this.vehicleHandler.updateIcon(viewer, this.lastEvent.targetId);
					this.stopHandler.updateIcon(viewer, this.lastEvent.originId);
				} else {
					this.vehicleHandler.removePassenger(this.lastEvent.passengerId, this.lastEvent.originId);
					this.stopHandler.addPassenger(this.lastEvent.passengerId, this.lastEvent.targetId);

					this.vehicleHandler.updateIcon(viewer, this.lastEvent.originId);
					this.stopHandler.updateIcon(viewer, this.lastEvent.targetId);
				}

				this.lastEvent = this.stopHandler.boardingEventPop();
				if (this.lastEvent) this.pastEventQueue.push(this.lastEvent);

				if (!this.lastEvent) {
					break;
				}
			}
		}
	}

	// Gère les évènements quand le temps recule.
	private reversedTimeBoarding(viewer: Viewer, currentTime: JulianDate): void {
		if (!this.lastEvent) {
			this.lastEvent = this.pastEventQueue.pop();
			if (this.lastEvent) this.stopHandler.stackBoardingEvent(this.lastEvent);
		}

		if (this.lastEvent) {
			while (currentTime <= this.lastEvent.time) {
				if (this.lastEvent.isBoardingVehicle) {
					this.vehicleHandler.removePassenger(this.lastEvent.passengerId, this.lastEvent.targetId);
					this.stopHandler.addPassenger(this.lastEvent.passengerId, this.lastEvent.originId);

					this.vehicleHandler.updateIcon(viewer, this.lastEvent.targetId);
					this.stopHandler.updateIcon(viewer, this.lastEvent.originId);
				} else {
					this.vehicleHandler.addPassenger(this.lastEvent.passengerId, this.lastEvent.originId);
					this.stopHandler.removePassenger(this.lastEvent.passengerId, this.lastEvent.targetId);

					this.vehicleHandler.updateIcon(viewer, this.lastEvent.originId);
					this.stopHandler.updateIcon(viewer, this.lastEvent.targetId);
				}

				this.lastEvent = this.pastEventQueue.pop();
				if (this.lastEvent) this.stopHandler.stackBoardingEvent(this.lastEvent);

				if (!this.lastEvent) {
					break;
				}
			}
		}
	}
}
