import { Injectable } from '@angular/core';
import { JulianDate, Queue, Viewer } from 'cesium';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { EntityEvent } from 'src/app/classes/data-classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
// import { getTime } from 'src/app/helpers/parsers';
import { VehiclePositionHandlerService } from '../cesium/vehicle-position-handler.service';
import { StopPositionHandlerService } from '../cesium/stop-position-handler.service';
import { DateParserService } from '../util/date-parser.service';
import { EventEmitter } from 'events';

@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	public vehicleEvents: VehicleEvent[];
	public passengerEvents: PassengerEvent[];
	public combined: EntityEvent[];
	private eventObservations: [];
	// public eventQueue: Queue;
	private simulationRunning: boolean;
	public simulationCompleted: boolean;
	public pauseEventEmitter = new EventEmitter();
	
	constructor(private dateParser: DateParserService, private vehicleHandler: VehiclePositionHandlerService, private stopHandler: StopPositionHandlerService) {
		this.vehicleEvents = [];
		this.passengerEvents = [];
		this.combined = [];
		this.eventObservations = [];
		// this.eventQueue = new Cesium.Queue();
		this.simulationRunning = false;
		this.simulationCompleted = false;
	}

	public getVehicleEvents(): VehicleEvent[] {
		return this.vehicleEvents;
	}

	public setVehicleData(vehicleEvents: VehicleEvent[]): void {
		this.vehicleEvents = vehicleEvents;
	}

	public setPassengerData(passengerEvents: PassengerEvent[]): void {
		this.passengerEvents = passengerEvents;
	}

	public setEventObservations(eventObservations: []): void {
		this.eventObservations = eventObservations;
	}

	public getEventObservations(): [] {
		return this.eventObservations;
	}

	public getCombinedEvents(): EntityEvent[] {
		return this.combined;
	}
	public static compare = (firstEvent: VehicleEvent | PassengerEvent, secondEvent: VehicleEvent | PassengerEvent) => {
		const first_time: number = Date.parse(firstEvent.time);
		const second_time: number = Date.parse(secondEvent.time);
		if (first_time > second_time) return 1;
		if (first_time < second_time) return -1;
		return 0;
	}

	public combinePassengerAndVehicleEvents(): void {
		const vehicles: any = this.vehicleEvents.map((e) => ({ ...e }));
		const trips: any = this.passengerEvents.map((e) => ({ ...e }));
		const vehiclesAndTrips = vehicles.concat(trips);
		vehiclesAndTrips.sort(EntityDataHandlerService.compare);
		this.combined = vehiclesAndTrips;
	}
	private zoomTo(viewer:Viewer, start:JulianDate, end:JulianDate):void {
		viewer.clock.startTime = start.clone();
		viewer.clock.stopTime = end.clone();
		viewer.clock.currentTime = start.clone();
		viewer.timeline.zoomTo(start, end);
	}
	runVehiculeSimulation(viewer: Viewer, isRealTime = true): void {
		if(isRealTime) {
			this.runRealTimeSimulation(viewer);
			return;
		}
		const start = this.dateParser.parseTimeFromString(this.combined[0].time);
		const end = this.dateParser.parseTimeFromString(this.combined[this.combined.length - 1].time);
		this.zoomTo(viewer, start, end);
		this.runFullSimulation(viewer);
	}

	private runFullSimulation(viewer: Viewer): void {
		this.stopHandler.initStops();
		for (let i = 0; i < this.combined.length - 1; i++) {
			const event = this.combined[i];

			if (event && event.eventType == 'VEHICLE') {
				this.vehicleHandler.compileEvent(event as VehicleEvent, false, viewer);
			} else if (event && event.eventType == 'PASSENGER') {
				this.stopHandler.compileEvent(event as PassengerEvent);
			}
			// if(event) {
			// 	previousTime = getTime(event.time);
			// 	eventCount ++;
			// }
		}
		this.vehicleHandler.loadSpawnEvents(viewer);
		this.stopHandler.loadSpawnEvents(viewer);
	}

	/* TODO: Il faudra retirer les itérations sur i et gérer l'arrêt total de
  la simulation pour terminer l'éxecution de la boucle.
  Aussi à déterminer comment on gère les èvenements quand la simulation est en pause.
  */
	private async runRealTimeSimulation(viewer: Viewer): Promise<void> {
		let i = 0;
		this.stopHandler.initStops();
		const clockState = viewer.animation.viewModel.clockViewModel;
		const service = this;
		const onPlaySubscription = Cesium.knockout.getObservable(clockState, 'shouldAnimate').subscribe((isRunning: boolean) => {
			this.setSimulationState(isRunning);
			if(isRunning) {
				service.pauseEventEmitter.emit('unpause');
			}
			console.log(isRunning)
		});

		// Pour que l'horloge démarre dès que l'on clique sur launch simulation.
		clockState.shouldAnimate = true;
		const vehicle_debug:VehicleEvent[] =[]; 
		while (!this.simulationCompleted) {
			if(i >= this.combined.length) {
				console.log('waiting for new event...')
				await new Promise(resolve => this.pauseEventEmitter.once('newevent', resolve));
			}
			// const currentCesiumTime = Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime() / 1000;
			const event = this.combined[i];
			// console.log(new Date(event.time).getTime() > new Date(viewer.clockViewModel.currentTime.toString()).getTime())
			// const eventTime = +Date.parse(event.time).toFixed(0) / 1000;
			// console.log(currentCesiumTime, eventTime)
			
			// console.log(event)
			if(!this.simulationRunning) {
				await new Promise(resolve => this.pauseEventEmitter.once('unpause', resolve));
			}

			if (event && event.eventType == 'VEHICLE') {
				this.vehicleHandler.compileEvent(event as VehicleEvent, true, viewer);
				// vehicle_debug.push(event as VehicleEvent);
				// console.log("vehicle event arrived!", event.id);
			} else if (event && event.eventType == 'PASSENGER') {
				this.stopHandler.compileEvent(event as PassengerEvent);
				// console.log("passenger event arrived!", event.id);
			}

			// for(let k = 0; k < vehicle_debug.length - 2; k ++) {
			// 	if(new Date(vehicle_debug[k].time).getTime() > new Date(vehicle_debug[k+1].time).getTime()) {
			// 		alert('ERROR: events arrived out of order!')
			// 		vehicle_debug.sort(
			// 			EntityDataHandlerService.compare
			// 		)
			// 	}
			// }
			if(event && i == 0) {
				const start = this.dateParser.parseTimeFromString(this.combined[0].time);
				const end = this.dateParser.parseTimeFromString(this.combined[this.combined.length - 1].time);
				this.zoomTo(viewer, start, end);
			}
			i++;
			if(i == 1000){
				let a = document.createElement('a');
				const csvString = [
					[
						"id",
						"time",			
						"status",			
						"previous_stop",	
						"current_stop",	
						"next_stop",		
						"assigned_legs",	
						"onboard_legs",	
						"alighted_legs",	
						"cumulative_distance",
						"position",
						"duration",
						"hasChanged",
						"movement",
					],
					...this.vehicleEvents.map(item => [
						item.id,
						item.time,
						item.status,
						item.previous_stop? item.previous_stop.toString(): 'null',
						item.current_stop,
						item.next_stop ? item.next_stop.toString() : 'null',
						item.assigned_legs ? item.next_stop.toString() : 'null',
						item.onboard_legs? item.onboard_legs.toString() : 'null',
						item.alighted_legs? item.alighted_legs.toString() : 'null',
						item.cumulative_distance ? item.cumulative_distance.toString() : 'null',
						item.position ? item.position.toString() : 'None',
						item.duration,
						item.hasChanged ? 'true' : 'false',
						item.movement? item.movement.toString():'null'
					])
				].map(e => e.join(";")).join("\n");
				a.href = "data:application/octet-stream,"+encodeURIComponent(csvString);
				a.download = 'myFile.json';
				a.click();
			} 
		}
		this.stopHandler.loadSpawnEvents(viewer);
		onPlaySubscription.dispose();
	}

	private setSimulationState(isRunning: boolean): void {
		this.simulationRunning = isRunning;
	}
}
