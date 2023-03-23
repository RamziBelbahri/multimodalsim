import { Cartesian3 } from 'cesium';

export class TimedPolyline {
	positions: Array<Array<Cartesian3>>;
	times: Array<Array<number>>;
	lastSectionCompiled: number;

	constructor() {
		this.positions = new Array<Array<Cartesian3>>();
		this.times = new Array<Array<number>>();
		this.lastSectionCompiled = 0;
	}
}
