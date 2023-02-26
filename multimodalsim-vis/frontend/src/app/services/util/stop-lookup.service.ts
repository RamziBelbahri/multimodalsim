import { Injectable } from '@angular/core';
import { Cartesian3 } from 'cesium';
import { CesiumClass } from 'src/app/shared/cesium-class';

@Injectable({
	providedIn: 'root',
})
export class StopLookupService {
	coordinatesIdMapping: Map<number, Cartesian3> = new Map<number, Cartesian3>();

	coordinatesFromStopId(id: number): Cartesian3 {
		const stop = this.coordinatesIdMapping.get(id);

		if (stop) {
			return stop;
		} else {
			console.log('stop not found');
			return CesiumClass.cartesianDegrees(0, 0);
		}
	}
}
