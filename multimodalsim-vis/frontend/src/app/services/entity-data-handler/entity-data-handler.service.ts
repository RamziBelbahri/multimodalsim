import { Injectable } from '@angular/core';
import { Queue, Viewer } from 'cesium';
import { VehicleEvent } from 'src/app/classes/data-classes/vehicle-class/vehicle-event';
import { EntityEvent } from 'src/app/classes/data-classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { VehiclePositionHandlerService } from '../cesium/vehicle-position-handler.service';
import { StopPositionHandlerService } from '../cesium/stop-position-handler.service';
import { DateParserService } from '../util/date-parser.service';
import { DataSaverService } from '../data-initialization/data-saver/data-saver.service';
import { EventObservation } from 'src/app/classes/data-classes/event-observation/event-observation';
import { BoardingHandlerService } from '../cesium/boarding-handler.service';

@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	private vehicleEvents: VehicleEvent[];
	private passengerEvents: PassengerEvent[];
	private stops: any[];
	private eventObservations: EventObservation[];
	private combined: EntityEvent[];
	private eventQueue: Queue;
	private simulationRunning: boolean;
	private simulationCompleted: boolean;

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
		this.eventQueue = new Cesium.Queue();
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

	public combinePassengerAndVehicleEvents(): void {
		const vehicles: any = this.vehicleEvents.map((e) => ({ ...e }));
		const trips: any = this.passengerEvents.map((e) => ({ ...e }));
		const vehiclesAndTrips = vehicles.concat(trips);
		vehiclesAndTrips.sort((firstEvent: VehicleEvent | PassengerEvent, secondEvent: VehicleEvent | PassengerEvent) => {
			const first_time: number = Date.parse(firstEvent.time);
			const second_time: number = Date.parse(secondEvent.time);
			if (first_time > second_time) return 1;
			if (first_time < second_time) return -1;
			return 0;
		});
		this.combined = vehiclesAndTrips;
	}

	runVehiculeSimulation(viewer: Viewer, isRealTime: boolean): void {
		const start = this.dateParser.parseTimeFromString(this.combined[0].time);
		const end = this.dateParser.parseTimeFromString(this.combined[this.combined.length - 1].time);

		viewer.clock.startTime = start.clone();
		viewer.clock.stopTime = end.clone();
		viewer.clock.currentTime = start.clone();
		viewer.timeline.zoomTo(start, end);

		isRealTime ? this.runRealTimeSimulation(viewer) : this.runFullSimulation(viewer);
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
		}
		this.vehicleHandler.loadSpawnEvents(viewer);
		this.stopHandler.loadSpawnEvents(viewer);
		this.boardingHandler.initBoarding(viewer);
	}

	/* TODO: Il faudra retirer les itérations sur i et gérer l'arrêt total de
  la simulation pour terminer l'éxecution de la boucle.
  Aussi à déterminer comment on gère les èvenements quand la simulation est en pause.
  */
	private runRealTimeSimulation(viewer: Viewer): void {
		let i = 0;
		this.stopHandler.initStops();
		const clockState = viewer.animation.viewModel.clockViewModel;
		const onPlaySubscription = Cesium.knockout.getObservable(clockState, 'shouldAnimate').subscribe((isRunning: boolean) => {
			this.setSimulationState(isRunning);
		});

		// Pour que l'horloge démarre dès que l'on clique sur launch simulation.
		clockState.shouldAnimate = true;
		while (!this.simulationCompleted && i < this.combined.length) {
			const currentEvent = this.combined[i];
			if (this.simulationRunning) {
				const event = this.eventQueue.dequeue();

				this.eventQueue.enqueue(currentEvent);
				if (event && event.eventType == 'VEHICLE') {
					this.vehicleHandler.compileEvent(event as VehicleEvent, true, viewer);
				} else if (event && event.eventType == 'PASSENGER') {
					this.stopHandler.compileEvent(event as PassengerEvent);
					// TODO
				}
			}
			i++;
		}
		this.stopHandler.loadSpawnEvents(viewer);
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
