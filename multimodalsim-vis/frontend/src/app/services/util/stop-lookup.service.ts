import { Injectable } from '@angular/core';
import { Cartesian3 } from 'cesium';
import { CesiumClass } from 'src/app/shared/cesium-class';

@Injectable({
	providedIn: 'root',
})
export class StopLookupService {
	private coordinatesIdMapping: Map<number, string> = new Map<number, string>();

	setLine(id: number, line: string): void {
		this.coordinatesIdMapping.set(id, line);
	}

	coordinatesFromStopId(id: number): Cartesian3 {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const stop = this.coordinatesIdMapping.has(id) ? '' : (this.coordinatesIdMapping.get(id) as any);
		return CesiumClass.cartesianDegrees(stop.stop_lon, stop.stop_lat);
	}
}
