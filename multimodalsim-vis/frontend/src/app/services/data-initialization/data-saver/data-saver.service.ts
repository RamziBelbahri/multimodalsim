import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { EventObservation } from 'src/app/classes/data-classes/event-observation/event-observation';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { FileType } from 'src/app/classes/file-classes/file-type';
import { SimulationParserService } from '../simulation-parser/simulation-parser.service';
import { CommunicationService } from '../../communication/communication.service';

@Injectable({
	providedIn: 'root',
})
export class DataSaverService {
	private vehicleEvents: VehicleEvent[];
	private passengerEvents: PassengerEvent[];
	private eventObservations: EventObservation[];
	private stops: any[] = [];

	constructor(private parser: SimulationParserService, private commService: CommunicationService) {
		this.vehicleEvents = [];
		this.passengerEvents = [];
		this.eventObservations = [];
	}

	async saveAsZip(filename: string): Promise<void> {
		const zipper: JSZip = new JSZip();
		zipper.file(FileType.VEHICLES_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.vehicleEvents));
		zipper.file(FileType.TRIPS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.passengerEvents));
		zipper.file(FileType.EVENTS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.eventObservations));
		zipper.file(FileType.STOPS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.stops));
		const zipfile = await zipper.generateAsync({ type:'blob' });
		this.commService.saveSimulation({ zipContent: zipfile, zipFileName: filename + '.zip' }).subscribe((res)=> console.log(res));
	}

	saveSimulationState(vehicleEvents: VehicleEvent[], passengerEvents: PassengerEvent[], eventObservations: EventObservation[], stops: any[]): void {
		this.vehicleEvents = vehicleEvents;
		this.passengerEvents = passengerEvents;
		this.eventObservations = eventObservations;
		this.stops = stops;
	}
}
