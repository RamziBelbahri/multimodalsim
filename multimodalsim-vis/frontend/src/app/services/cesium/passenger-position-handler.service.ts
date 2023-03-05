import { Injectable } from '@angular/core';
import { Viewer } from 'cesium';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { PassengersStatus } from 'src/app/classes/data-classes/passenger-event/passengers-status';
import { Stop } from 'src/app/classes/data-classes/stop';
import { DateParserService } from '../util/date-parser.service';
import { StopLookupService } from '../util/stop-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class PassengerPositionHandlerService {
	private stopIdMapping = new Map<string, Stop>();

	constructor(private stopLookup: StopLookupService, private dateParser: DateParserService) {}

	// Ajoute les moments ou les passagers sont présents à un arrêt
	compileEvent(passengerEvent: PassengerEvent): void {
		const stopId = passengerEvent.current_location.toString();

		if (!this.stopIdMapping.has(stopId)) {
			const newStop = new Stop(this.stopLookup.coordinatesFromStopId(Number(stopId)), stopId);
			this.stopIdMapping.set(stopId, newStop);
		}

		const stop = this.stopIdMapping.get(stopId) as Stop;

		switch (passengerEvent.status) {
		case PassengersStatus.RELEASE:
			stop.addPassengerStart(passengerEvent.id, this.dateParser.parseTimeFromString(passengerEvent.time));
			this.stopIdMapping.set(stopId, stop);
			break;
		case PassengersStatus.ONBOARD:
			stop.setPassengerEnd(passengerEvent.id, this.dateParser.parseTimeFromString(passengerEvent.time));
			this.stopIdMapping.set(stopId, stop);
			break;
		}
	}

	// Charge tous les arrêts qui contiennent des passagers
	loadSpawnEvents(viewer: Viewer): void {
		this.stopIdMapping.forEach((stop: Stop, id: string) => {
			this.spawnEntity(id, stop, viewer);
		});
	}

	getPassengerAmount(id: string): number {
		let result = 0;
		const stop = this.stopIdMapping.get(id);

		if (stop) {
			result = stop.getPassengerAmount();
		}

		return result;
	}

	// Ajoute l'entité d'un arrêt tant qu'il est encore utile
	private spawnEntity(id: string, stop: Stop, viewer: Viewer): void {
		viewer.entities.add({
			position: stop.position,
			ellipse: {
				semiMinorAxis: 30,
				semiMajorAxis: 30,
				height: 0,
				material: Cesium.Color.RED,
				outline: true,
				outlineColor: Cesium.Color.BLACK,
			},
			label: {
				font: '20px sans-serif',
				showBackground: true,
				horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
			},
			id: id,
			name: 'passenger',
		});
	}
}
