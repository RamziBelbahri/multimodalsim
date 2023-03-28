import { Cartesian3, JulianDate } from 'cesium';

export class TimedPolyline {
	positions: Array<Array<Cartesian3>>;
	sectionTimes: Array<Array<number>>;
	times: Array<Array<JulianDate>>;
	lastSectionCompiled: number;

	constructor() {
		this.positions = new Array<Array<Cartesian3>>();
		this.sectionTimes = new Array<Array<number>>();
		this.times = new Array<Array<JulianDate>>();
		this.lastSectionCompiled = 0;
	}
}
