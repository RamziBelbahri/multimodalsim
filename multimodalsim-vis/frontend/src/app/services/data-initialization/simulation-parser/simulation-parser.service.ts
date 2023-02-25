import { Injectable } from '@angular/core';
import { ParseResult } from 'ngx-papaparse';
import { BusEvent } from 'src/app/classes/data-classes/bus-class/bus-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { papaParse } from 'src/app/helpers/parsers';

@Injectable({
	providedIn: 'root',
})
export class SimulationParserService {

	parseFile(txt: string): ParseResult {
		return papaParse(txt, {
			header: true,
			dynamicTyping: true,
			transformHeader: (header) => {
				return header.replace(' ', '_').toLowerCase();
			},
		});
	}

	parseToBusData(data: any[]): BusEvent[] {
		const busData: BusEvent[] = [];

		for (const line of data) {
			const busEvent = new BusEvent(
				line.id,
				line.time,
				line.status,
				line.previous_stops,
				line.current_stop,
				line.next_stops,
				line.assigned_legs,
				line.onboard_legs,
				line.alighted_legs,
				line.cumulative_distance,
				line.longitude,
				line.latitude,
				line.duration
			);
			busData.push(busEvent);
		}
		return busData;
	}
  
	parseToPassengerData(data: any[]): PassengerEvent[] {
		const passengerData: PassengerEvent[] = [];
		for (const line of data) {
			const passengerEvent = new PassengerEvent(line.id, line.time, line.status, line.assigned_vehicle,
				line.current_location, line.previous_legs, line.current_leg, line.next_legs, line.duration);
			passengerData.push(passengerEvent);
		}
		return passengerData;
	}
}
