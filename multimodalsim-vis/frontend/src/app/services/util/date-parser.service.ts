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
	parseTimeFromString(time: string): JulianDate {
		const dateSplit = time.split(' ');
		const date = new Date(dateSplit[0]);
		const timeSplit = dateSplit[1].split(':');

		date.setHours(Number(timeSplit[0]) + this.TIMEZONE_SHIFT);
		date.setMinutes(Number(timeSplit[1]));
		date.setSeconds(Number(timeSplit[2]));

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

	substractDateString(currentTime:string, previousTime:string):string {
		currentTime = currentTime.replace(' days ', ':');
		previousTime = previousTime.replace(' days ', ':');
		const previousTimeSplit = previousTime.split(':');
		let previousTimeInSeconds = 0;
		previousTimeInSeconds += +previousTimeSplit[0] * 24 * 60 * 60; // days
		previousTimeInSeconds += +previousTimeSplit[1] * 60 * 60; // hours
		previousTimeInSeconds += +previousTimeSplit[2] * 60; // minutes
		previousTimeInSeconds += +previousTimeSplit[3]; // seconds

		const currentTimeSplit = currentTime.split(':')
		let currentTimeInSeconds = 0;
		currentTimeInSeconds += +currentTimeSplit[0] * 24 * 60 * 60; // days
		currentTimeInSeconds += +currentTimeSplit[1] * 60 * 60; // hours
		currentTimeInSeconds += +currentTimeSplit[2] * 60; // minutes
		currentTimeInSeconds += +currentTimeSplit[3]; // seconds

		const duration = currentTimeInSeconds - previousTimeInSeconds;
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
