import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';
import { EntityPositionHandlerService } from '../cesium/entity-position-handler.service';
@Injectable({
	providedIn: 'root',
})
export class SimulationParserService {
	private csvFile: Blob;
	private csvData: [];

	constructor() {
		this.csvFile = new Blob();
		this.csvData = [];
	}

	selectFile(event: Event, isStopIDs = false): void {
		const target = event.target as HTMLInputElement;
		this.csvFile = (target.files as FileList)[0];
		this.readFile(isStopIDs);
	}

	readFile(isStopIDs = false): void {
		const fileReader = new FileReader();
		fileReader.onload = () => {
			if (fileReader.result) {
				this.parseFile(fileReader.result.toString(),isStopIDs);
			}
		};
		fileReader.readAsText(this.csvFile);
	}

	parseFile(csvString: string,isStopIDs = false): void {
		const papa = new Papa();
		this.csvData = papa.parse(csvString, { header: true, dynamicTyping: true }).data;
		if(isStopIDs) {
			for(const line of this.csvData) {
				EntityPositionHandlerService.STOPID_LOOKUP.set(line['stop_id'], line);
			}
		}
	}

	getCSVData(): [] {
		return this.csvData;
	}
}
