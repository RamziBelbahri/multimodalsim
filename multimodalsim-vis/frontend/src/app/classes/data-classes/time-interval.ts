import { JulianDate } from 'cesium';

export class TimeInterval {
	start: JulianDate;
	end: JulianDate;

	constructor(start: JulianDate) {
		this.start = start;

		// La date de fin doit être changée séparément
		this.end = new Cesium.JulianDate();
	}
}
