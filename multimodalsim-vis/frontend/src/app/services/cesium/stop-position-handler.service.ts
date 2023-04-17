import { Injectable } from '@angular/core';
import { Cartesian3, Viewer } from 'cesium';
import { BoardingEvent } from 'src/app/classes/data-classes/boardingEvent';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { PassengersStatus } from 'src/app/classes/data-classes/passenger-event/passengers-status';
import { Stop } from 'src/app/classes/data-classes/stop';
import { DateParserService } from '../util/date-parser.service';
import { StopLookupService } from '../util/stop-lookup.service';
import { CameraHandlerService } from './camera-handler.service';

@Injectable({
	providedIn: 'root',
})
export class StopPositionHandlerService {
	public stopIdMapping;
	private boardingEventQueue;
	private globalPassengerList;

	constructor(private stopLookup: StopLookupService, private dateParser: DateParserService, private cameraHandler: CameraHandlerService) {
		this.stopIdMapping = new Map<string, Stop>();
		this.boardingEventQueue = new Array<BoardingEvent>();
		this.globalPassengerList = new Array<string>();
	}

	// Initialise tous les stops de la liste de stop fournie
	initStops(): void {
		this.stopLookup.coordinatesIdMapping.forEach((coords: Cartesian3, id: number) => {
			if (id != 0) {
				const newStop = new Stop(this.stopLookup.coordinatesFromStopId(id), id.toString());
				this.stopIdMapping.set(id.toString(), newStop);
			}
		});
	}

	// Ajoute les moments ou les passagers sont présents à un arrêt
	compileEvent(passengerEvent: PassengerEvent): void {
		const stopId = passengerEvent.current_location.toString();
		const stop = this.stopIdMapping.get(stopId);
		const assignedVehicleId = passengerEvent.assigned_vehicle ? passengerEvent.assigned_vehicle.toString() : '';
		const time = this.dateParser.parseTimeFromSeconds(passengerEvent.time.toString());

		if (!this.globalPassengerList.includes(passengerEvent.id)) {
			this.globalPassengerList.push(passengerEvent.id);
		}

		if (stop || PassengersStatus.ONBOARD) {
			switch (passengerEvent.status) {
			case PassengersStatus.RELEASE:
				this.stopIdMapping.set(stopId, stop as Stop);
				break;
			case PassengersStatus.ONBOARD:
				this.boardingEventQueue.push(new BoardingEvent(passengerEvent.id, stopId, assignedVehicleId, true, time));
				break;
			case PassengersStatus.COMPLETE:
				this.boardingEventQueue.push(new BoardingEvent(passengerEvent.id, assignedVehicleId, stopId, false, time));
				break;
			}
		}
	}

	// Charge tous les arrêts qui contiennent des passagers
	loadSpawnEvents(viewer: Viewer): void {
		this.stopIdMapping.forEach((stop: Stop, id: string) => {
			this.spawnEntity(id, stop, viewer);
		});
	}

	getStopIdMapping(): Map<string, Stop> {
		return this.stopIdMapping;
	}

	// Obtenir le nombre de passagers à un arrêt
	getPassengerAmount(id: string): number {
		let result = 0;
		const stop = this.stopIdMapping.get(id);

		if (stop) {
			result = stop.getPassengerAmount();
		}

		return result;
	}

	getTotalPassengerAmount(): number {
		return this.globalPassengerList.length;
	}

	boardingEventPop(): BoardingEvent | undefined {
		if (this.boardingEventQueue.length > 0) {
			return this.boardingEventQueue.shift();
		} else {
			return undefined;
		}
	}

	stackBoardingEvent(event: BoardingEvent): void {
		this.boardingEventQueue.unshift(event);
	}

	addPassenger(passengerid: string, stopId: string): void {
		this.stopIdMapping.get(stopId)?.addPassenger(passengerid);
	}

	removePassenger(passengerid: string, stopId: string): void {
		this.stopIdMapping.get(stopId)?.removePassenger(passengerid);
	}

	updateIcon(viewer: Viewer, stopId: string): void {
		const entity = viewer.entities.getById(stopId);
		if (entity && entity.ellipse) {
			entity.ellipse.material =
				this.getPassengerAmount(stopId) <= 0
					? new Cesium.ImageMaterialProperty({ image: '../../../assets/stop.png', transparent: true })
					: new Cesium.ImageMaterialProperty({ image: '../../../assets/occupied_stop.png', transparent: true });
		}
	}

	// Ajoute l'entité d'un arrêt tant qu'il est encore utile
	private spawnEntity(id: string, stop: Stop, viewer: Viewer): void {
		viewer.entities.add({
			position: stop.position,
			ellipse: {
				semiMinorAxis: this.cameraHandler.getCurrentStopSize(),
				semiMajorAxis: this.cameraHandler.getCurrentStopSize(),
				height: 0,
				material: new Cesium.ImageMaterialProperty({ image: '../../../assets/stop.png', transparent: true }),
			},
			label: {
				font: '20px sans-serif',
				showBackground: true,
				horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			},
			id: id,
			name: 'stop',
		});
	}
}
