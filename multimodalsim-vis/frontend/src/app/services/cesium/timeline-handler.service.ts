import { Injectable } from '@angular/core';
import { EntityDataHandlerService } from '../entity-data-handler/entity-data-handler.service';
import { Viewer } from 'cesium';
import { DateParserService } from '../util/date-parser.service';

@Injectable({
	providedIn: 'root',
})
export class TimelineHandlerService {
	constructor(private dataHandler: EntityDataHandlerService, private dateParser: DateParserService) {}

	initHandler(viewer: Viewer): void {
		viewer.clock.onTick.addEventListener((clock) => {
			if (this.dataHandler.combined.length <= 0) return;

			const currentTime = clock.currentTime;
			const lastEventTime = this.dateParser.parseTimeFromSeconds(this.dataHandler.combined[this.dataHandler.combined.length - 1].time.toString());

			if (Cesium.JulianDate.greaterThanOrEquals(currentTime, lastEventTime)) {
				viewer.clock.currentTime = lastEventTime;
				viewer.clock.multiplier = 1;
			}
		});
	}
}
