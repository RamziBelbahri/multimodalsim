/* eslint-disable @typescript-eslint/ban-types */
import { Component } from '@angular/core';
import * as JSZip from 'jszip';
import { Papa } from 'ngx-papaparse';
import { SimulationParserService } from 'src/app/services/simulation-parser/simulation-parser.service';
// import { papaParse } from 'src/app/helpers/parsers';
import { EntityPositionHandlerService } from 'src/app/services/cesium/entity-position-handler.service';
import { EntityDataHandlerService } from 'src/app/services/entity-data-handler/entity-data-handler.service';
const DEBUG = false;

@Component({
	selector: 'app-zip-handler',
	templateUrl: './zip-handler.component.html',
	styleUrls: ['./zip-handler.component.css'],
})
export class ZipHandlerComponent{
	private zipper:JSZip;
	private papa:Papa;
	private csvData:Set<string>;
	private errors:string[];
	private ignored:string[];
	private directories:string[];
	private vehicleDataFileName = 'vehicles_observations_df.csv';
	private tripsDataFileName = 'trips_observations_df.csv';
	private eventObservationFileName = 'events_observations_df.csv';
	private combined = 'combined-trips-vehicle';
	public parser:SimulationParserService;
	public static zipHandler:ZipHandlerComponent;
	private input:HTMLInputElement|undefined;

	constructor(parser:SimulationParserService,
		public entityDataHandlerService:EntityDataHandlerService) {
		this.zipper = JSZip();
		this.papa = new Papa();
		this.csvData = new Set<string>();
		this.errors = [];
		this.directories = [];
		this.ignored = [];
		// this is purely for in case we need to add a bunch of file types in the future
		this.parser = parser;
		ZipHandlerComponent.zipHandler = this;
	}

	changeListener(event: Event): void {
		this.clear();
		this.input = event.target as HTMLInputElement;
	}

	readZipContent() {
		// const input:HTMLInputElement = event.target as HTMLInputElement;
		if(this.input == undefined) {return;}
		if(this.input.files != null) {
			const file:File|null = this.input.files[this.input.files.length - 1];
			// so that we can call it inside the callback; otherwise this.readFiles will have errors
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const component: ZipHandlerComponent = this;
			this.zipper.loadAsync(file).then(function(zip) {
				component.readFiles(zip);
			}).then(function() {
				if(component.input != undefined)
					component.input.files = null;
			});
		}
	}
	readFiles(zip:any) {
		// this is needed so that this doesnt bug in the callbacks
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const component:ZipHandlerComponent = this;
		if(zip.files != undefined) {
			for(const filePath in zip.files) {
				let extension:string;
				try {
					const tmp = filePath.toLowerCase().split('.');
					extension = tmp[tmp.length - 1];
				} catch (e) {
					extension = '/';
				}
				if(extension == 'csv' || extension == 'txt') {
					component.readCSV(zip, filePath, component);
				} else if (extension == '\'') {
					component.readDirectory(zip, filePath, component);
				}
				else {
					component.ignored.push(filePath);
				}
			}
		}
	}

	tupleStringToArray(component: ZipHandlerComponent, csvContent: any[] | undefined): void {
		if (!csvContent) {
			return;
		}
		for (const row of csvContent) {
			const attributeNames: string[] = Object.getOwnPropertyNames(row);
			for (const attributeName of attributeNames) {
				if (attributeName.includes('stop') || attributeName.includes('leg') || attributeName.includes('location')) {
					const attribute: string = row[attributeName];
					try {
						row[attributeName] = attribute == 'None' ? [] : JSON.parse(attribute.replaceAll('(', '[').replaceAll(')', ']').replaceAll('"', '').replaceAll('\'', ''));
					} catch (e) {
						console.log(e);
					}
				}
			}
		}
	}

	parseStopsFile(csvArray: Array<any>): void {
		for (const line of csvArray) {
			EntityPositionHandlerService.STOPID_LOOKUP.set(line['stop_id'], line);
		}
	}

	setPassengerData(data:any[], component:ZipHandlerComponent) {
		component.entityDataHandlerService.setPassengerData(component.parser.parseToPassengerData(data));
	}

	setBusData(data:any[],component:ZipHandlerComponent) {
		component.entityDataHandlerService.setBusData(component.parser.parseToBusData(data));
	}

	setEventObservation(data:any[], component:ZipHandlerComponent) {
		component.entityDataHandlerService.setEventObservations(data);
	}

	readCSV(zip: any, filePath: any, component: ZipHandlerComponent): void {
		zip
			.file(filePath)
			?.async('text')
			.then(function (txt: string) {
				try {
					const csvArray = component.papa.parse(txt, {
						header: true,
						dynamicTyping: true,
						transformHeader: (header) => {
							return header.replace(' ', '_').toLowerCase();
						},
					}).data;
					if(filePath.toString().endsWith('stops.txt')) {
						component.parseStopsFile(csvArray);
					}
					if (!csvArray.at(-1).id && !csvArray.at(-1).stops_id) {
						csvArray.pop();
					}
					component.csvData.add(filePath.split('/').at(-1));
					const readVehicles: boolean = component.csvData.has(component.vehicleDataFileName);
					const readPassengers: boolean = component.csvData.has(component.tripsDataFileName);
					
					if(filePath.toString().endsWith(component.vehicleDataFileName)) {
						component.setBusData(csvArray, component);
					} else if(filePath.toString().endsWith(component.tripsDataFileName)) {
						component.setPassengerData(csvArray, component);
					} else if(filePath.toString().endsWith(component.eventObservationFileName)) {
						component.setEventObservation(csvArray, component);
					}
					if(readVehicles && readPassengers && !component.csvData.has(component.combined)) {
						component.entityDataHandlerService.combinePassengerAndBusEvents(component);
						component.csvData.add(component.combined);
					}
				} catch (e) {
					component.errors.push((e as Error).message as string);
				}
			});
	}

	readDirectory(_: any, filePath: any, component: ZipHandlerComponent): void {
		component.directories.push(filePath);
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
