import { Component } from '@angular/core';
import * as JSZip from 'jszip';
import {Papa} from 'ngx-papaparse';
import { SimulationParserService } from 'src/app/services/simulation-parser/simulation-parser.service';

const DEBUG = false;

@Component({
	selector: 'app-zip-handler',
	templateUrl: './zip-handler.component.html',
	styleUrls: ['./zip-handler.component.css']
})
export class ZipHandlerComponent{
	private zipper:JSZip;
	private papa:Papa;
	private csvData:Map<string, any[]>;
	private errors:string[];
	private ignored:string[];
	private directories:string[];
	private vehicleDataFileName = 'vehicles_observations_df.csv';
	private tripsDataFileName = 'trips_observations_df.csv';
	private eventObservationFileName = 'events_observations_df.csv';
	private combined = 'combined-trips-vehicle';
	private parser:SimulationParserService;
	// private attrParser:Record<string,Function> = {
	// 	"Current stop": (stop:string):string[] => {
			
	// 	}
	// }
	constructor(parser:SimulationParserService) {
		this.zipper = JSZip();
		this.papa = new Papa();
		this.csvData = new Map<string, any[]>;
		this.errors = [];
		this.directories = [];
		this.ignored = [];
		// this is purely for in case we need to add a bunch of file types in the future
		this.parser = parser;
	}

	changeListener(event:Event): void {
		this.clear();
		const input:HTMLInputElement = event.target as HTMLInputElement;
		if(input.files != null) {
			const file:File|null = input.files[input.files.length - 1];
			// so that we can call it inside the callback; otherwise this.readFiles will have errors
			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const component: ZipHandlerComponent = this;
			this.zipper.loadAsync(file).then(function(zip) {
				component.readFiles(zip);
			}).then(function() {
				input.files = null;
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
				if(extension == 'csv') {
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

	tupleStringToArray(component:ZipHandlerComponent, csvContent:any[]|undefined):void {
		if(!csvContent) {return;}
		for(const row of csvContent) {
			const attributeNames:string[] = Object.getOwnPropertyNames(row);
			for(const attributeName of attributeNames) {
				if(attributeName.includes('stop') || attributeName.includes('leg') || attributeName.includes('location')) {
					const attribute:string = row[attributeName];
					try{
						row[attributeName] = attribute == 'None' ? [] : JSON.parse(
							attribute.
								replaceAll('(', '[').
								replaceAll(')', ']').
								replaceAll('"','').
								replaceAll('\'','')
						);
					} catch(e){
						console.log(e);
					}
				}
			}
		}
	}

	readCSV(zip:any, filePath:any, component:ZipHandlerComponent):void {
		zip.file(filePath)?.async('text').then(function(txt:string) {
			console.log(typeof zip);
			try{
				const csvArray = component.papa.parse(txt,{header: true, dynamicTyping: true,transformHeader: (header) => {
					return header.replace(' ', '_').toLowerCase();
				}}).data;
				if(!(csvArray.at(-1).ID)) {
					csvArray.pop();
				}
				component.csvData.set(filePath.split('/').at(-1), csvArray);
				const readVehicles:boolean = component.csvData.has(component.vehicleDataFileName);
				const readPassengers:boolean = component.csvData.has(component.tripsDataFileName);
				if( readVehicles && readPassengers) {
					component.tupleStringToArray(component, component.csvData.get(component.vehicleDataFileName));
					component.csvData.set(
						component.vehicleDataFileName,
						component.parser.parseToBusData(
							component.csvData.get(component.vehicleDataFileName)
						)
					);
					component.tupleStringToArray(component, component.csvData.get(component.tripsDataFileName));
					component.csvData.set(
						component.tripsDataFileName,
						component.parser.parseToPassengerData(
							component.csvData.get(component.tripsDataFileName)
						)
					);
					const vehicles:any = component.csvData.get(component.vehicleDataFileName)?.map(e => ({ ... e }));
					const trips:any = component.csvData.get(component.tripsDataFileName)?.map(e => ({ ... e }));
					const vehiclesAndTrips:any = vehicles.concat(trips);
					vehiclesAndTrips.sort((a:any, b:any) => {
						const a_time:number = Date.parse(a.time);
						const b_time:number = Date.parse(b.time);
						if (a_time > b_time) return 1;
						if (a_time < b_time) return -1;
						return 0;
					});
					component.csvData.set(component.combined, vehiclesAndTrips);
					console.log(vehiclesAndTrips);
				}
			} catch(e) {
				component.errors.push((e as Error).message as string);
			}
		});
	}

	readDirectory(_:any, filePath:any, component:ZipHandlerComponent):void {
		component.directories.push(filePath);
	}

	clear():void {
		this.zipper = JSZip();
		this.papa = new Papa();
		this.csvData = new Map<string, any[]>;
		this.errors = [];
		this.directories = [];
		this.ignored = [];
	}

	getVehicleData():any {
		return this.csvData.get(this.vehicleDataFileName);
	}

	getTripsData():any {
		return this.csvData.get(this.tripsDataFileName);
	}

	getEventObservationData():any {
		return this.csvData.get(this.eventObservationFileName);
	}

	getTripsAndVehicleData():any {
		return this.csvData.get(this.combined);
	}
}
