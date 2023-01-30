import { Injectable } from '@angular/core';
import { Cartesian3, Entity } from 'cesium';

import { CesiumClass } from 'src/app/shared/cesium-class';

@Injectable({
	providedIn: 'root',
})
export class EntityPositionHandlerService {
	entity: Entity | undefined;
	points: Array<Cartesian3>;
	isChanged = false;

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

	startComputation(entity: Entity | undefined): void {
		this.entity = entity;

		setInterval(() => {
			if (this.entity?.polygon?.hierarchy) {
				if (this.isChanged) {
					this.entity.polygon.hierarchy = new Cesium.PolygonHierarchy(this.points);
					this.isChanged = false;
				}
			}
		}, 100);
	}

	updateEntityPos(newPos: Array<Cartesian3>): void {
		for (let i = 0; i < newPos.length; i++) {
			this.points[i].x = newPos[i].x;
			this.points[i].y = newPos[i].y;
			this.points[i].z = newPos[i].z;
		}

		this.isChanged = true;
	}
}
