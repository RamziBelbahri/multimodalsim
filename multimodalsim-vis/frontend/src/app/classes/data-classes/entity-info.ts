import { Cartesian3 } from 'cesium';

export class EntityInfos {
	passengers: Array<string>;
	position: Cartesian3;
	type: string;
	id: string;

	constructor(passengers: Array<string>, position: Cartesian3, type: string, id: string) {
		this.passengers = passengers;
		this.position = position;
		this.type = type;
		this.id = id;
	}
}
