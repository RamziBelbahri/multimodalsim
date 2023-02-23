import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { Papa } from 'ngx-papaparse';
import { SimulationParserService } from 'src/app/services/simulation-parser/simulation-parser.service';
import { EntityPositionHandlerService } from 'src/app/services/cesium/entity-position-handler.service';
import { EntityDataHandlerService } from 'src/app/services/entity-data-handler/entity-data-handler.service';
const DEBUG = false;

@Injectable({
	providedIn: 'root',
})
export class ZipParserService {
	private zipper: JSZip;
	private papa: Papa;
	private csvData: Set<string>;
	private errors: string[];
	private ignored: string[];
	private directories: string[];
	private vehicleDataFileName = 'vehicles_observations_df.csv';
	private tripsDataFileName = 'trips_observations_df.csv';
	private eventObservationFileName = 'events_observations_df.csv';
	private combined = 'combined-trips-vehicle';
	private input: HTMLInputElement | undefined;

	constructor(private parser: SimulationParserService, private entityDataHandlerService: EntityDataHandlerService) {
		this.zipper = JSZip();
		this.papa = new Papa();
		this.csvData = new Set<string>();
		this.errors = [];
		this.directories = [];
		this.ignored = [];
	}

	changeListener(event: Event): void {
		this.clear();
		this.input = event.target as HTMLInputElement;
	}

	readZipContent() {
		if (this.input && this.input.files != null) {
			const file: File = this.input.files[this.input.files.length - 1];
			this.zipper
				.loadAsync(file)
				.then((zip: JSZip) => {
					this.readFiles(zip);
				})
				.then(() => {
					if (this.input) this.input.files = null;
				});
		}
	}
	readFiles(zip: JSZip) {
		if (zip.files) {
			for (const filePath in zip.files) {
				let extension: string;
				try {
					const tmp = filePath.toLowerCase().split('.');
					extension = tmp[tmp.length - 1];
				} catch (error) {
					extension = '/';
					console.log(error);
				}
				switch (extension) {
				case 'csv':
				case 'txt':
					this.readCSV(zip, filePath);
					break;
				case '\'':
					this.readDirectory(zip, filePath);
					break;
				default:
					this.ignored.push(filePath);
				}
			}
		}
	}

	parseStopsFile(stops: []): void {
		for (const line of stops) {
			EntityPositionHandlerService.STOPID_LOOKUP.set(line['stop_id'], line);
		}
	}

	setPassengerData(data: []) {
		this.entityDataHandlerService.setPassengerData(this.parser.parseToPassengerData(data));
	}

	setBusData(data: []) {
		this.entityDataHandlerService.setBusData(this.parser.parseToBusData(data));
	}

	setEventObservation(data: []) {
		this.entityDataHandlerService.setEventObservations(data);
	}

	readCSV(zip: JSZip, filePath: string): void {
		zip
			.file(filePath)
			?.async('text')
			.then((txt: string) => {
				try {
					const csvArray = this.papa.parse(txt, {
						header: true,
						dynamicTyping: true,
						transformHeader: (header) => {
							return header.replace(' ', '_').toLowerCase();
						},
					}).data;
					if (filePath.toString().endsWith('stops.txt')) {
						this.parseStopsFile(csvArray);
					}
					if (!csvArray.at(-1).id && !csvArray.at(-1).stops_id) {
						csvArray.pop();
					}
					this.csvData.add((filePath.split('/').at(-1)) as string);
					const hasVehicles: boolean = this.csvData.has(this.vehicleDataFileName);
					const hasPassengers: boolean = this.csvData.has(this.tripsDataFileName);

					if (filePath.toString().endsWith(this.vehicleDataFileName)) {
						this.setBusData(csvArray);
					} else if (filePath.toString().endsWith(this.tripsDataFileName)) {
						this.setPassengerData(csvArray);
					} else if (filePath.toString().endsWith(this.eventObservationFileName)) {
						this.setEventObservation(csvArray);
					}
					if (hasVehicles && hasPassengers && !this.csvData.has(this.combined)) {
						this.entityDataHandlerService.combinePassengerAndBusEvents();
						this.csvData.add(this.combined);
					}
				} catch (error) {
					this.errors.push((error as Error).message as string);
				}
			});
	}

	readDirectory(_: JSZip, filePath: string): void {
		this.directories.push(filePath);
	}

	clear(): void {
		this.zipper = JSZip();
		this.papa = new Papa();
		this.csvData = new Set<string>();
		this.errors = [];
		this.directories = [];
		this.ignored = [];
	}
}
