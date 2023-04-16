import { Injectable } from '@angular/core';
import { ParseResult } from 'ngx-papaparse';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { papaParse, papaUnparse } from 'src/app/helpers/parsers';

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

	parseToVehicleData(data: any[]): VehicleEvent[] {
		const vehicleData: VehicleEvent[] = [];

		for (const line of data) {
			const vehicleEvent = new VehicleEvent(
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
				line.polylines,
				line.mode,
				line.duration
			);
			vehicleData.push(vehicleEvent);

			console.log(line, line.mode);
		}
		return vehicleData;
	}

	parseToPassengerData(data: any[]): PassengerEvent[] {
		const passengerData: PassengerEvent[] = [];
		for (const line of data) {
			// eslint-disable-next-line max-len
			const passengerEvent = new PassengerEvent(line.id, line.time, line.status, line.assigned_vehicle, line.current_location, line.previous_legs, line.current_leg, line.next_legs, line.duration);
			passengerData.push(passengerEvent);
		}
		return passengerData;
	}

	parseToFile(data: any[]): string {
		const sdata = JSON.stringify(data);
		const jdata = JSON.parse(sdata);
		const vehiclesEventsCsv = papaUnparse(jdata);
		return vehiclesEventsCsv;
	}
}
