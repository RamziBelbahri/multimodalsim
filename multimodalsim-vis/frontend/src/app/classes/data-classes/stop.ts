import { Cartesian3 } from 'cesium';

export class Stop {
	private waitingPassengers;

	position: Cartesian3;
	id: string;

	constructor(position: Cartesian3, id: string) {
		this.position = position;
		this.id = id;
		this.waitingPassengers = new Array<string>();
	}

	// fonction pour débarquer le passager au stop
	addPassenger(id: string): void {
		this.waitingPassengers.push(id);
	}

	// fonction pour embarquer le passager du stop
	removePassenger(id: string): void {
		const index = this.waitingPassengers.indexOf(id);
		if (index > -1) {
			this.waitingPassengers.splice(index, 1);
		}
	}

	getPassengers(): Array<string> {
		return this.waitingPassengers;
	}

	getPassengerAmount(): number {
		return this.waitingPassengers.length;
	}
}
