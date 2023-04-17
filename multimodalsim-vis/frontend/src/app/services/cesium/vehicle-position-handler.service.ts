import { Injectable } from '@angular/core';
import { Color, Entity, JulianDate, SampledPositionProperty, Viewer } from 'cesium';
import { TimedPolyline } from 'src/app/classes/data-classes/polyline-section';
import { RealTimePolyline } from 'src/app/classes/data-classes/realtime-polyline';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { VehicleStatus } from 'src/app/classes/data-classes/vehicle-class/vehicle-status';
import { Vehicle } from 'src/app/classes/data-classes/vehicles';
import { ReplaySubject } from 'rxjs';
import { DateParserService } from '../util/date-parser.service';
import { PolylineDecoderService } from '../util/polyline-decoder.service';
import { StopLookupService } from '../util/stop-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class VehiclePositionHandlerService {
	private vehicleIdMapping;
	private pathIdMapping;
	private vehicleTypeListSource = new ReplaySubject<Array<string>>();
	vehicleTypeListObservable = this.vehicleTypeListSource.asObservable();
	vehicleTypeList;

	readonly defaultBusCapacity = 3;

	constructor(private stopLookup: StopLookupService, private dateParser: DateParserService, private polylineDecoder: PolylineDecoderService) {
		this.vehicleIdMapping = new Map<string, Vehicle>();
		this.pathIdMapping = new Map<string, TimedPolyline>();
		this.vehicleTypeList = new Array<string>();
	}

	getVehicleIdMapping(): Map<string, Vehicle> {
		return this.vehicleIdMapping;
	}

	// Compile les chemins des véhicules avant leur création
	compileEvent(vehicleEvent: VehicleEvent, isRealTime: boolean, viewer: Viewer): void {
		const vehicleId = vehicleEvent.id.toString();

		if (!this.vehicleTypeList.includes(vehicleEvent.mode)) {
			this.vehicleTypeList.push(vehicleEvent.mode);
			this.vehicleTypeListSource.next(this.vehicleTypeList);
		}

		if (!this.vehicleIdMapping.has(vehicleId)) {
			this.vehicleIdMapping.set(vehicleId, new Vehicle(vehicleId, vehicleEvent.mode));

			if (isRealTime) {
				this.spawnEntity(vehicleEvent.id, this.vehicleIdMapping.get(vehicleId)?.path as SampledPositionProperty, viewer);
			}
		}

		if (!this.pathIdMapping.has(vehicleId)) {
			const polylines = this.polylineDecoder.parsePolyline(vehicleEvent.polylines);
			this.pathIdMapping.set(vehicleId, polylines);
		}

		switch (vehicleEvent.status) {
		case VehicleStatus.ENROUTE:
			this.setNextLeg(vehicleEvent);
			break;
		case VehicleStatus.COMPLETE:
			break;
		default:
			this.setIdleStop(vehicleEvent, Number(vehicleEvent.current_stop));
			break;
		}
	}

	// Compile les chemins des véhicules avant leur création
	compileLiveEvent(vehicleEvent: VehicleEvent, viewer: Viewer): void {
		const vehicleId = vehicleEvent.id.toString();

		if (!this.vehicleTypeList.includes(vehicleEvent.mode)) {
			this.vehicleTypeList.push(vehicleEvent.mode);
			this.vehicleTypeListSource.next(this.vehicleTypeList);
		}

		if (!this.vehicleIdMapping.has(vehicleId)) {
			this.vehicleIdMapping.set(vehicleId, new Vehicle(vehicleId, vehicleEvent.mode));
			this.spawnEntity(vehicleEvent.id, this.vehicleIdMapping.get(vehicleId)?.path as SampledPositionProperty, viewer);
		}

		switch (vehicleEvent.status) {
		case VehicleStatus.ENROUTE:
			this.setLiveEventsPositions(vehicleEvent);
			break;
		case VehicleStatus.COMPLETE:
			break;
		default:
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

	setLiveEventsPositions(event: VehicleEvent) {
		const realtimePolylines: RealTimePolyline = event.polylines;
		const startTime = this.dateParser.parseTimeFromSeconds(event.time.toString());
		const duration = Number(event.duration);
		const vehicle = this.vehicleIdMapping.get(event.id.toString()) as Vehicle;
		const segments = realtimePolylines.stopsPolylineLookup.get(event.previous_stops[event.previous_stops.length - 1]);
		let fraction = 0;
		if (segments) {
			const positions = segments[0];
			const timeFractions = segments[1];
			for (let i = 0; i < timeFractions.length; i++) {
				fraction += timeFractions[i];
				const position = positions[i + 1];
				const time = this.dateParser.addDuration(startTime, (duration * fraction).toString());
				realtimePolylines.timesDone.push(Cesium.JulianDate.toDate(time).getTime());
				vehicle.path.addSample(time, position);
			}
		}
	}

	// Ajoute un échantillon au chemin d'un véhicule
	private setNextLeg(vehicleEvent: VehicleEvent): void {
		const vehicle = this.vehicleIdMapping.get(vehicleEvent.id.toString()) as Vehicle;
		const polyline = this.pathIdMapping.get(vehicleEvent.id.toString()) as TimedPolyline;

		if (polyline.positions[polyline.lastSectionCompiled] && VehicleEvent) {
			let time = this.dateParser.parseTimeFromSeconds(vehicleEvent.time.toString());
			polyline.times.push(new Array<JulianDate>());

			for (let i = 0; i < polyline.positions[polyline.lastSectionCompiled].length; i++) {
				vehicle.path.addSample(time, polyline.positions[polyline.lastSectionCompiled][i]);
				polyline.times[polyline.lastSectionCompiled].push(time);

				if (i >= polyline.sectionTimes[polyline.lastSectionCompiled].length) break;

				const sectionTime = polyline.sectionTimes[polyline.lastSectionCompiled][i] * Number(vehicleEvent.duration);
				time = this.dateParser.addDuration(time, sectionTime.toString());
			}

			polyline.lastSectionCompiled++;

			this.pathIdMapping.set(vehicleEvent.id.toString(), polyline);
			this.vehicleIdMapping.set(vehicleEvent.id.toString(), vehicle);
		}
	}

	// Ajout un temps d'arrêt quand le bus doit idle
	private setIdleStop(vehicleEvent: VehicleEvent, stop: number): void {
		const vehicle = this.vehicleIdMapping.get(vehicleEvent.id.toString()) as Vehicle;
		const startTime = this.dateParser.parseTimeFromSeconds(vehicleEvent.time.toString());
		const endTime = this.dateParser.addDuration(startTime, vehicleEvent.duration);

		vehicle.path.addSample(endTime, this.stopLookup.coordinatesFromStopId(stop));
		this.vehicleIdMapping.set(vehicleEvent.id.toString(), vehicle);
	}

	updateIcon(viewer: Viewer, busId: string): void {
		const entity = viewer.entities.getById(busId);
		if (entity && entity.ellipse)
			entity.ellipse.material = new Cesium.ImageMaterialProperty({ image: this.getBusIcon(busId), transparent: true });
	}

	getBusIcon(busId: string): string{
		const passengerAmount = this.getPassengerAmount(busId);
		if (passengerAmount <= this.defaultBusCapacity/3) return '../../../assets/empty_bus.svg';
		else if (passengerAmount > this.defaultBusCapacity/3 && passengerAmount <= 2*this.defaultBusCapacity/3) 
			return '../../../assets/semi_filled_bus.svg';
		else return '../../../assets/filled_bus.svg';
	}

	// Ajoute une entité sur la carte avec le chemin spécifié
	private spawnEntity(id: string, positionProperty: SampledPositionProperty, viewer: Viewer): void {
		viewer.entities.add({
			position: positionProperty,
			ellipse: {
				semiMinorAxis: 110,
				semiMajorAxis: 110,
				material: new Cesium.ImageMaterialProperty({ image: this.getBusIcon(id), transparent: true }),
				zIndex: 3,
			},
			label: {
				font: '20px sans-serif',
				showBackground: true,
				horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			},
			id: id,
			name: 'bus' + ((Number(id) % 2) + 1).toString(),
		});
	}
}
