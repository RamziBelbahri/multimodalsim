import { Injectable } from '@angular/core';
import { Cartesian3, Entity, Viewer } from 'cesium';

import { CesiumClass } from 'src/app/shared/cesium-class';
import * as _ from 'lodash';

@Injectable({
	providedIn: 'root',
})
export class EntityPositionHandlerService {
	readonly INTERVAL = 1000;
	readonly NUMBER_OF_VERTEX = 4;

	entity: Entity | undefined;
	isChanged = false;

	points: Array<Cartesian3>;
	tickValue: Array<Cartesian3> = new Array<Cartesian3>(this.NUMBER_OF_VERTEX);
	tickNumber = 0;

	constructor() {
		if (typeof Cesium !== 'undefined') {
			this.points = [
				CesiumClass.cartesianDegrees(-73.751564, 45.576321),
				CesiumClass.cartesianDegrees(-73.754564, 45.576321),
				CesiumClass.cartesianDegrees(-73.754564, 45.579321),
				CesiumClass.cartesianDegrees(-73.751564, 45.579321),
			];
		} else {
			this.points = [];
		}
	}

	setTargetPosition(targetPos: Array<Cartesian3>, duration: number): void {
		console.log(true);
		this.tickNumber = Math.max(this.INTERVAL, duration) / this.INTERVAL;

		for (let i = 0; i < targetPos.length; i++) {
			const distance = CesiumClass.cartesianDistance(this.points[i], targetPos[i]) as Cartesian3;

			this.tickValue[i] = CesiumClass.cartesianScalarDiv(distance, this.tickNumber);
		}

		this.isChanged = true;
	}

	testEntitySpawn(viewer: Viewer): void {
		const func = () => {
			console.log(this.isChanged);

			this.points;
			if (this.isChanged) {
				for (let i = 0; i < this.points.length; i++) {
					this.points[i] = CesiumClass.addCartesian(this.points[i], this.tickValue[i]);
				}

				this.tickNumber--;

				if (this.tickNumber < 0) {
					this.tickNumber = 0;
					this.isChanged = false;
				}
			}

			return CesiumClass.polygonHierarchy(this.points);
		};

		this.entity = viewer.entities.add({
			polygon: {
				hierarchy: CesiumClass.callback(_.throttle(func, this.INTERVAL), false),
				height: 0,
				material: Cesium.Color.BLUE,
				outline: false,
				outlineColor: Cesium.Color.BLACK,
			},
		});
	}
}
