import { Injectable } from '@angular/core';
import { Cartesian3, Entity, JulianDate, SampledPositionProperty, Viewer } from 'cesium';
import { BusEvent } from 'src/app/classes/data-classes/bus-class/bus-event';
import { BusStatus } from 'src/app/classes/data-classes/bus-class/bus-status';
import { CesiumClass } from 'src/app/shared/cesium-class';
import { DateParserService } from '../util/date-parser.service';
import { StopLookupService } from '../util/stop-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class BusPositionHandlerService {
	private busIdMapping = new Map<string, Entity>();

	constructor(private stopLookup: StopLookupService, private dateParser: DateParserService) {}

	// Interprète les events de bus et appelle les bonnes fonctions
	loadEvent(viewer: Viewer, busEvent: BusEvent): void {
		if (!this.busIdMapping.has(busEvent.id)) {
			this.spawnEntity(busEvent.position as Cartesian3, busEvent.id, viewer);
		}

		if (busEvent.status == BusStatus.ENROUTE) {
			const nextStop = this.stopLookup.coordinatesFromStopId(Number(busEvent.next_stop[0]));
			const startTime = this.dateParser.parseTimeFromString(busEvent.time);
			const endTime = this.dateParser.addDuration(startTime, busEvent.duration);

			this.setDestination(nextStop, startTime, endTime, busEvent.id);
		}
	}

	// Génère un nouveau bus à sa position de départ
	private spawnEntity(position: Cartesian3, busId: string, viewer: Viewer): void {
		const entity = viewer.entities.add({
			position: position,
			ellipse: {
				semiMinorAxis: 30,
				semiMajorAxis: 30,
				height: 0,
				material: Cesium.Color.BLUE,
				outline: true,
				outlineColor: Cesium.Color.BLACK,
			},
		});
		this.busIdMapping.set(busId, entity);
	}

	// Change la destination d'un bus ainsi que le temps qu'il doit prendre pour s'y rendre
	private setDestination(target: Cartesian3, start: JulianDate, end: JulianDate, busId: string): void {
		const bus = this.busIdMapping.get(busId);

		if (bus != undefined) {
			const positionProperty = new SampledPositionProperty();
			positionProperty.addSample(end, target);

			bus.position = positionProperty;
			bus.availability = CesiumClass.timeInterval(start, end);
		}
	}
}
