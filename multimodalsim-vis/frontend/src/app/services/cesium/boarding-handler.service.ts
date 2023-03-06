import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { BoardingEvent } from 'src/app/classes/data-classes/boardingEvent';
import { StopPositionHandlerService } from './stop-position-handler.service';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';

@Injectable({
	providedIn: 'root',
})
export class BoardingHandlerService {
    private lastEvent: BoardingEvent | undefined;

	constructor(stopHandler: StopPositionHandlerService, vehicleHandler: VehiclePositionHandlerService) {
        this.lastEvent = stopHandler.boardingEventPop()
    }

	initBoarding(viewer: Viewer): void {
		viewer.clock.onTick.addEventListener((clock) => {
			const currentTime = clock.currentTime;
            //if()
		});
	}
}
