import { Injectable } from '@angular/core';
import { Cartesian3, Entity } from 'cesium';

@Injectable({
	providedIn: 'root',
})
export class EntityPositionHandlerService {
	entity: Entity | undefined;
	points: Array<Cartesian3>;
	isChanged = false;

	constructor() {
		this.points = [
			new Cesium.Cartesian3.fromDegrees(-73.751564, 45.576321),
			new Cesium.Cartesian3.fromDegrees(-73.754564, 45.576321),
			new Cesium.Cartesian3.fromDegrees(-73.754564, 45.579321),
			new Cesium.Cartesian3.fromDegrees(-73.751564, 45.579321),
		];
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

	updateEntityPos(increments: Array<Cartesian3>): void {
		for (let i = 0; i < increments.length; i++) {
			this.points[i].x += increments[i].x;
		}

		this.isChanged = true;
	}
}
