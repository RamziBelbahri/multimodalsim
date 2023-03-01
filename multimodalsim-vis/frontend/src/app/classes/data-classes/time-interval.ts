import { JulianDate } from 'cesium';

export class TimeInterval {
	start: JulianDate;
	end: JulianDate;

	constructor(start: JulianDate) {
		this.start = start;
		this.end = new Cesium.JulianDate();
	}
}
