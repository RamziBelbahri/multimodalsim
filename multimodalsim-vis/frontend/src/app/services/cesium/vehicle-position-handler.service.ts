import { Injectable } from '@angular/core';
import { SampledPositionProperty, Viewer } from 'cesium';
import { TimedPolyline } from 'src/app/classes/data-classes/polyline-section';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { VehicleStatus } from 'src/app/classes/data-classes/vehicle-class/vehicle-status';
import { Vehicle } from 'src/app/classes/data-classes/vehicles';
import { DateParserService } from '../util/date-parser.service';
import { PolylineDecoderService } from '../util/polyline-decoder.service';
import { StopLookupService } from '../util/stop-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class VehiclePositionHandlerService {
	private vehicleIdMapping;
	private pathIdMapping;

	constructor(private stopLookup: StopLookupService, private dateParser: DateParserService, private polylineDecoder: PolylineDecoderService) {
		this.vehicleIdMapping = new Map<string, Vehicle>();
		this.pathIdMapping = new Map<string, TimedPolyline>();
	}

	getVehicleIdMapping(): Map<string, Vehicle> {
		return this.vehicleIdMapping;
	}

	// Compile les chemins des véhicules avant leur création
	compileEvent(vehicleEvent: VehicleEvent, isRealTime: boolean, viewer: Viewer): void {
		const vehicleId = vehicleEvent.id.toString();

		if (!this.vehicleIdMapping.has(vehicleId)) {
			this.vehicleIdMapping.set(vehicleId, new Vehicle(vehicleId));

			if (isRealTime) this.spawnEntity(vehicleEvent.id, this.vehicleIdMapping.get(vehicleId)?.path as SampledPositionProperty, viewer);
		}

		if (!this.pathIdMapping.has(vehicleId)) {
			this.pathIdMapping.set(vehicleId, this.polylineDecoder.parsePolyline(vehicleEvent.polylines));
		}

		switch (vehicleEvent.status) {
		case VehicleStatus.ENROUTE:
			this.setNextLeg(vehicleEvent);
			break;
		case VehicleStatus.IDLE:
			this.setIdleStop(vehicleEvent, Number(vehicleEvent.current_stop));
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

	getPolylines(id: string): TimedPolyline {
		const section = this.pathIdMapping.get(id);

		return section ? section : new TimedPolyline();
	}

	// Ajoute un échantillon au chemin d'un véhicule
	private setNextLeg(vehicleEvent: VehicleEvent): void {
		const vehicle = this.vehicleIdMapping.get(vehicleEvent.id.toString()) as Vehicle;
		const polyline = this.pathIdMapping.get(vehicleEvent.id.toString()) as TimedPolyline;

		if (polyline.positions[polyline.lastSectionCompiled] && VehicleEvent) {
			let time = this.dateParser.parseTimeFromSeconds(vehicleEvent.time);

			for (let i = 0; i < polyline.positions[polyline.lastSectionCompiled].length; i++) {
				//if (vehicleEvent.id == '2790287') console.log(time, polyline.positions[polyline.lastSectionCompiled][i]);
				vehicle.path.addSample(time, polyline.positions[polyline.lastSectionCompiled][i]);

				if (i >= polyline.times[polyline.lastSectionCompiled].length) {
					break;
				}

				const sectionTime = polyline.times[polyline.lastSectionCompiled][i] * Number(vehicleEvent.duration);
				time = this.dateParser.addDuration(time, sectionTime.toString());
			}

			polyline.lastSectionCompiled++;

			//vehicle.path.addSample(endTime, this.stopLookup.coordinatesFromStopId(stop));
			this.pathIdMapping.set(vehicleEvent.id.toString(), polyline);
			this.vehicleIdMapping.set(vehicleEvent.id.toString(), vehicle);
		}
	}

	// Ajout un temps d'arrêt quand le bus doit idle
	private setIdleStop(vehicleEvent: VehicleEvent, stop: number): void {
		const vehicle = this.vehicleIdMapping.get(vehicleEvent.id.toString()) as Vehicle;
		const startTime = this.dateParser.parseTimeFromSeconds(vehicleEvent.time);
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
				material: new Cesium.ImageMaterialProperty({ image: '../../../assets/filledBus.png', transparent: true }),
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
