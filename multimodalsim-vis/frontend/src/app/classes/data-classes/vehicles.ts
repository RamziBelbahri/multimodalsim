import { SampledPositionProperty } from 'cesium';
import { VehicleColor } from './vehicle-color';
export class Vehicle {
	private onBoardPassengers = new Array<string>();

	path: SampledPositionProperty;
	id: string;
	type: string;
	currentColor:VehicleColor = VehicleColor.GREEN;

	constructor(id: string, type: string) {
		this.id = id;
		this.path = new Cesium.SampledPositionProperty();
		this.type = type;
	}

	addPassenger(id: string): void {
		this.onBoardPassengers.push(id);
	}

	getOnBoardPassengers(): Array<string> {
		return this.onBoardPassengers;
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
