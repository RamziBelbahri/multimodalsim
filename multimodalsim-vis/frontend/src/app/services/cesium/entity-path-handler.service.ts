/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Cartesian2, Cartesian3, JulianDate, Viewer } from 'cesium';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';

@Injectable({
	providedIn: 'root',
})
export class EntityPathHandlerService {
	private currentMousePosition: Cartesian2 | undefined;
	private lastEntities;
	private isLeftClicked = false;

	constructor(private vehicleHandler: VehiclePositionHandlerService) {
		this.lastEntities = new Array<any>();
	}

	// Active le handler qui s'occupe d'afficher le path
	initHandler(viewer: Viewer): void {
		viewer.scene.preRender.addEventListener(() => {
			if (this.currentMousePosition) {
				const pickedObject = viewer.scene.pick(this.currentMousePosition);

				if (pickedObject) {
					const entity = pickedObject.id;

					if (entity.name == 'vehicle' && this.isLeftClicked) {
						this.isLeftClicked = false;
						const sections = this.vehicleHandler.getPolylines(entity.id);
						const progressPath = this.compileSections(sections.positions, sections.times, viewer.clock.currentTime);

						this.lastEntities.push(
							viewer.entities.add({
								polyline: {
									positions: progressPath[0],
									width: 5,
									material: Cesium.Color.GRAY,
								},
							})
						);

						this.lastEntities.push(
							viewer.entities.add({
								polyline: {
									positions: progressPath[1],
									width: 5,
									material: Cesium.Color.BLUE,
								},
							})
						);
					}
				}
			}
		});

		const mouseHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

		// Modifie la position de la souris pour pouvoir pick une entité
		mouseHandler.setInputAction((movement: any) => {
			if (this.lastEntities.length > 0) {
				this.lastEntities.forEach((element: any) => {
					viewer.entities.remove(element);
				});
			}

			this.currentMousePosition = movement.position;
			this.isLeftClicked = true;
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}

	private compileSections(positions: Array<Array<Cartesian3>>, times: Array<Array<JulianDate>>, currentTime: JulianDate): [Array<Cartesian3>, Array<Cartesian3>] {
		const completedPath = new Array<Cartesian3>();
		const uncompletedPath = new Array<Cartesian3>();
		let busReached = false;

		for (let i = 0; i < positions.length; i++) {
			for (let j = 0; j < positions[i].length; j++) {
				if (j < times[i].length && !busReached) {
					if (Cesium.JulianDate.greaterThanOrEquals(times[i][j], currentTime)) {
						busReached = true;
						completedPath.push(positions[i][j]);
					}
				}

				if (!busReached) {
					completedPath.push(positions[i][j]);
				} else {
					uncompletedPath.push(positions[i][j]);
				}
			}
		}

		return [completedPath, uncompletedPath];
	}
}
