import { Cartesian3 } from 'cesium';

export class EntityInfos {
	passengers: Array<string>;
	position: Cartesian3;
	type: string;
	id: string;

	constructor(passengers: Array<string>, position: Cartesian3, type: string, id: string) {
		this.position = position;
		this.id = id;
		this.passengers = passengers;
		this.type = type;
	}
}
