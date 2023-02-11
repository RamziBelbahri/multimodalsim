import { Component } from '@angular/core';
import * as JSZip from 'jszip';
import {Papa} from 'ngx-papaparse';

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

	private dict:Map<string, Function>;
	constructor() {
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
	}

	changeListener(event:Event): void {
		this.clear();
		let input:HTMLInputElement = event.target as HTMLInputElement;
		if(input.files != null) {
			let file:File = input.files[0];
			let reader:FileReader = new FileReader();
			reader.onload = function() {
				console.log(reader.result)
			}
			// so that we can call it inside the callback
			let component: ZipHandlerComponent = this;
			this.zipper.loadAsync(file).then(function(zip) {
				component.readFiles(zip);
			});
		}
	}
	readFiles(zip:any) {
		let component:ZipHandlerComponent = this;
		if(zip.files != undefined) {
			console.log(zip.constructor.name)
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

	readCSV(zip:any, filePath:any, component:ZipHandlerComponent):void {
		zip.file(filePath)?.async('text').then(function(txt:string) {
			try{
				let csvArray = component.papa.parse(txt,{header: true, dynamicTyping: true}).data;
				for(let row of csvArray) {
					row.Time = Date.parse(row.Time);
					if(Number.isNaN(row.Time)) {
						row.Time = 9007199254740991;
					}
				}
				component.csvData.set(filePath.split("/").at(-1), csvArray);				
				if(component.csvData.has(component.vehicleDataFileName) &&
					component.csvData.has(component.tripsDataFileName)) {
					let vehicle:any = component.csvData.get(component.vehicleDataFileName)?.map(e => ({ ... e }));
					let trips:any = component.csvData.get(component.tripsDataFileName)?.map(e => ({ ... e }));
					vehicle = vehicle.concat(trips);
					vehicle.sort((a:any, b:any) => {
						if (a.Time > b.Time) return 1;
						if (a.Time < b.Time) return -1;
						return 0;
					})
					console.log(vehicle)
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
		this.csvData = new Map<string, any[]>();
		this.errors = [];
		this.ignored = [];
		this.directories = [];
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
