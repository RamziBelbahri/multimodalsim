import { Injectable } from '@angular/core';
import { SampledPositionProperty, Viewer } from 'cesium';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { VehicleStatus } from 'src/app/classes/data-classes/vehicle-class/vehicle-status';
import { DateParserService } from '../util/date-parser.service';
import { StopLookupService } from '../util/stop-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class VehiclePositionHandlerService {
	private pathIdMapping = new Map<string, SampledPositionProperty>();

	constructor(private stopLookup: StopLookupService, private dateParser: DateParserService) {}

	// Compile les chemins des véhicules avant leur création
	compileEvents(vehicleEvent: VehicleEvent): void {
		if (!this.pathIdMapping.has(vehicleEvent.id)) {
			this.pathIdMapping.set(vehicleEvent.id, new Cesium.SampledPositionProperty());

			// Donner une valeur non nulle afin de ne pas causer d'erreur si le véhicule ne se déplace jamais.
			if (vehicleEvent.status != VehicleStatus.ENROUTE) {
				this.setNextStop(vehicleEvent, Number(vehicleEvent.current_stop));
			}
		}

		switch (vehicleEvent.status) {
		case VehicleStatus.ENROUTE:
			this.setNextStop(vehicleEvent, Number(vehicleEvent.next_stop.toString().split('\'')[1]));
			break;
		case VehicleStatus.IDLE:
			this.setNextStop(vehicleEvent, Number(vehicleEvent.current_stop));
			break;
		}
	}

	// Charge tous les chemins des véhicules afin de les ajouter sur la carte
	loadSpawnEvents(viewer: Viewer): void {
		this.pathIdMapping.forEach((positionProperty: SampledPositionProperty, id: string) => {
			this.spawnEntity(id, positionProperty, viewer);
		});
	}

	// Ajoute un échantillon au chemin d'un véhicule
	private setNextStop(vehicleEvent: VehicleEvent, stop: number): void {
		const positionProperty = this.pathIdMapping.get(vehicleEvent.id) as SampledPositionProperty;
		const startTime = this.dateParser.parseTimeFromString(vehicleEvent.time);
		const endTime = this.dateParser.addDuration(startTime, vehicleEvent.duration);

		positionProperty.addSample(endTime, this.stopLookup.coordinatesFromStopId(stop));
		this.pathIdMapping.set(vehicleEvent.id, positionProperty);
	}

	// Ajoute une entité sur la carte avec le chemin spécifié
	private spawnEntity(id: string, positionProperty: SampledPositionProperty, viewer: Viewer): void {
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
			label: {
				font: '20px sans-serif',
				showBackground: true,
				horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			},
			id: id,
			name: 'vehicle',
		});
	}
}
