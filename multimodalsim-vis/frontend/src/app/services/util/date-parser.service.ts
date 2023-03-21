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
}
