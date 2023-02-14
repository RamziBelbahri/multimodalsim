import { Injectable } from '@angular/core';
import { Papa } from 'ngx-papaparse';
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

	selectFile(event: Event): void {
		const target = event.target as HTMLInputElement;
		this.csvFile = (target.files as FileList)[0];
		this.readFile();
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
		const papa = new Papa();
		this.csvData = papa.parse(csvString, { header: true, dynamicTyping: true }).data;
	}

	getCSVData(): [] {
		return this.csvData;
	}
}
