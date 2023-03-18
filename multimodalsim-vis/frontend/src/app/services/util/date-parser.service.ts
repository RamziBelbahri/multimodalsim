import { Injectable } from '@angular/core';
import { JulianDate } from 'cesium';

@Injectable({
	providedIn: 'root',
})
export class DateParserService {
	/*private readonly SECONDS_IN_HOUR = 3600;
	private readonly SECONDS_IN_MINUTE = 60;
	private readonly TIMEZONE_SHIFT = -5;*/

	// Prend une date en string et la retourne en julian date (utilisé par Césium).
	/*parseTimeFromString(time: string): JulianDate {
		const dateSplit = time.split(' ');
		const date = new Date(dateSplit[0]);
		const timeSplit = dateSplit[1].split(':');

		date.setHours(Number(timeSplit[0]) + this.TIMEZONE_SHIFT);
		date.setMinutes(Number(timeSplit[1]));
		date.setSeconds(Number(timeSplit[2]));

		return Cesium.JulianDate.fromDate(date);
	}*/

	// Prend une valeur en secondes et retourne la julian date associée
	parseTimeFromSeconds(time: string): JulianDate {
		const date = new Date(0);
		date.setSeconds(Number(time));

		return Cesium.JulianDate.fromDate(date);
	}

	// Retourne le nombre de secondes, minutes et heures de la durée en string
	/*private parseDurationFromString(duration: string): string[] {
		const dateSplit = duration.split(' ');

		return dateSplit[2].split(':');
	}*/

	// Ajoute la durée voulue (string) à la julian date
	addDuration(currentTime: JulianDate, duration: string): JulianDate {
		//const seconds = Number(timeValues[0]) * this.SECONDS_IN_HOUR + Number(timeValues[1]) * this.SECONDS_IN_MINUTE + Number(timeValues[2]);

		const newTime = Cesium.JulianDate.addSeconds(currentTime, Number(duration), new Cesium.JulianDate());
		console.log('AAAA   ' + currentTime);
		console.log('BBBB   ' + newTime);

		return newTime;
	}
}
