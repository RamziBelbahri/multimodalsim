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
				const pos = [
					CesiumClass.cartesianDegrees(-73.781564, 45.576321),
					CesiumClass.cartesianDegrees(-73.784564, 45.576321),
					CesiumClass.cartesianDegrees(-73.784564, 45.579321),
					CesiumClass.cartesianDegrees(-73.781564, 45.579321),
				];
				this.entityPositionHandler.setTargetPosition(pos, 2000);
			}
		});
	}

	ngOnInit() {
		this.viewer.imageryLayers.addImageryProvider(
			//assetId 4 est la carte 2D et 1 est la carte 3D par défaut
			CesiumClass.imagery({ assetId: 4 })
		);

		this.cameraHandler.initCameraData(this.viewer.camera);

		//Note pour le futur, attendre que la carte load avant de générer les entités?
		for (let i = 0; i < 1; i++) {
			this.entityPositionHandler.testEntitySpawn(this.viewer);
		}

		this.entityPositionHandler.entity = this.entity;
	}
}
