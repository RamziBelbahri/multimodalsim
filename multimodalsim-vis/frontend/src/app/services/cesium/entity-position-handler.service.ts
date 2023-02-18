import { Injectable } from '@angular/core';
import { Cartesian3, Entity, Viewer } from 'cesium';

import { CesiumClass } from 'src/app/shared/cesium-class';
import * as _ from 'lodash';

@Injectable({
	providedIn: 'root',
})
export class EntityPositionHandlerService {
	readonly INTERVAL = 10;
	readonly NUMBER_OF_VERTEX = 4;
	public static STOPID_LOOKUP:Map<number,any> = new Map<number,any>();

	private entityList: Array<Entity | undefined>;
	private isChanged: Array<boolean>;

	private pointList: Array<Array<Cartesian3>>;
	private tickValueList: Array<Array<Cartesian3>>;
	private tickNumberList: Array<number>;

	constructor() {
		this.entityList = new Array<Entity | undefined>(0);
		this.isChanged = new Array<boolean>(0);

		this.tickValueList = new Array<Array<Cartesian3>>(0);
		this.tickNumberList = new Array<number>(0);

		if (typeof Cesium !== 'undefined') {
			// à enlever quand on va avoir les vrais données de la simulation
			this.pointList = [
				[
					CesiumClass.cartesianDegrees(-73.715045, 45.548226),
					CesiumClass.cartesianDegrees(-73.714945, 45.548226),
					CesiumClass.cartesianDegrees(-73.714945, 45.548176),
					CesiumClass.cartesianDegrees(-73.715045, 45.548176),
				],
			];
		} else {
			this.pointList = [];
		}
	}

	getEntityNumber(): number {
		return this.pointList.length;
	}

	// Donne un trajet à parcourir pour une entité sur une certaine durée.
	setTargetPosition(targetPos: Array<Cartesian3>, duration: number, entityIndex: number): void {
		this.tickNumberList.push(Math.max(this.INTERVAL, duration) / this.INTERVAL);
		const tickValue = new Array<Cartesian3>(targetPos.length);

		for (let i = 0; i < targetPos.length; i++) {
			const distance = CesiumClass.cartesianDistance(this.pointList[entityIndex][i], targetPos[i]) as Cartesian3;

			tickValue[i] = CesiumClass.cartesianScalarDiv(distance, this.tickNumberList[entityIndex]);
		}

		this.tickValueList.push(tickValue);
		this.isChanged.push(true);
	}

	// Génère une entité
	spawnEntity(viewer: Viewer, entityIndex: number): void {
		// Fonction callback utilisée pour mettre à jours les points d'une entité
		const func = () => {
			if (this.isChanged[entityIndex]) {
				for (let i = 0; i < this.pointList[entityIndex].length; i++) {
					this.pointList[entityIndex][i] = CesiumClass.addCartesian(this.pointList[entityIndex][i], this.tickValueList[entityIndex][i]);
				}

				this.tickNumberList[entityIndex]--;

				if (this.tickNumberList[entityIndex] < 0) {
					this.tickNumberList[entityIndex] = 0;
					this.isChanged[entityIndex] = false;
				}
			}

			return CesiumClass.polygonHierarchy(this.pointList[entityIndex]);
		};

		this.entityList.push(
			viewer.entities.add({
				polygon: {
					hierarchy: CesiumClass.callback(_.throttle(func, this.INTERVAL), false),
					height: 0,
					material: Cesium.Color.BLUE,
					outline: true,
					outlineColor: Cesium.Color.BLACK,
				},
			})
		);
	}
}
