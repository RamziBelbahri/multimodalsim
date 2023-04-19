import { Cartesian3 } from 'cesium';
import * as polylineEncoder from '@mapbox/polyline';

type PositionTimePair<K, V> = [Array<Cartesian3>, Array<number>];

export class RealTimePolyline {
	stopsPolylineLookup = new Map<string, PositionTimePair<Array<Cartesian3>, Array<number>>>();
	stops: string[];

	positionsInOrder: Cartesian3[] = [];
	timesDone: number[] = [];

	constructor(polylinesJSON: any, stops: string[]) {
		this.stops = stops;
		for (const [stop, _] of Object.entries(polylinesJSON)) {
			const positions = polylineEncoder.decode(polylinesJSON[stop][0].replaceAll('\\\\', '\\'));
			const cartesian3Pos = [];
			for (const position of positions) {
				cartesian3Pos.push(Cesium.Cartesian3.fromDegrees(position[1], position[0]));
			}
			if (stop) {
				this.stopsPolylineLookup.set(stop, [cartesian3Pos, polylinesJSON[stop][1]]);
			}
		}
		for (const stop of stops) {
			const segment = this.stopsPolylineLookup.get(stop);
			if (segment) {
				this.positionsInOrder.push(...segment[0]);
			}
		}
	}

	getClosestIndex(dateNumber: number): number {
		let startIndex = 0;
		let endIndex = this.timesDone.length - 1;
		let midIndex = Math.floor((startIndex + endIndex) / 2);

		while (startIndex <= endIndex) {
			midIndex = Math.floor((startIndex + endIndex) / 2);
			const element = this.timesDone[midIndex];
			if (dateNumber == element) {
				return midIndex;
			} else if (dateNumber < element) {
				endIndex = midIndex - 1;
			} else {
				startIndex = midIndex + 1;
			}
		}

		return this.timesDone.length == 0 ? 0 : Math.max(0, endIndex);
	}
}
