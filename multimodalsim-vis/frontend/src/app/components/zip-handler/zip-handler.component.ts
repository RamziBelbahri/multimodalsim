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
	private vehicleDataFileName:string = "vehicles_observations_df.csv";
	private tripsDataFileName:string = "trips_observations_df.csv";
	private eventObservationFileName:string = "events_observations_df.csv";
	private combined:string = "combined-trips-vehicle";
	private parser:SimulationParserService;
	// private attrParser:Record<string,Function> = {
	// 	"Current stop": (stop:string):string[] => {
			
	// 	}
	// }

	private dict:Map<string, Function>;
	constructor(parser:SimulationParserService) {
		this.zipper = JSZip();
		this.papa = new Papa();
		this.csvData = new Map<string, any[]>;
		this.errors = [];
		this.directories = [];
		this.ignored = [];
		// this is purely for in case we need to add a bunch of file types in the future
		this.dict = new Map<string, Function>();
		this.dict.set("csv", this.readCSV);
		this.dict.set("/", this.readDirectory);
		this.parser = parser;
	}

	changeListener(event:Event): void {
		this.clear();
		let input:HTMLInputElement = event.target as HTMLInputElement;
		if(input.files != null) {
			let file:File|null = input.files[input.files.length - 1];
			// so that we can call it inside the callback
			let component: ZipHandlerComponent = this;
			this.zipper.loadAsync(file).then(function(zip) {
				component.readFiles(zip);
			}).then(function() {
				input.files = null;
			});
		}
	}
	readFiles(zip:any) {
		let component:ZipHandlerComponent = this;
		if(zip.files != undefined) {
			for(let filePath in zip.files) {
				let extension:string;
				try {
					let tmp = filePath.toLowerCase().split(".")
					extension = tmp[tmp.length - 1]
				} catch (e) {
					extension = "/"
				}
				if(this.dict.has(extension)) {
					let handler:Function|undefined = this.dict.get(extension);
					if(handler != undefined) handler(zip, filePath, component)
				} else {
					component.ignored.push(filePath)
				}
			}
		}
	}

	tupleStringToArray(component:ZipHandlerComponent, csvContent:any[]|undefined):void {
		if(!csvContent) {return}
		for(let row of csvContent) {
			let attributeNames:string[] = Object.getOwnPropertyNames(row);
			for(let attributeName of attributeNames) {
				if(attributeName.includes("stop") || attributeName.includes("leg") || attributeName.includes("location")) {
					let attribute:string = row[attributeName]
					try{
						row[attributeName] = attribute == 'None' ? [] : JSON.parse(
							attribute.
							replaceAll("(", "[").
							replaceAll(")", "]").
							replaceAll("\"","").
							replaceAll("\'","")
						);
					} catch(e){
						console.log(e)
					}
				}
			}
		}
	}

	readCSV(zip:any, filePath:any, component:ZipHandlerComponent):void {
		zip.file(filePath)?.async('text').then(function(txt:string) {
			try{
				let csvArray = component.papa.parse(txt,{header: true, dynamicTyping: true,transformHeader: (header) => {
					return header.replace(" ", "_").toLowerCase();
				}}).data;
				if(!(csvArray.at(-1).ID)) {
					csvArray.pop();
				}
				component.csvData.set(filePath.split("/").at(-1), csvArray);
				let readVehicles:boolean = component.csvData.has(component.vehicleDataFileName);
				let readPassengers:boolean = component.csvData.has(component.tripsDataFileName);
				if( readVehicles && readPassengers) {
					component.tupleStringToArray(component, component.csvData.get(component.vehicleDataFileName))
					component.csvData.set(
						component.vehicleDataFileName,
						component.parser.parseToBusData(
							component.csvData.get(component.vehicleDataFileName)
						)
					);
					component.tupleStringToArray(component, component.csvData.get(component.tripsDataFileName))
					component.csvData.set(
						component.tripsDataFileName,
						component.parser.parseToPassengerData(
							component.csvData.get(component.tripsDataFileName)
						)
					);
					let vehicles:any = component.csvData.get(component.vehicleDataFileName)?.map(e => ({ ... e }));
					let trips:any = component.csvData.get(component.tripsDataFileName)?.map(e => ({ ... e }));
					let vehiclesAndTrips:any = vehicles.concat(trips);
					vehiclesAndTrips.sort((a:any, b:any) => {
						let a_time:number = Date.parse(a.time);
						let b_time:number = Date.parse(b.time);
						if (a_time > b_time) return 1;
						if (a_time < b_time) return -1;
						return 0;
					})
					component.csvData.set(component.combined, vehiclesAndTrips);
					console.log(vehiclesAndTrips)
				}
			} catch(e) {
				component.errors.push((e as Error).message as string)
			}
		})
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
		return this.dict.get(this.vehicleDataFileName);
	}

	getTripsData():any {
		return this.dict.get(this.tripsDataFileName);
	}

	getEventObservationData():any {
		return this.dict.get(this.eventObservationFileName);
	}

	getTripsAndVehicleData():any {
		return this.dict.get(this.combined);
	}
}
