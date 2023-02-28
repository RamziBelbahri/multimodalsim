import { Injectable } from '@angular/core';
import { Entity, SampledPositionProperty, Viewer } from 'cesium';
import { BusEvent } from 'src/app/classes/data-classes/bus-class/bus-event';
import { BusStatus } from 'src/app/classes/data-classes/bus-class/bus-status';
import { DateParserService } from '../util/date-parser.service';
import { StopLookupService } from '../util/stop-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class BusPositionHandlerService {
	private busIdMapping = new Map<string, Entity>();
	private pathIdMapping = new Map<string, SampledPositionProperty>();

	constructor(private stopLookup: StopLookupService, private dateParser: DateParserService) {}

	// Compile les chemins des bus avant leur création
	compileEvents(busEvent: BusEvent): void {
		if (!this.pathIdMapping.has(busEvent.id)) {
			this.pathIdMapping.set(busEvent.id, new Cesium.SampledPositionProperty());

			// Donner une valeur non nulle afin de ne pas causer d'erreur si le bus ne se déplace jamais.
			if (busEvent.status != BusStatus.ENROUTE) {
				this.setNextStop(busEvent, Number(busEvent.current_stop));
			}
		}

		if (busEvent.status == BusStatus.ENROUTE) {
			const nextStops = busEvent.next_stop.toString().split('\'');
			this.setNextStop(busEvent, Number(nextStops[1]));
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
