import { Cartesian3 } from 'cesium';

export class Stop {
	private waitingPassengers = new Array<string>();

	position: Cartesian3;
	id: string;

	constructor(position: Cartesian3, id: string) {
		this.position = position;
		this.id = id;
		this.waitingPassengers = new Array<string>();
	}

	addPassenger(id: string): void {
		this.waitingPassengers.push(id);
	}

	removePassenger(id: string): void {
		const index = this.waitingPassengers.indexOf(id);
		if (index > -1) {
			this.waitingPassengers.splice(index, 1);
		}
	}

	getPassengerAmount(): number {
		return this.waitingPassengers.length;
	}
}
