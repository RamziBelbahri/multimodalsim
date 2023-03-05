import { Injectable } from '@angular/core';
import { Queue, Viewer } from 'cesium';
import { BusEvent } from 'src/app/classes/data-classes/bus-class/bus-event';
import { EntityEvent } from 'src/app/classes/data-classes/entity/entity-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
import { BusPositionHandlerService } from '../cesium/bus-position-handler.service';
import { PassengerPositionHandlerService } from '../cesium/passenger-position-handler.service';
import { DateParserService } from '../util/date-parser.service';

@Injectable({
	providedIn: 'root',
})
export class EntityDataHandlerService {
	private busEvents: BusEvent[];
	private passengerEvents: PassengerEvent[];
	private combined: EntityEvent[];
	private eventObservations: [];
	private eventQueue: Queue;
	private simulationRunning: boolean;
	private simulationCompleted: boolean;

	constructor(
		private dateParser: DateParserService,
		private busHandler: BusPositionHandlerService,
		private passengerHandler: PassengerPositionHandlerService
	) {
		this.busEvents = [];
		this.passengerEvents = [];
		this.combined = [];
		this.eventObservations = [];
		this.eventQueue = new Cesium.Queue();
		this.simulationRunning = false;
		this.simulationCompleted = false;
	}

	public getBusEvents(): BusEvent[] {
		return this.busEvents;
	}

	public setBusData(busEvents: BusEvent[]): void {
		this.busEvents = busEvents;
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

	public combinePassengerAndBusEvents(): void {
		const vehicles: any = this.busEvents.map((e) => ({ ...e }));
		const trips: any = this.passengerEvents.map((e) => ({ ...e }));
		const vehiclesAndTrips = vehicles.concat(trips);
		vehiclesAndTrips.sort((firstEvent: BusEvent | PassengerEvent, secondEvent: BusEvent | PassengerEvent) => {
			const first_time: number = Date.parse(firstEvent.time);
			const second_time: number = Date.parse(secondEvent.time);
			if (first_time > second_time) return 1;
			if (first_time < second_time) return -1;
			return 0;
		});
		this.combined = vehiclesAndTrips;
	}

	runVehiculeSimulation(viewer: Viewer, isRealTime = true): void {
		const start = this.dateParser.parseTimeFromString(this.combined[0].time);
		const end = this.dateParser.parseTimeFromString(this.combined[this.combined.length - 1].time);

		viewer.clock.startTime = start.clone();
		viewer.clock.stopTime = end.clone();
		viewer.clock.currentTime = start.clone();
		viewer.timeline.zoomTo(start, end);

		isRealTime ? this.runRealTimeSimulation(viewer) : this.runFullSimulation(viewer);
	}

	private runFullSimulation(viewer: Viewer): void {
		for (let i = 0; i < this.combined.length - 1; i++) {
			const event = this.combined[i];

			if (event && event.eventType == 'BUS') {
				this.busHandler.compileEvent(event as BusEvent, false, viewer);
			} else if (event && event.eventType == 'PASSENGER') {
				this.passengerHandler.compileEvent(event as PassengerEvent);
			}
		}
		this.busHandler.loadSpawnEvents(viewer);
		this.passengerHandler.loadSpawnEvents(viewer);
	}

	/* TODO: Il faudra retirer les itérations sur i et gérer l'arrêt total de
  la simulation pour terminer l'éxecution de la boucle.
  Aussi à déterminer comment on gère les èvenements quand la simulation est en pause.
  */
	private runRealTimeSimulation(viewer: Viewer): void {
		let i = 0;
		const clockState = viewer.animation.viewModel.clockViewModel;
		const onPlaySubscription = Cesium.knockout.getObservable(clockState, 'shouldAnimate').subscribe((isRunning: boolean) => {
			this.setSimulationState(isRunning);
		});

		// Pour que l'horloge démarre dès que l'on clique sur launch simulation.
		clockState.shouldAnimate = true;
		while (!this.simulationCompleted && i < this.combined.length) {
			const currentEvent = this.combined[i];
			this.eventQueue.enqueue(currentEvent);
			if (this.simulationRunning) {
				const event = this.eventQueue.dequeue();
				if (event && event.eventType == 'BUS') {
					this.busHandler.compileEvent(event as BusEvent, true, viewer);
				} else if (event && event.eventType == 'PASSENGER') {
					this.passengerHandler.compileEvent(event as PassengerEvent);
					// TODO
				}
			}
			i++;
		}
		this.passengerHandler.loadSpawnEvents(viewer);
		onPlaySubscription.dispose();
	}

	private setSimulationState(isRunning: boolean): void {
		this.simulationRunning = isRunning;
	}
}
