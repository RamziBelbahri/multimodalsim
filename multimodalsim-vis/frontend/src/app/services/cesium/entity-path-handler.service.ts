/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Cartesian2, Cartesian3, JulianDate, Viewer } from 'cesium';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class EntityPathHandlerService {
	private readonly CONFIG_PATH = 'assets/viewer-config.json';
	private currentMousePosition: Cartesian2 | undefined;
	private lastEntities;
	private isLeftClicked = false;
	private completedColor = '';
	private uncompletedColor = '';

	private progressPath: [Array<Cartesian3>, Array<Cartesian3>];
	private timeList: Array<JulianDate>;
	private lastTime: JulianDate;

	lastEntityType = '';

	constructor(private http: HttpClient, private vehicleHandler: VehiclePositionHandlerService) {
		this.lastEntities = new Array<any>();
		this.progressPath = [new Array<Cartesian3>(), new Array<Cartesian3>()];
		this.timeList = new Array<JulianDate>();
		this.lastTime = new Cesium.JulianDate();
	}

	// Active le handler qui s'occupe d'afficher le path
	initHandler(viewer: Viewer): void {
		this.readViewerConfig();

		viewer.scene.preRender.addEventListener(() => {
			if (this.currentMousePosition) {
				const pickedObject = viewer.scene.pick(this.currentMousePosition);

				if (pickedObject) {
					const entity = pickedObject.id;

					if (entity.name == 'bus1' && this.isLeftClicked) {
						this.isLeftClicked = false;
						this.lastEntityType = entity.name;
						const sections = this.vehicleHandler.getPolylines(entity.id);
						this.progressPath = this.compileSections(sections.positions, sections.times, viewer.clock.currentTime);

						this.lastEntities.push(
							viewer.entities.add({
								polyline: {
									positions: new Array<Cartesian3>(this.progressPath[0][this.progressPath[0].length - 1]).concat(this.progressPath[1]),
									width: 5,
									material: Cesium.Color.fromCssColorString(this.uncompletedColor),
								},
							})
						);

						this.lastEntities.push(
							viewer.entities.add({
								polyline: {
									positions: this.progressPath[0].concat(this.progressPath[1][0]),
									width: 5,
									material: Cesium.Color.fromCssColorString(this.completedColor),
								},
							})
						);
					}
				}
			}

			if (this.lastEntities.length > 0) {
				this.updateProgress(viewer.clock.currentTime, viewer);
			}
		});

		const mouseHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

		// Modifie la position de la souris pour pouvoir pick une entité
		mouseHandler.setInputAction((movement: any) => {
			if (this.lastEntities.length > 0) {
				this.clearLists(viewer);
			}

			this.currentMousePosition = movement.position;
			this.isLeftClicked = true;
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}

	// Compile les sections des positions de la polyline en deux array différents (complété et non complété).
	private compileSections(positions: Array<Array<Cartesian3>>, times: Array<Array<JulianDate>>, currentTime: JulianDate): [Array<Cartesian3>, Array<Cartesian3>] {
		let completedPath = new Array<Cartesian3>();
		let uncompletedPath = new Array<Cartesian3>();
		let busReached = false;

		for (let i = 0; i < positions.length; i++) {
			if (Cesium.JulianDate.lessThan(times[i][times[i].length - 1], currentTime)) {
				completedPath = completedPath.concat(positions[i]);
				this.timeList = this.timeList.concat(times[i]);
			} else if (busReached) {
				uncompletedPath = uncompletedPath.concat(positions[i]);
				this.timeList = this.timeList.concat(times[i]);
			} else {
				for (let j = 0; j < positions[i].length; j++) {
					if (j < times[i].length) {
						this.timeList.push(times[i][j]);
						if (Cesium.JulianDate.greaterThan(times[i][j], currentTime) && !busReached) {
							busReached = true;
							this.lastTime = times[i][j];
						}
					}

					if (!busReached) {
						completedPath.push(positions[i][j]);
					} else {
						uncompletedPath.push(positions[i][j]);
					}
				}
			}
		}

		return [completedPath, uncompletedPath];
	}

	// Met à jour les le progrès du chemin en déplaçant les coordonnées d'un array à l'autre
	private updateProgress(currentTime: JulianDate, viewer: Viewer): void {
		const originalCompletedLength = this.progressPath[0].length;
		const originalUnCompletedLength = this.progressPath[1].length;

		if (viewer.clock.multiplier > 0 && Cesium.JulianDate.greaterThan(viewer.clock.currentTime, this.lastTime)) {
			for (let i = 0; i < originalUnCompletedLength; i++) {
				if (Cesium.JulianDate.greaterThan(this.timeList[i + originalCompletedLength - 1], currentTime)) {
					this.lastTime = this.timeList[i + originalCompletedLength - 1];
					this.updatePolylinePositions();
					break;
				}

				this.progressPath[0].push(this.progressPath[1][0]);
				this.progressPath[1].splice(0, 1);
			}
		} else if (viewer.clock.multiplier < 0 && Cesium.JulianDate.lessThan(viewer.clock.currentTime, this.lastTime)) {
			for (let i = originalCompletedLength - 1; i >= 0; i--) {
				if (Cesium.JulianDate.lessThan(this.timeList[i], currentTime)) {
					this.lastTime = this.timeList[i];
					this.updatePolylinePositions();
					break;
				}

				this.progressPath[1].unshift(this.progressPath[0][this.progressPath[0].length - 1]);
				this.progressPath[0].length--;
			}
		}
	}

	// Met à jour les positions des polyline de cesium
	private updatePolylinePositions(): void {
		this.lastEntities[0].polyline.positions = new Array<Cartesian3>(this.progressPath[0][this.progressPath[0].length - 1]).concat(this.progressPath[1]);
		this.lastEntities[1].polyline.positions = this.progressPath[0].concat(this.progressPath[1][0]);
	}

	// Lit la configuration pour avoir les couleurs des lignes
	private readViewerConfig(): void {
		this.http
			.get(this.CONFIG_PATH, { responseType: 'text' })
			.pipe(map((res: string) => JSON.parse(res)))
			.subscribe((data) => {
				this.completedColor = data.completed_color.toString();
				this.uncompletedColor = data.uncompleted_color.toString();
			});
	}

	// Vider la liste des dernières entités afin d'enlever les polylines et nettoyer les valeurs.
	clearLists(viewer: Viewer): void {
		this.lastEntities.forEach((element: any) => {
			viewer.entities.remove(element);
		});
		this.lastEntities.length = 0;
		this.timeList.length = 0;
		this.lastEntityType = '';
	}
}
