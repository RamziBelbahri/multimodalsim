import { Injectable } from '@angular/core';
import * as JSZip from 'jszip';
import { SimulationParserService } from 'src/app/services/data-initialization/simulation-parser/simulation-parser.service';
import { EntityDataHandlerService } from 'src/app/services/entity-data-handler/entity-data-handler.service';
import { FileType } from 'src/app/classes/file-classes/file-type';
import { Viewer } from 'cesium';
import { StopLookupService } from '../../util/stop-lookup.service';
import { CesiumClass } from 'src/app/shared/cesium-class';

@Injectable({
	providedIn: 'root',
})
export class DataReaderService {
	private zipper: JSZip;
	private csvData: Set<string>;
	private errors: string[];
	private ignored: string[];
	private directories: string[];
	private readonly COMBINED = 'combined-trips-vehicle';
	private zipInput: HTMLInputElement | undefined;
	private csvInput: Blob;

	constructor(private simulationParserService: SimulationParserService, private entityDataHandlerService: EntityDataHandlerService, private stopLookup: StopLookupService) {
		this.zipper = JSZip();
		this.csvData = new Set<string>();
		this.errors = [];
		this.directories = [];
		this.ignored = [];
		this.csvInput = new Blob();
	}

	launchSimulation(viewer: Viewer): void {
		this.entityDataHandlerService.runVehiculeSimulation(viewer);
	}

	selectZip(event: Event): void {
		this.clear();
		this.zipInput = event.target as HTMLInputElement;
	}

	selectFile(event: Event): void {
		const target = event.target as HTMLInputElement;
		this.csvInput = (target.files as FileList)[0];
	}

	readZipContent(): void {
		if (this.zipInput && this.zipInput.files != null) {
			const file: File = this.zipInput.files[this.zipInput.files.length - 1];
			this.zipper
				.loadAsync(file)
				.then((zip: JSZip) => {
					this.readFiles(zip);
				})
				.then(() => {
					if (this.zipInput) this.zipInput.files = null;
				});
		}
	}

	private readFiles(zip: JSZip): void {
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
					this.readCSV(filePath, zip);
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

	readCSV(filePath?: string, zip?: JSZip): void {
		if (zip && filePath) {
			zip
				.file(filePath)
				?.async('text')
				.then((txt: string) => {
					this.readFileData(txt, filePath);
				});
		}
	}

	private readFileData(txt: string, filePath: string): void {
		try {
			const csvArray = this.simulationParserService.parseFile(txt).data;
			if (filePath.toString().endsWith('stops.txt')) {
				this.parseStopsFile(csvArray);
				this.setStops(csvArray);
			}
			if (!csvArray.at(-1).id && !csvArray.at(-1).stops_id) {
				csvArray.pop();
			}
			this.csvData.add(filePath.split('/').at(-1) as string);
			const hasVehicles: boolean = this.csvData.has(FileType.VEHICLES_OBSERVATIONS_FILE_NAME);
			const hasPassengers: boolean = this.csvData.has(FileType.TRIPS_OBSERVATIONS_FILE_NAME);

			this.setFileData(filePath, csvArray);
			if (hasVehicles && hasPassengers && !this.csvData.has(this.COMBINED)) {
				this.entityDataHandlerService.combinePassengerAndVehicleEvents();
				this.csvData.add(this.COMBINED);
			}
		} catch (error) {
			this.errors.push((error as Error).message as string);
		}
	}

	private setFileData(filePath: string, csvArray: any): void {
		if (filePath.toString().endsWith(FileType.VEHICLES_OBSERVATIONS_FILE_NAME)) {
			this.setVehicleData(csvArray);
		} else if (filePath.toString().endsWith(FileType.TRIPS_OBSERVATIONS_FILE_NAME)) {
			this.setPassengerData(csvArray);
		} else if (filePath.toString().endsWith(FileType.EVENTS_OBSERVATIONS_FILE_NAME)) {
			this.setEventObservations(csvArray);
		}
	}

	private parseStopsFile(stops: []): void {
		for (const line of stops) {
			this.stopLookup.coordinatesIdMapping.set(Number(line['stop_id']), CesiumClass.cartesianDegrees(line['stop_lon'], line['stop_lat']));
		}
	}

	private setPassengerData(data: []): void {
		this.entityDataHandlerService.setPassengerData(this.simulationParserService.parseToPassengerData(data));
	}

	private setVehicleData(data: []): void {
		this.entityDataHandlerService.setVehicleData(this.simulationParserService.parseToVehicleData(data));
	}

	private setEventObservations(data: []): void {
		this.entityDataHandlerService.setEventObservations(data);
	}

	private setStops(data: any): void {
		this.entityDataHandlerService.setStops(data);
	}

	private readDirectory(_: JSZip, filePath: string): void {
		this.directories.push(filePath);
	}

	private clear(): void {
		this.zipper = JSZip();
		this.csvData = new Set<string>();
		this.errors = [];
		this.directories = [];
		this.ignored = [];
	}
}
