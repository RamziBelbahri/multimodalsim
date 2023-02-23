import { Injectable } from '@angular/core';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';
import { PassengerEvent } from 'src/app/classes/passenger-event/passenger-event';
import { papaParse } from 'src/app/helpers/parsers';
import { EntityDataHandlerService } from '../entity-data-handler/entity-data-handler.service';
@Injectable({
	providedIn: 'root',
})
export class SimulationParserService {
	private csvFile: Blob;
	private csvData: [];

	constructor(private entityDataHandlerService: EntityDataHandlerService) {
		this.csvFile = new Blob();
		this.csvData = [];
	}

	selectFile(event: Event): void {
		const target = event.target as HTMLInputElement;
		this.csvFile = (target.files as FileList)[0];
		this.readFile();
	}

	readFile(): void {
		const fileReader = new FileReader();
		fileReader.onload = () => {
			if (fileReader.result) {
				const csvString = fileReader.result.toString();
				this.parseVehicleFile(csvString);
			}
		};
		fileReader.readAsText(this.csvFile);
	}

	parseVehicleFile(csvString: string): void {
		const data = papaParse(csvString, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			transformHeader: (header) => {
				return header.replace(' ', '').toLowerCase();
			},
		}).data;
		const busData = this.parseToBusData(data);
		this.setSimulationBusData(busData);
	}


	getCSVData(): [] {
		return this.csvData;
	}

	setSimulationBusData(data: BusEvent[]): void {
		this.entityDataHandlerService.setBusData(data);
	}

	parseToBusData(data: any): BusEvent[] {
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
	parseToPassengerData(data: any): PassengerEvent[] {
		const passengerData: PassengerEvent[] = [];
		for (const line of data) {
			const passengerEvent = new PassengerEvent(line.id, line.time, line.status, line.assigned_vehicle, line.current_location, line.previous_legs,
				line.current_leg, line.next_legs, line.duration);
			passengerData.push(passengerEvent);
		}
		return passengerData;
	}
}
