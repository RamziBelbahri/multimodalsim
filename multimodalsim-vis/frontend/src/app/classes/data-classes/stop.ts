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
}
