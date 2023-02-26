import { Injectable } from '@angular/core';
import { JulianDate } from 'cesium';

@Injectable({
	providedIn: 'root',
})
export class DateParserService {
	private readonly SECONDS_IN_HOUR = 3600;
	private readonly SECONDS_IN_MINUTE = 60;

	parseTimeFromString(time: string): JulianDate {
		const dateSplit = time.split(' ');
		const date = new Date(dateSplit[0]);
		const timeSplit = dateSplit[1].split(':');

		date.setHours(Number(timeSplit[0]));
		date.setMinutes(Number(timeSplit[1]));
		date.setSeconds(Number(timeSplit[2]));

		return JulianDate.fromDate(date);
	}

	private parseDurationFromString(duration: string): string[] {
		const dateSplit = duration.split(' ');

		return dateSplit[2].split(':');
	}

	addDuration(currentTime: JulianDate, duration: string): JulianDate {
		const timeValues = this.parseDurationFromString(duration);
		const seconds = Number(timeValues[0]) * this.SECONDS_IN_HOUR + Number(timeValues[1]) * this.SECONDS_IN_MINUTE + Number(timeValues[2]);

		const newTime = JulianDate.addSeconds(currentTime, seconds, new Cesium.JulianDate());

		return newTime;
	}
}
