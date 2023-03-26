/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Cartesian2, Cartesian3, Viewer } from 'cesium';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';
import * as polylineEncoder from '@mapbox/polyline';
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
	private color = '';

	constructor(private http: HttpClient, private vehicleHandler: VehiclePositionHandlerService) {
		this.lastEntities = new Array<any>();
	}

	// Active le handler qui s'occupe d'afficher le path
	initHandler(viewer: Viewer): void {
		this.readViewerConfig();

		viewer.scene.preRender.addEventListener(() => {
			if (this.currentMousePosition) {
				const pickedObject = viewer.scene.pick(this.currentMousePosition);

				if (pickedObject) {
					const entity = pickedObject.id;

					if (entity.name == 'vehicle' && this.isLeftClicked) {
						this.isLeftClicked = false;
						const polylines = this.vehicleHandler.getPolylines(entity.id);
						const positions = new Array<Cartesian3>();

						for (let i = 0; i < polylines.length; i++) {
							const polyline = this.removeRepeatedEscapeChar(polylines[i]);
							const points = polylineEncoder.decode(polyline);

							for (let j = 0; j < points.length; j++) {
								positions.push(Cesium.Cartesian3.fromDegrees(points[j][1], points[j][0]));
							}
						}

						const line = viewer.entities.add({
							polyline: {
								positions: positions,
								width: 5,
								material: Cesium.Color.fromCssColorString(this.color),
							},
						});

						this.lastEntities.push(line);
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

	private readViewerConfig(): void {
		this.http
			.get(this.CONFIG_PATH, { responseType: 'text' })
			.pipe(map((res: string) => JSON.parse(res)))
			.subscribe((data) => {
				console.log(data);

				this.color = data.completed_color;
			});
	}

	private removeRepeatedEscapeChar(polyline: string): string {
		let result = polyline;

		if (polyline.includes('\\')) {
			result = polyline.replace('\\\\', '\\');
		}

		return result;
	}
}
