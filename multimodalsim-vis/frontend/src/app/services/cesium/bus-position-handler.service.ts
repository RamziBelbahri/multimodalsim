import { Injectable } from '@angular/core';
import { SampledPositionProperty, Viewer } from 'cesium';
import { BusEvent } from 'src/app/classes/data-classes/bus-class/bus-event';
import { BusStatus } from 'src/app/classes/data-classes/bus-class/bus-status';
import { DateParserService } from '../util/date-parser.service';
import { StopLookupService } from '../util/stop-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class BusPositionHandlerService {
	private pathIdMapping = new Map<string, SampledPositionProperty>();

	constructor(private stopLookup: StopLookupService, private dateParser: DateParserService) {}

	async testEntityRealTime(viewer: Viewer): Promise<void> {
		const positionProperty = new Cesium.SampledPositionProperty();
		// 2790287,1969-12-31 23:16:47,0.284,-73.769447,45.640194,0 days 00:00:00
		// 2790287,1969-12-31 23:32:03,-73.769224,45.639187,0 days 00:00:00

		let startTime = this.dateParser.parseTimeFromString('1969-12-31 23:16:47');
		let endTime = this.dateParser.addDuration(startTime, '0 days 00:00:00');
		positionProperty.addSample(endTime, Cesium.Cartesian3.fromDegrees(-73.769447, 45.640194));
		this.spawnEntity(positionProperty, viewer);
		startTime = this.dateParser.parseTimeFromString('1969-12-31 23:32:03');
		endTime = this.dateParser.addDuration(startTime, '0 days 00:00:00');
		positionProperty.addSample(endTime, Cesium.Cartesian3.fromDegrees(-73.769224,45.639187));
		console.log('entityRealTime: ');
	}

	// Compile les chemins des bus avant leur création
	compileEvents(busEvent: BusEvent): void {
		if (!this.pathIdMapping.has(busEvent.id)) {
			this.pathIdMapping.set(busEvent.id, new Cesium.SampledPositionProperty());

			// Donner une valeur non nulle afin de ne pas causer d'erreur si le bus ne se déplace jamais.
			if (busEvent.status != BusStatus.ENROUTE) {
				this.setNextStop(busEvent, Number(busEvent.current_stop));
			}
		}

		switch (busEvent.status) {
		case BusStatus.ENROUTE:
			this.setNextStop(busEvent, Number(busEvent.next_stop.toString().split('\'')[1]));
			break;
		case BusStatus.IDLE:
			this.setNextStop(busEvent, Number(busEvent.current_stop));
			break;
		}
	}

	// Charge tous les chemins des bus afin de les ajouter sur la carte
	loadSpawnEvents(viewer: Viewer): void {
		this.pathIdMapping.forEach((positionProperty: SampledPositionProperty) => {
			this.spawnEntity(positionProperty, viewer);
		});
	}

	// Ajoute un échantillon au chemin d'un bus
	private setNextStop(busEvent: BusEvent, stop: number): void {
		const positionProperty = this.pathIdMapping.get(busEvent.id) as SampledPositionProperty;
		const startTime = this.dateParser.parseTimeFromString(busEvent.time);
		const endTime = this.dateParser.addDuration(startTime, busEvent.duration);

		positionProperty.addSample(endTime, this.stopLookup.coordinatesFromStopId(stop));
		this.pathIdMapping.set(busEvent.id, positionProperty);
	}

	// Ajoute une entité sur la carte avec le chemin spécifié
	private spawnEntity(positionProperty: SampledPositionProperty, viewer: Viewer): void {
		viewer.entities.add({
			position: positionProperty,
			ellipse: {
				semiMinorAxis: 30,
				semiMajorAxis: 30,
				height: 0,
				material: Cesium.Color.BLUE,
				outline: true,
				outlineColor: Cesium.Color.BLACK,
			},
		});
	}
}
