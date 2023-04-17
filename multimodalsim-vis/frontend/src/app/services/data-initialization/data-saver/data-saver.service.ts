import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { EventObservation } from 'src/app/classes/data-classes/event-observation/event-observation';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { FileType } from 'src/app/classes/file-classes/file-type';
import { SimulationParserService } from '../simulation-parser/simulation-parser.service';
import { CommunicationService } from '../../communication/communication.service';
import * as currentSimulation from 'src/app/helpers/session-storage';
import { AppModule } from 'src/app/app.module';
import { EntityDataHandlerService } from '../../entity-data-handler/entity-data-handler.service';
import { EventType } from '../../util/event-types';
import { FlowControl } from '../../entity-data-handler/flow-control';
import { DateParserService } from '../../util/date-parser.service';
import { toInteger } from 'lodash';
import { EntityEvent } from 'src/app/classes/data-classes/entity/entity-event';
import delay from 'delay';

@Injectable({
	providedIn: 'root',
})
export class DataSaverService {
	private vehicleEvents: VehicleEvent[];
	private passengerEvents: PassengerEvent[];
	private eventObservations: EventObservation[];
	private stops: any[] = [];

	constructor(
		private parser: SimulationParserService,
		private commService: CommunicationService,
		private dateParser: DateParserService) {
		this.vehicleEvents = [];
		this.passengerEvents = [];
		this.eventObservations = [];
	}

	putInLookup<T extends EntityEvent>(lookup:Map<string, T[]>, event:EntityEvent) {
		if(lookup.has(event.id)) {
			lookup.get(event.id)?.push(event as T);
		} else {
			lookup.set(event.id, [event as T]);
		}
	}

	filterArtificialEvent<T extends EntityEvent>(lookup:Map<string, T[]>) {
		
		for(const [eventID, events] of lookup.entries()) {
			const filteredEvents:T[] = [];
			for(const event of events) {
				if(!event.status.endsWith(FlowControl.FRONTEND_EVENT)){
					filteredEvents.push(event);
				} else {
					const previousDuration = toInteger(filteredEvents[filteredEvents.length - 1].duration);
					const artificialDuration = toInteger(event.duration);
					filteredEvents[filteredEvents.length - 1].duration =
						(previousDuration + artificialDuration).toString();
				}
			}
			lookup.set(eventID, events);
		}
		
	}

	combineAndSort<T extends EntityEvent>(lookup:Map<string,T[]>) {
		const allEvents: T[] = [];
		for(const events of lookup.values()) {
			allEvents.push(...events);
		}
		return allEvents.sort((a:T, b:T) => {return a.time - b.time;});
	}

	async saveAsZip(filename: string): Promise<void> {
		const zipper: JSZip = new JSZip();
		if(!currentSimulation.isCurrentSimulationLive()){
			zipper.file(FileType.VEHICLES_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.vehicleEvents));
			zipper.file(FileType.TRIPS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.passengerEvents));
			zipper.file(FileType.EVENTS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.eventObservations));
			zipper.file(FileType.STOPS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.stops));
		} else {
			const entityDataHandlerService = AppModule.injector.get(EntityDataHandlerService);
			const passengerEventsLookup:Map<string,PassengerEvent[]> = new Map();
			const vehicleEventsLookup:Map<string,VehicleEvent[]> = new Map();

			// separate vehicle and passenger events
			let i = 0;
			for(const event of entityDataHandlerService.combined) {
				switch(event.eventType){
				case EventType.PASSENGER:
					this.putInLookup<PassengerEvent>(passengerEventsLookup, event);
					break;
				case EventType.VEHICLE:
					this.putInLookup<VehicleEvent>(vehicleEventsLookup, event);
					break;
				}
				i++;
				if(i % 250 == 0) {
					await delay(5);
				}
			}

			this.filterArtificialEvent<PassengerEvent>(passengerEventsLookup);
			this.filterArtificialEvent<VehicleEvent>(vehicleEventsLookup);

			zipper.file(FileType.VEHICLES_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.combineAndSort(vehicleEventsLookup)));
			zipper.file(FileType.TRIPS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(this.combineAndSort(passengerEventsLookup)));
			zipper.file(FileType.EVENTS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(AppModule.injector.get(EntityDataHandlerService).getEventObservations()));
			zipper.file(FileType.STOPS_OBSERVATIONS_FILE_NAME, this.parser.parseToFile(AppModule.injector.get(EntityDataHandlerService).stops));
			
		}
			
		const zipfile = await zipper.generateAsync({ type: 'blob' });
		this.commService.saveSimulation({ zipContent: zipfile, zipFileName: filename + '.zip' }).subscribe((res) => console.log(res));
	}

	saveSimulationState(vehicleEvents: VehicleEvent[], passengerEvents: PassengerEvent[], eventObservations: EventObservation[], stops: any[]): void {
		this.vehicleEvents = vehicleEvents;
		this.passengerEvents = passengerEvents;
		this.eventObservations = eventObservations;
		this.stops = stops;
	}
}
