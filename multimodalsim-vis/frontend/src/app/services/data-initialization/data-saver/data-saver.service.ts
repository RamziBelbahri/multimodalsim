import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { EventObservation } from 'src/app/classes/data-classes/event-observation/event-observation';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { FileType } from 'src/app/classes/file-classes/file-type';
import { SimulationParserService } from '../simulation-parser/simulation-parser.service';

@Injectable({
	providedIn: 'root',
})
export class DataSaverService {
	private vehicleEvents: VehicleEvent[];
	private passengerEvents: PassengerEvent[];
	private eventObservations: EventObservation[];
	savedSimPaths: string[];
	private stops: any[] = [];
	constructor(private parser: SimulationParserService) {
		this.vehicleEvents = [];
		this.passengerEvents = [];
		this.eventObservations = [];
		this.savedSimPaths = [];
	}

	async saveAsZip(): Promise<void> {
		const zipper: JSZip = new JSZip();
		zipper.file(FileType.VEHICLES_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.vehicleEvents));
		zipper.file(FileType.TRIPS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.passengerEvents));
		zipper.file(FileType.EVENTS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.eventObservations));
		zipper.file(FileType.STOPS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.stops));
		const zipfile = await zipper.generateAsync({ type: 'blob' });
		const index = this.savedSimPaths.length;
		const filename = '/mysims/simulation'+index.toString()+'.zip';
		// const reader = new FileReader();
		// let base64data: string | ArrayBuffer | null;
		// reader.readAsDataURL(zipfile); 
		// reader.onloadend = function() {
		// 	base64data = reader.result;                
		// 	console.log(base64data);
		// };
		// const filename = 'simulation.zip';
		saveAs(zipfile, filename);
		localStorage.setItem(index.toString(), filename);
		// localStorage.setItem(filename, base64data?.toString());
		await this.addToSavedSims(filename);
	}

	async addToSavedSims(path: string):Promise<void>{
		this.savedSimPaths.push(path);
		// console.log(this.savedSimPaths);
		console.log({ ...localStorage });
	}

	saveSimulationState(vehicleEvents: VehicleEvent[], passengerEvents: PassengerEvent[], eventObservations: EventObservation[], stops: any[]): void {
		this.vehicleEvents = vehicleEvents;
		this.passengerEvents = passengerEvents;
		this.eventObservations = eventObservations;
		this.stops = stops;
	}
}
