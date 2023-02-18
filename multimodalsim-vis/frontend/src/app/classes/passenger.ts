import { Cartesian3 } from 'cesium';

export class Passenger {
	id: number;
	location: Cartesian3;
	status: string;
	assignedVehiculeId: number;

	constructor(id: number, location: Cartesian3, status: string, assignedVehiculeId: number) {
		this.id = id;
		this.location = location;
		this.status = status;
		this.assignedVehiculeId = assignedVehiculeId;
	}
}
