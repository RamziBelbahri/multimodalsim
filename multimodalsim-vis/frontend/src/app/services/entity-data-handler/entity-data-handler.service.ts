/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { JulianDate, Queue, Viewer } from 'cesium';
import { EventEmitter } from 'events';
import { FlowControl } from './flow-control';
import * as delay from 'delay';
import { VehicleStatus } from 'src/app/classes/data-classes/vehicle-class/vehicle-status';
import { EventType } from '../util/event-types';
import { RealTimePolyline } from 'src/app/classes/data-classes/realtime-polyline';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { EntityEvent } from 'src/app/classes/data-classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { VehiclePositionHandlerService } from '../cesium/vehicle-position-handler.service';
import { StopPositionHandlerService } from '../cesium/stop-position-handler.service';
import { DateParserService } from '../util/date-parser.service';
import { DataSaverService } from '../data-initialization/data-saver/data-saver.service';
import { EventObservation } from 'src/app/classes/data-classes/event-observation/event-observation';
import { BoardingHandlerService } from '../cesium/boarding-handler.service';
const DEBUG = false;

@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	public vehicleEvents: VehicleEvent[];
	public passengerEvents: PassengerEvent[];
	private stops: any[];
	private eventObservations: EventObservation[];
	public combined: EntityEvent[];
	private simulationRunning: boolean;
	public simulationCompleted: boolean;
	public pauseEventEmitter = new EventEmitter();
	public realtimePolylineLookup:Map<string, RealTimePolyline> = new Map<string, RealTimePolyline>();
	public vehicleStopLookup:Map<string,string|undefined> = new Map<string,string>();

	constructor(
		private dateParser: DateParserService,
		private vehicleHandler: VehiclePositionHandlerService,
		private stopHandler: StopPositionHandlerService,
		private dataSaverService: DataSaverService,
		private boardingHandler: BoardingHandlerService
	) {
		this.vehicleEvents = [];
		this.passengerEvents = [];
		this.stops = [];
		this.eventObservations = [];
		this.combined = [];
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

	public setEventObservations(eventObservations: EventObservation[]): void {
		this.eventObservations = eventObservations;
	}

	public setStops(stops: any[]): void {
		this.stops = stops;
	}

	public getEventObservations(): EventObservation[] {
		return this.eventObservations;
	}

	public getCombinedEvents(): EntityEvent[] {
		return this.combined;
	}
	public static compare = (firstEvent: VehicleEvent | PassengerEvent, secondEvent: VehicleEvent | PassengerEvent) => {
		const first_time: number = firstEvent.time;
		const second_time: number = secondEvent.time;
		if (first_time > second_time) return 1;
		if (first_time < second_time) return -1;
		return 0;
	};

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
		const start = this.dateParser.parseTimeFromSeconds(this.combined[0].time.toString());
		const end = this.dateParser.parseTimeFromSeconds(this.combined[this.combined.length - 1].time.toString());
		this.zoomTo(viewer, start, end);
		this.runFullSimulation(viewer);
	}

	private runFullSimulation(viewer: Viewer): void {
		this.stopHandler.initStops();
		for (let i = 0; i < this.combined.length - 1; i++) {
			const event = this.combined[i];
			if (event && event.eventType == EventType.VEHICLE) {
				this.vehicleHandler.compileEvent(event as VehicleEvent, false, viewer);
			} else if (event && event.eventType == EventType.PASSENGER) {
				this.stopHandler.compileEvent(event as PassengerEvent);
			}
		}
		this.vehicleHandler.loadSpawnEvents(viewer);
		this.stopHandler.loadSpawnEvents(viewer);
		this.boardingHandler.initBoarding(viewer);
		this.saveSimulationState();
	}

	private async runRealTimeSimulation(viewer: Viewer): Promise<void> {
		let i = 0;
		this.stopHandler.initStops();
		const clockState = viewer.animation.viewModel.clockViewModel;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const service = this;
		const onPlaySubscription = Cesium.knockout.getObservable(clockState, 'shouldAnimate').subscribe((isRunning: boolean) => {
			this.setSimulationState(isRunning);
			if(isRunning) {
				service.pauseEventEmitter.emit(FlowControl.ON_PAUSE);
			}
		});

		// Pour que l'horloge démarre dès que l'on clique sur launch simulation.
		// clockState.shouldAnimate = true;

		// test
		// viewer.allowDataSourcesToSuspendAnimation = false;
		this.stopHandler.loadSpawnEvents(viewer);
		while (!this.simulationCompleted) {
			// make sure that Cesium doesnt go further than the simulation, if it does all buses will disappear
			
			// await new event
			if(i >= this.combined.length) {
				await new Promise(resolve => this.pauseEventEmitter.once(FlowControl.ON_NEW_EVENTS, resolve));
			}
			const event = this.combined[i];
			// console.log(event)
			
			if(!this.simulationRunning) {
				await new Promise(resolve => this.pauseEventEmitter.once(FlowControl.ON_PAUSE, resolve));
			}

			if (event && event.eventType == 'VEHICLE') {
				// try {
				event.isRealtime ?
					this.vehicleHandler.compileLiveEvent(event as VehicleEvent, viewer) :
					this.vehicleHandler.compileEvent(event as VehicleEvent, true, viewer);
				// } catch (e) {
				// 	console.log("inside catch", e)
				// }
			} else if (event && event.eventType == 'PASSENGER') {
				this.stopHandler.compileEvent(event as PassengerEvent);
			}
			// console.log(new Date(event.time).getTime() - Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime())
			if(event && i == 0) {
				// const julianDateStart
				const start = Cesium.JulianDate.fromDate(new Date(this.combined[0].time * 1000));
				const end = this.dateParser.addDuration(start, (23 * 60 * 60).toString());
				console.log(Cesium.JulianDate.toDate(start).getTime());
				console.log(Cesium.JulianDate.toDate(end).getTime());
				this.zoomTo(viewer, start, end);
			}
			// console.log("")
			i++;

		}
		onPlaySubscription.dispose();
		this.saveSimulationState();
	}

	private setSimulationState(isRunning: boolean): void {
		this.simulationRunning = isRunning;
	}

	private saveSimulationState(): void {
		this.dataSaverService.saveSimulationState(this.vehicleEvents, this.passengerEvents, this.eventObservations, this.stops);
	}
}
