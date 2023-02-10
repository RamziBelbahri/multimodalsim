import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';
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
	}

	readFile(): void {
		const fileReader = new FileReader();
		fileReader.onload = () => {
			if (fileReader.result) {
				this.parseFile(fileReader.result.toString());
			}
		};
		fileReader.readAsText(this.csvFile);
	}

	parseFile(csvString: string): void {
		const data = papaParse(csvString, {
			header: true,
			dynamicTyping: true,
			skipEmptyLines: true,
			transformHeader: (header) => {
				return header.replace(/\s/g, '').toLowerCase();
			},
		}).data;
		const busData = this.parseToBusData(data);
		this.setSimulationData(busData);
	}

	getCSVData(): [] {
		return this.csvData;
	}

	setSimulationData(data: BusEvent[]): void {
		this.entityDataHandlerService.setData(data);
	}

	parseToBusData(data: any): BusEvent[] {

		const busData: BusEvent[] = [];

		for (const line of data) {
			const busEvent = new BusEvent(
				line.id,
				line.time,
				line.status,
				line.previousstops,
				line.currentstops,
				line.nextstops,
				line.assignedlegs,
				line.onboardlegs,
				line.alightedlegs,
				line.cumulativedistance,
				line.longitude,
				line.latitude,
				line.duration
			);
			busData.push(busEvent);
		}
		return busData;
	}
}
