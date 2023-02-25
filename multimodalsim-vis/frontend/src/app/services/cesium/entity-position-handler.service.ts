import { Injectable } from '@angular/core';
import { Cartesian3, Property, Viewer } from 'cesium';
import { CesiumClass } from 'src/app/shared/cesium-class';
import * as _ from 'lodash';
import { getTime } from 'src/app/helpers/parsers';
import { BusEvent } from 'src/app/classes/data-classes/bus-class/bus-event';
import { PassengerEvent } from 'src/app/classes/data-classes/passenger-event/passenger-event';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const delay = require('delay');

/**
 * DEPRECATED
 * Delete quand le Jira GL4H2311-28 sera complété
 */

@Injectable({
	providedIn: 'root',
})
export class EntityPositionHandlerService {
	private readonly INTERVAL = 10;
	private readonly POLYGON_RADIUS = 50;
	private readonly SPEED_FACTOR = 10000;
	public static STOPID_LOOKUP: Map<number, string> = new Map<number, string>();
	private PASSENGER_POSITION_LOOKUP: Map<string, string> = new Map<string, string>();
	private busList: Array<BusEvent>;
	private passengerList: Array<PassengerEvent>;

	constructor() {
		this.busList = new Array<BusEvent>();
		this.passengerList = new Array<PassengerEvent>();
	}

	public async loadBus(viewer: Viewer, busEvent: BusEvent, previousTime: number): Promise<void> {
		const busIndex = this.getBusIndex(busEvent.id) as number;
		const busSpawned = busIndex !== -1;
		const currentTime = getTime(busEvent.time);
		let timeDelay = this.getDelay(currentTime, previousTime) / this.SPEED_FACTOR;
		// Si le bus apparaît, on attend pour l'intervalle avec l'évènement précédent, sinon
		// on attend pour l'intervalle avec l'évènement de déplacement
		if (busSpawned) {
			const previousBusEvent = this.busList[busIndex];
			const previousBusTime = getTime(previousBusEvent.time);
			timeDelay = this.getDelay(currentTime, previousBusTime) / this.SPEED_FACTOR;
			this.setBusTarget(previousBusEvent, busEvent);
			await delay(timeDelay);
			this.stopBus(busIndex);
		} else {
			await delay(timeDelay);
			// console.log(busEvent)
			this.spawnBus(viewer, busEvent);
		}
	}

	private spawnBus(viewer: Viewer, busEvent: BusEvent): void {
		// console.log("spawn",busEvent);
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

	public async loadPassenger(viewer: Viewer, passengerEvent: PassengerEvent, previousTime: number): Promise<void> {
		const currentTime = getTime(passengerEvent.time);
		const timeDelay = this.getDelay(currentTime, previousTime) / this.SPEED_FACTOR;
		const spawned = viewer.entities.getById((passengerEvent.current_location as number).toString()) == null;
		if (spawned) {
			await delay(timeDelay);
			this.spawnPassenger(viewer, passengerEvent);
		} else {
			await delay(timeDelay);
			let locationChanged = false;
			let previousLocation: string | undefined = 'undefined';
			if (this.PASSENGER_POSITION_LOOKUP.has(passengerEvent.id.toString())) {
				locationChanged = this.PASSENGER_POSITION_LOOKUP.get(passengerEvent.id) == passengerEvent.current_location.toString();
				previousLocation = this.PASSENGER_POSITION_LOOKUP.get(passengerEvent.id);
			}
			this.PASSENGER_POSITION_LOOKUP.set(passengerEvent.id, passengerEvent.current_location.toString());
			const entityPrev = viewer.entities.getById(previousLocation ? previousLocation : 'undefined');
			const labelPrev = entityPrev?.label;
			const textPrev: string[] | undefined = labelPrev?.text?.toString().split(':');

			if (labelPrev != undefined && textPrev != undefined && locationChanged) {
				textPrev[1] = (Number(textPrev[1]) - 1).toString();
				if (Number(textPrev[1]) - 1 <= 0 && entityPrev != undefined) {
					entityPrev.show = false;
					// DEBUGGING PURPOSES ONLY
					// if(entityPrev.ellipse?.semiMajorAxis) {
					// 	entityPrev.ellipse.semiMajorAxis= 300000 as unknown as Property;
					// 	entityPrev.ellipse.semiMinorAxis= 300000 as unknown as Property;
					// }
					console.log(entityPrev.id, 'JUST WENT INVISIBLE');
				} else if (Number(textPrev[1]) - 1 > 0 && entityPrev != undefined) {
					entityPrev.show = true;
				}
				const newText = textPrev[0] + ':' + textPrev[1];
				labelPrev.text = newText as unknown as Property;
			}
			// increase the number of passengers at the current point
			const entity = viewer.entities.getById(passengerEvent.current_location.toString());
			const label = entity?.label;
			const text: string[] | undefined = label?.text?.toString().split(':');
			if (label != undefined && text != undefined && entity != undefined) {
				text[1] = (Number(text[1]) + 1).toString();
				const newText = text[0] + ':' + text[1];
				label.text = newText as unknown as Property;
				entity.show = true;
			}
		}
		this.passengerList.push(passengerEvent);
	}

	private spawnPassenger(viewer: Viewer, passengerEvent: PassengerEvent) {
		let location: any | undefined;
		if (passengerEvent.current_location) {
			location = EntityPositionHandlerService.STOPID_LOOKUP.get(passengerEvent.current_location as number);
		}
		if (location) {
			viewer.entities.add({
				position: Cesium.Cartesian3.fromDegrees(location.stop_lon, location.stop_lat),
				ellipse: {
					semiMinorAxis: 30,
					semiMajorAxis: 30,
					height: 0,
					material: Cesium.Color.RED,
					outline: true,
					outlineColor: Cesium.Color.BLACK,
				},
				id: passengerEvent.current_location.toString(),
				label: {
					text: 'passenger(s):1',
					show: true,
					verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
					fillColor: Cesium.Color.BLACK,
					scaleByDistance: new Cesium.NearFarScalar(1500, 1, 10000, 0),
				},
			});
		}
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

	private getBusIndex(id: string): number {
		return this.busList.findIndex((event) => id === event.id);
	}

	private getPassengerIndex(id: string): number {
		return this.passengerList.findIndex((event) => id === event.id);
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
