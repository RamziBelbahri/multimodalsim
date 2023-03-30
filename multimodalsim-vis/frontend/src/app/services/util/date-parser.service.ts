import { Injectable } from '@angular/core';
import { JulianDate } from 'cesium';

@Injectable({
	providedIn: 'root',
})
export class DateParserService {
	// Prend une valeur en secondes et retourne la julian date associée
	parseTimeFromSeconds(time: string): JulianDate {
		const date = new Date(0);
		date.setSeconds(Number(time));

		return Cesium.JulianDate.fromDate(date);
	}

	// Ajoute la durée voulue (string) à la julian date
	addDuration(currentTime: JulianDate, duration: string): JulianDate {
		const newTime = Cesium.JulianDate.addSeconds(currentTime, Number(duration), new Cesium.JulianDate());

		return newTime;
	}

	getSeparateValueFromDate(julianDate: JulianDate): Array<string> {
		const result = new Array<string>();
		const date = Cesium.JulianDate.toDate(julianDate) as Date;
		date.setTime(date.getTime() + date.getTimezoneOffset() * 60000);
		const monthNumber = date.getMonth() + 1;

		result.push((monthNumber > 12 ? date.getFullYear() + 1 : date.getFullYear()).toString());
		result.push((monthNumber > 12 ? 1 : monthNumber).toString());
		result.push(date.getDate().toString());
		result.push(date.getHours().toString());
		result.push(date.getMinutes().toString());
		result.push(date.getSeconds().toString());

		return result;
	}
}
