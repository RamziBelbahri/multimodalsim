import { Injectable } from '@angular/core';
import { Cartesian2, Cartesian3, Viewer } from 'cesium';
import { Passenger } from 'src/app/classes/passenger';
import { CesiumClass } from 'src/app/shared/cesium-class';

@Injectable({
	providedIn: 'root',
})
export class PassengerHandlerService {
	private passengerList: Array<Passenger> = new Array<Passenger>();

	initPassenger(id: number, locationString: string, status: string, assignedVehiculeId: number, viewer: Viewer): void {
		if (!this.passengerList.some((passenger) => passenger.id === id)) {
			const locationValues = locationString.substring(1, locationString.length - 1).split(',');
			const location3D = CesiumClass.cartesian3(+locationValues[0], +locationValues[1], 0);

			this.passengerList.push(new Passenger(id, location3D, status.split('.')[1], assignedVehiculeId));
			this.createPassenger(location3D, viewer);
		}
	}

	createPassenger(location: Cartesian3, viewer: Viewer): void {
		viewer.entities.add({
			position: location,
			ellipse: {
				semiMinorAxis: 300000.0,
				semiMajorAxis: 300000.0,
				height: location.z,
				material: Cesium.Color.GREEN,
				outline: true, // height must be set for outline to display
			},
		});
	}
}
