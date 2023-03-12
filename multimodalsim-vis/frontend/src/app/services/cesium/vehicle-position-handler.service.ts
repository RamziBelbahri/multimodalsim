import { Injectable } from '@angular/core';
import { SampledPositionProperty, Viewer } from 'cesium';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { VehicleStatus } from 'src/app/classes/data-classes/vehicle-class/vehicle-status';
import { Vehicle } from 'src/app/classes/data-classes/vehicles';
import { DateParserService } from '../util/date-parser.service';
import { StopLookupService } from '../util/stop-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class VehiclePositionHandlerService {
	private vehicleIdMapping;

	constructor(private stopLookup: StopLookupService, private dateParser: DateParserService) {
		this.vehicleIdMapping = new Map<string, Vehicle>();
	}

	getVehicleIdMapping() {
		return this.vehicleIdMapping;
	}
	
	// Compile les chemins des véhicules avant leur création
	compileEvent(vehicleEvent: VehicleEvent, isRealTime: boolean, viewer: Viewer): void {
		const vehicleId = vehicleEvent.id.toString();

		if (!this.vehicleIdMapping.has(vehicleId)) {
			this.vehicleIdMapping.set(vehicleId, new Vehicle(vehicleId));

			// Donner une valeur non nulle afin de ne pas causer d'erreur si le véhicule ne se déplace jamais.
			if (vehicleEvent.status != VehicleStatus.ENROUTE) {
				this.setNextStop(vehicleEvent, Number(vehicleEvent.current_stop));
			}
			if (isRealTime) this.spawnEntity(vehicleEvent.id, this.vehicleIdMapping.get(vehicleId)?.path as SampledPositionProperty, viewer);
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
		this.vehicleIdMapping.forEach((vehicle: Vehicle, id: string) => {
			this.spawnEntity(id, vehicle.path, viewer);
		});
	}

	// Obtenir le nombre de passagers dans un véhicule
	getPassengerAmount(id: string): number {
		let result = 0;
		const vehicle = this.vehicleIdMapping.get(id);

		if (vehicle) {
			result = vehicle.getPassengerAmount();
		}

		return result;
	}

	addPassenger(passengerid: string, vehicleId: string): void {
		this.vehicleIdMapping.get(vehicleId)?.addPassenger(passengerid);
	}

	removePassenger(passengerid: string, vehicleId: string): void {
		this.vehicleIdMapping.get(vehicleId)?.removePassenger(passengerid);
	}

	// Ajoute un échantillon au chemin d'un véhicule
	private setNextStop(vehicleEvent: VehicleEvent, stop: number): void {
		const vehicle = this.vehicleIdMapping.get(vehicleEvent.id.toString()) as Vehicle;
		const startTime = this.dateParser.parseTimeFromString(vehicleEvent.time);
		const endTime = this.dateParser.addDuration(startTime, vehicleEvent.duration);

		vehicle.path.addSample(endTime, this.stopLookup.coordinatesFromStopId(stop));
		this.vehicleIdMapping.set(vehicleEvent.id.toString(), vehicle);
	}

	// Ajoute une entité sur la carte avec le chemin spécifié
	private spawnEntity(id: string, positionProperty: SampledPositionProperty, viewer: Viewer): void {
		viewer.entities.add({
			position: positionProperty,
			ellipse: {
				semiMinorAxis: 30,
				semiMajorAxis: 30,
				height: 0,
				material: new Cesium.ImageMaterialProperty({ image: '../../../assets/bus.svg', transparent: true }),
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
