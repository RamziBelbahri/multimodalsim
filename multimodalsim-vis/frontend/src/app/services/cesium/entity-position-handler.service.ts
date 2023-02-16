import { Injectable } from '@angular/core';
import { Cartesian3, Entity, Viewer } from 'cesium';

import { CesiumClass } from 'src/app/shared/cesium-class';
import * as _ from 'lodash';
import { BusEvent } from 'src/app/classes/bus-class/bus-event';
import { getTime } from 'src/app/helpers/parsers';

@Injectable({
	providedIn: 'root',
})
export class EntityPositionHandlerService {
	readonly INTERVAL = 10;
	readonly NUMBER_OF_VERTEX = 4;
	readonly POLYGON_RADIUS = 5;

	private busList: Array<BusEvent>;

	constructor() {
		this.busList = new Array<BusEvent>();
	}

	loadBus(viewer: Viewer, busEvent: BusEvent): void {
		const busIndex = this.getBusIndex(busEvent.id) as number;
		const busSpawned = busIndex !== -1;
		if (busSpawned) {
			const previousBusEvent = this.busList[busIndex];
			this.setBusTarget(previousBusEvent, busEvent);
		} else {
			this.spawnBus(viewer, busEvent);
		}
	}

	spawnBus(viewer: Viewer, busEvent: BusEvent): void {

		const updatePosition = () => {
			const busIndex = this.getBusIndex(busEvent.id) as number;
			const correspondingBus = this.busList[busIndex];
			let position = correspondingBus.position;
			if (correspondingBus.hasChanged) {
				console.log('position 1: ', this.busList[0].position);
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

	setBusTarget(previousBus: BusEvent, currentBus: BusEvent): void {
		const duration = getTime(currentBus.time) - getTime(previousBus.time);
		const distance = CesiumClass.cartesianDistance(previousBus.position, currentBus.position) as Cartesian3;
		const tickNumber = Math.max(this.INTERVAL, duration) / this.INTERVAL;
		const movement = CesiumClass.cartesianScalarDiv(distance, tickNumber);
		const busIndex = this.getBusIndex(currentBus.id) as number;

		this.setBusMovement(busIndex, movement);
		this.setBusHaschanged(busIndex, true);
	}

	getBusIndex(id: number): number | undefined {
		return this.busList.findIndex((event) => id === event.id);
	}

	setBusPosition(busIndex: number, position: Cartesian3): void {
		this.busList[busIndex].position = position;
	}

	setBusMovement(busIndex: number, movement: Cartesian3): void {
		this.busList[busIndex].movement = movement;
	}

	setBusHaschanged(busIndex: number, hasChanged: boolean): void {
		this.busList[busIndex].hasChanged = hasChanged;
	}
}
