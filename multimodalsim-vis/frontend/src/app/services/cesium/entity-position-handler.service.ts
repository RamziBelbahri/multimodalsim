import { Injectable } from '@angular/core';
import { Cartesian3, Viewer } from 'cesium';
import { CesiumClass } from 'src/app/shared/cesium-class';
import * as _ from 'lodash';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';
import { getTime } from 'src/app/helpers/parsers';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const delay = require('delay');

@Injectable({
	providedIn: 'root',
})
export class EntityPositionHandlerService {
	private readonly INTERVAL = 10;
	private readonly POLYGON_RADIUS = 50;
	private readonly SPEED_FACTOR = 10000;
	public static STOPID_LOOKUP:Map<number,any> = new Map<number,any>();

	private busList: Array<BusEvent>;

	constructor() {
		this.busList = new Array<BusEvent>();
	}

	public async loadBus(viewer: Viewer, busEvent: BusEvent, previousTime: number): Promise<void> {
		const busIndex = this.getBusIndex(busEvent.id) as number;
		const busSpawned = busIndex !== -1;
		const currentTime = getTime(busEvent.time);
		const timeDelay = this.getDelay(currentTime, previousTime) / this.SPEED_FACTOR;

		// Si le bus apparaît, on attend pour l'intervalle avec l'évènement précédent, sinon
		// on attend pour l'intervalle avec l'évènement de déplacement
		if (busSpawned) {
			const previousBusEvent = this.busList[busIndex];
			this.setBusTarget(previousBusEvent, busEvent);
			await delay(timeDelay);
			this.stopBus(busIndex);
		} else {
			await delay(timeDelay);
			this.spawnBus(viewer, busEvent);
		}
	}

	private spawnBus(viewer: Viewer, busEvent: BusEvent): void {
		const updatePosition = () => {
			const busIndex = this.getBusIndex(busEvent.id) as number;
			const correspondingBus = this.busList[busIndex];
			let position = correspondingBus.position as Cartesian3;
			if (correspondingBus.hasChanged) {
				const cartesianMovement = correspondingBus.movement;
				position = CesiumClass.addCartesian(position, cartesianMovement);
				this.setBusPosition(busIndex, position);
			}
			const edges: Array<Cartesian3> = [
				CesiumClass.cartesian3(position.x - this.POLYGON_RADIUS, position.y + this.POLYGON_RADIUS, position.z),
				CesiumClass.cartesian3(position.x + this.POLYGON_RADIUS, position.y + this.POLYGON_RADIUS, position.z),
				CesiumClass.cartesian3(position.x + this.POLYGON_RADIUS, position.y - this.POLYGON_RADIUS, position.z),
				CesiumClass.cartesian3(position.x - this.POLYGON_RADIUS, position.y - this.POLYGON_RADIUS, position.z),
			];

			return CesiumClass.polygonHierarchy(edges);
		};

		this.busList.push(busEvent);

		viewer.entities.add({
			polygon: {
				hierarchy: CesiumClass.callback(_.throttle(updatePosition, this.INTERVAL), false),
				height: 0,
				material: Cesium.Color.BLUE,
				outline: true,
				outlineColor: Cesium.Color.BLACK,
			},
		});
	}

	private setBusTarget(previousBus: BusEvent, currentBus: BusEvent): void {
		const previousPosition = previousBus.position;
		const currentPosition = currentBus.position;

		if (previousPosition !== null && currentPosition !== null && currentPosition !== previousPosition) {
			const duration = (getTime(currentBus.time) - getTime(previousBus.time)) / this.SPEED_FACTOR;
			const distance = CesiumClass.cartesianDistance(previousPosition, currentPosition) as Cartesian3;
			const tickNumber = Math.max(this.INTERVAL, duration) / this.INTERVAL;
			const movement = CesiumClass.cartesianScalarDiv(distance, tickNumber);
			const busIndex = this.getBusIndex(currentBus.id) as number;

			this.setBusMovement(busIndex, movement);
			this.setBusHaschanged(busIndex, true);
		}
	}

	private stopBus(busIndex: number): void {
		this.setBusMovement(busIndex, CesiumClass.cartesian3(0, 0, 0));
		this.setBusHaschanged(busIndex, false);
	}

	private getBusIndex(id: number): number {
		return this.busList.findIndex((event) => id === event.id);
	}

	private getDelay(currentTime: number, previousTime: number): number {
		return currentTime - previousTime;
	}

	private setBusPosition(busIndex: number, position: Cartesian3): void {
		this.busList[busIndex].position = position;
	}

	private setBusMovement(busIndex: number, movement: Cartesian3): void {
		this.busList[busIndex].movement = movement;
	}

	private setBusHaschanged(busIndex: number, hasChanged: boolean): void {
		this.busList[busIndex].hasChanged = hasChanged;
	}
}
