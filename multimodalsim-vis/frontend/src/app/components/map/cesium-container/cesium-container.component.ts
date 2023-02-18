import { Component, ElementRef } from '@angular/core';
import { Entity, Viewer } from 'cesium';
import { CameraHandlerService } from 'src/app/services/cesium/camera-handler.service';
import { EntityPositionHandlerService } from 'src/app/services/cesium/entity-position-handler.service';

import { CesiumClass } from 'src/app/shared/cesium-class';
@Component({
	selector: 'app-cesium-container',
	templateUrl: './cesium-container.component.html',
	styleUrls: ['./cesium-container.component.css'],
})
export class CesiumContainerComponent {
	viewer: Viewer = CesiumClass.viewer(this.element.nativeElement);
	entity: Entity | undefined;

	constructor(private element: ElementRef, private cameraHandler: CameraHandlerService, private entityPositionHandler: EntityPositionHandlerService) {
		// remplacer ça par un algo qui va déterminer la position à prendre
		document.addEventListener('keydown', (event) => {
			if (event.key == 'q') {
				const times = [20000];
				const pos = [
					[
						CesiumClass.cartesianDegrees(-73.725083, 45.543264),
						CesiumClass.cartesianDegrees(-73.724983, 45.543264),
						CesiumClass.cartesianDegrees(-73.724983, 45.543214),
						CesiumClass.cartesianDegrees(-73.725083, 45.543214),
					],
				];

				for (let i = 0; i < this.entityPositionHandler.getEntityNumber(); i++) {
					this.entityPositionHandler.setTargetPosition(pos[i], times[i], i);
				}
			}
		});
	}

	ngOnInit() {
		this.viewer.imageryLayers.addImageryProvider(
			//assetId 4 est la carte 2D et 1 est la carte 3D par défaut
			CesiumClass.imagery({ assetId: 4 })
		);

		this.cameraHandler.initCameraData(this.viewer.camera);

		for (let i = 0; i < this.entityPositionHandler.getEntityNumber(); i++) {
			this.entityPositionHandler.spawnEntity(this.viewer, i);
		}
	}
}
