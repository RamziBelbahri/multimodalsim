import { Cartesian3, JulianDate } from 'cesium';
import { TimeInterval } from './time-interval';

export class Stop {
	private passengerTimeMapping: Map<string, TimeInterval>;

	position: Cartesian3;
	id: string;

	constructor(position: Cartesian3, id: string) {
		this.position = position;
		this.id = id;
		this.passengerTimeMapping = new Map<string, TimeInterval>();
	}

	addPassengerStart(id: string, start: JulianDate): void {
		this.passengerTimeMapping.set(id, new TimeInterval(start));
	}

	setPassengerEnd(id: string, end: JulianDate): void {
		const interval = this.passengerTimeMapping.get(id);

		if (interval) {
			interval.end = end;
			this.passengerTimeMapping.set(id, interval);
		}
	}

	removePassenger(id: string): void {
		this.passengerTimeMapping.delete(id);
	}

	getPassengerAmount(): number {
		return this.passengerTimeMapping.size;
	}

	// Obtenir le temps auquel le premier passager arrive pour créer l'arrêt.
	getSpawnTime(): JulianDate {
		let spawnTime: JulianDate = Cesium.JulianDate.now();

		this.passengerTimeMapping.forEach((interval: TimeInterval) => {
			if (!spawnTime) {
				spawnTime = interval.start;
			} else if (Cesium.JulianDate.compare(spawnTime, interval.start) > 0) {
				spawnTime = interval.start;
			}
		});

		return spawnTime;
	}

	// Obtenir le temps auquel le dernier passager quitte pour enlever l'arrêt.
	getEndTime(): JulianDate {
		let endTime: JulianDate = Cesium.JulianDate.now();

		this.passengerTimeMapping.forEach((interval: TimeInterval) => {
			if (!endTime) {
				endTime = interval.end;
			} else if (Cesium.JulianDate.compare(endTime, interval.start) < 0) {
				endTime = interval.end;
			}
		});

		return endTime;
	}
}
