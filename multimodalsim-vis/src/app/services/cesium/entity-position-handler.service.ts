import { Injectable } from '@angular/core';
import { Cartesian3, Entity, Viewer } from 'cesium';

import { CesiumClass } from 'src/app/shared/cesium-class';
import * as _ from 'lodash';

@Injectable({
	providedIn: 'root',
})
export class EntityPositionHandlerService {
	readonly INTERVAL = 100;
	readonly NUMBER_OF_VERTEX = 4;

	entityList: Array<Entity | undefined> = new Array<Entity | undefined>(0);
	isChanged = false;

	pointList: Array<Array<Cartesian3>>;
	tickValueList: Array<Array<Cartesian3>> = new Array<Array<Cartesian3>>(0);
	tickNumberList: Array<number> = new Array<number>(0);

	constructor() {
		if (typeof Cesium !== 'undefined') {
			this.pointList = [
				[
					CesiumClass.cartesianDegrees(-73.751564, 45.576321),
					CesiumClass.cartesianDegrees(-73.754564, 45.576321),
					CesiumClass.cartesianDegrees(-73.754564, 45.579321),
					CesiumClass.cartesianDegrees(-73.751564, 45.579321),
				],
			];
		} else {
			this.pointList = [];
		}
	}

	setTargetPosition(targetPos: Array<Cartesian3>, duration: number): void {
		this.tickNumberList.push(Math.max(this.INTERVAL, duration) / this.INTERVAL);
		const tickValue = new Array<Cartesian3>(targetPos.length);

		for (let i = 0; i < targetPos.length; i++) {
			const distance = CesiumClass.cartesianDistance(this.pointList[0][i], targetPos[i]) as Cartesian3;

			tickValue[i] = CesiumClass.cartesianScalarDiv(distance, this.tickNumberList[0]);
		}

		this.tickValueList.push(tickValue);
		this.isChanged = true;
	}

	testEntitySpawn(viewer: Viewer): void {
		const func = () => {
			this.pointList;
			if (this.isChanged) {
				for (let i = 0; i < this.pointList[0].length; i++) {
					this.pointList[0][i] = CesiumClass.addCartesian(this.pointList[0][i], this.tickValueList[0][i]);
				}

				this.tickNumberList[0]--;

				if (this.tickNumberList[0] < 0) {
					this.tickNumberList[0] = 0;
					this.isChanged = false;
				}
			}

			return CesiumClass.polygonHierarchy(this.pointList[0]);
		};

		this.entityList.push(
			viewer.entities.add({
				polygon: {
					hierarchy: CesiumClass.callback(_.throttle(func, this.INTERVAL), false),
					height: 0,
					material: Cesium.Color.BLUE,
					outline: false,
					outlineColor: Cesium.Color.BLACK,
				},
			})
		);
	}
}
