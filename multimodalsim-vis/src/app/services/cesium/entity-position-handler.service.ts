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

	entityList: Array<Entity | undefined> = new Array<Entity | undefined>(0);
	private isChanged: Array<boolean> = new Array<boolean>(0);

	private pointList: Array<Array<Cartesian3>>;
	private tickValueList: Array<Array<Cartesian3>> = new Array<Array<Cartesian3>>(0);
	private tickNumberList: Array<number> = new Array<number>(0);

	constructor() {
		if (typeof Cesium !== 'undefined') {
			// à enlever quand on va avoir les vrais données de la simulation
			this.pointList = [
				[
					CesiumClass.cartesianDegrees(-73.715045, 45.548226),
					CesiumClass.cartesianDegrees(-73.714945, 45.548226),
					CesiumClass.cartesianDegrees(-73.714945, 45.548176),
					CesiumClass.cartesianDegrees(-73.715045, 45.548176),
				],
				[
					CesiumClass.cartesianDegrees(-73.729953, 45.548255),
					CesiumClass.cartesianDegrees(-73.730053, 45.548255),
					CesiumClass.cartesianDegrees(-73.730053, 45.548205),
					CesiumClass.cartesianDegrees(-73.729953, 45.548205),
				],
				[
					CesiumClass.cartesianDegrees(-73.732978, 45.539341),
					CesiumClass.cartesianDegrees(-73.732878, 45.539341),
					CesiumClass.cartesianDegrees(-73.732878, 45.539291),
					CesiumClass.cartesianDegrees(-73.732978, 45.539291),
				],
				[
					CesiumClass.cartesianDegrees(-73.714237, 45.541924),
					CesiumClass.cartesianDegrees(-73.714137, 45.541924),
					CesiumClass.cartesianDegrees(-73.714137, 45.541874),
					CesiumClass.cartesianDegrees(-73.714237, 45.541874),
				],
				[
					CesiumClass.cartesianDegrees(-73.682529, 45.56162),
					CesiumClass.cartesianDegrees(-73.682429, 45.56162),
					CesiumClass.cartesianDegrees(-73.682429, 45.56157),
					CesiumClass.cartesianDegrees(-73.682529, 45.56157),
				],
				[
					CesiumClass.cartesianDegrees(-73.720566, 45.54004),
					CesiumClass.cartesianDegrees(-73.720466, 45.54004),
					CesiumClass.cartesianDegrees(-73.720466, 45.53999),
					CesiumClass.cartesianDegrees(-73.720566, 45.53999),
				],
				[
					CesiumClass.cartesianDegrees(-73.721552, 45.554739),
					CesiumClass.cartesianDegrees(-73.721452, 45.554739),
					CesiumClass.cartesianDegrees(-73.721452, 45.554689),
					CesiumClass.cartesianDegrees(-73.721552, 45.554689),
				],
				[
					CesiumClass.cartesianDegrees(-73.731079, 45.536032),
					CesiumClass.cartesianDegrees(-73.730979, 45.536032),
					CesiumClass.cartesianDegrees(-73.730979, 45.535982),
					CesiumClass.cartesianDegrees(-73.731079, 45.535982),
				],
			];
		} else {
			this.pointList = [];
		}
	}

	getEntityNumber(): number {
		return this.pointList.length;
	}

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

	testEntitySpawn(viewer: Viewer, entityIndex: number): void {
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
