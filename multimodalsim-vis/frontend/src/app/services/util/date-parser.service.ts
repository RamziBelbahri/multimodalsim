import { Injectable } from '@angular/core';
import { JulianDate } from 'cesium';

@Injectable({
	providedIn: 'root',
})
export class DateParserService {
	private readonly SECONDS_IN_HOUR = 3600;
	private readonly SECONDS_IN_MINUTE = 60;
	private readonly TIMEZONE_SHIFT = -5;

	// Prend une date en string et la retourne en julian date (utilisé par Césium).
	parseTimeFromSeconds(time: number): JulianDate {
		const date = new Date(0);
		date.setSeconds(Number(time));

		return Cesium.JulianDate.fromDate(date);
	}

	// Retourne le nombre de secondes, minutes et heures de la durée en string
	private parseDurationFromString(duration: string): string[] {
		const dateSplit = duration.split(' ');

		return dateSplit[2].split(':');
	}

	// Ajoute la durée voulue (string) à la julian date
	addDuration(currentTime: JulianDate, duration: string): JulianDate {
		const timeValues = this.parseDurationFromString(duration);
		const seconds = Number(timeValues[0]) * this.SECONDS_IN_HOUR + Number(timeValues[1]) * this.SECONDS_IN_MINUTE + Number(timeValues[2]);

		const newTime = Cesium.JulianDate.addSeconds(currentTime, seconds, new Cesium.JulianDate());

		return newTime;
	}

	// temporary
	toDateString(duration:number):string {
		// const currentTimeInSeconds:number = +Date.parse(currentTime).toFixed(0) 	/ 1000;
		// const previousTimeInSeconds:number = +Date.parse(previousTime).toFixed(0)	/ 1000;

		// const duration = currentTime - previousTime;
		const days  = Math.floor(duration / (24*60*60))
		const hours = Math.floor((duration - days * (24*60*60)) / (60*60))
		const minutes = Math.floor(
			(
				duration - days * (24*60*60) - hours * (60 * 60)
			) / 60
		)
		const seconds = (
			duration - days * (24*60*60) - hours * (60 * 60) - minutes * 60
		)
		
		return days.toString() + ' days ' +
			(hours < 10 ? '0' + hours.toString() : hours.toString()) + ':' +
			(minutes < 10 ? '0' + minutes.toString() : minutes.toString()) + ':' +
			(seconds < 10 ? '0' + seconds.toString() : seconds.toString())
	
	}
}
