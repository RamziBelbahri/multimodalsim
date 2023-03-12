import { Entity, SampledPositionProperty } from 'cesium';

export class Vehicle{
	private onBoardPassengers = new Array<string>();

	path: SampledPositionProperty;
	id: string;

	constructor(id: string) {
		this.id = id;
		this.path = new Cesium.SampledPositionProperty();
	}

	addPassenger(id: string): void {
		this.onBoardPassengers.push(id);
	}

	removePassenger(id: string): void {
		const index = this.onBoardPassengers.indexOf(id);
		if (index > -1) {
			this.onBoardPassengers.splice(index, 1);
		}
	}

	getPassengerAmount(): number {
		return this.onBoardPassengers.length;
	}
}
