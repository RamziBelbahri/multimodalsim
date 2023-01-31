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
				const times = [20000, 20000, 18000, 4000, 3000, 15000, 18000, 10000];
				const pos = [
					[
						CesiumClass.cartesianDegrees(-73.725083, 45.543264),
						CesiumClass.cartesianDegrees(-73.724983, 45.543264),
						CesiumClass.cartesianDegrees(-73.724983, 45.543214),
						CesiumClass.cartesianDegrees(-73.725083, 45.543214),
					],
					[
						CesiumClass.cartesianDegrees(-73.721837, 45.539785),
						CesiumClass.cartesianDegrees(-73.721737, 45.539785),
						CesiumClass.cartesianDegrees(-73.721737, 45.539735),
						CesiumClass.cartesianDegrees(-73.721837, 45.539735),
					],
					[
						CesiumClass.cartesianDegrees(-73.717448, 45.547023),
						CesiumClass.cartesianDegrees(-73.717348, 45.547023),
						CesiumClass.cartesianDegrees(-73.717348, 45.546973),
						CesiumClass.cartesianDegrees(-73.717448, 45.546973),
					],
					[
						CesiumClass.cartesianDegrees(-73.711883, 45.544088),
						CesiumClass.cartesianDegrees(-73.711783, 45.544088),
						CesiumClass.cartesianDegrees(-73.711783, 45.544038),
						CesiumClass.cartesianDegrees(-73.711883, 45.544038),
					],
					[
						CesiumClass.cartesianDegrees(-73.685055, 45.560508),
						CesiumClass.cartesianDegrees(-73.684955, 45.560508),
						CesiumClass.cartesianDegrees(-73.684955, 45.560458),
						CesiumClass.cartesianDegrees(-73.685055, 45.560458),
					],
					[
						CesiumClass.cartesianDegrees(-73.727921, 45.547709),
						CesiumClass.cartesianDegrees(-73.727821, 45.547709),
						CesiumClass.cartesianDegrees(-73.727821, 45.547659),
						CesiumClass.cartesianDegrees(-73.727921, 45.547659),
					],
					[
						CesiumClass.cartesianDegrees(-73.692183, 45.570249),
						CesiumClass.cartesianDegrees(-73.692083, 45.570249),
						CesiumClass.cartesianDegrees(-73.692083, 45.570199),
						CesiumClass.cartesianDegrees(-73.692183, 45.570199),
					],
					[
						CesiumClass.cartesianDegrees(-73.739446, 45.544661),
						CesiumClass.cartesianDegrees(-73.739346, 45.544661),
						CesiumClass.cartesianDegrees(-73.739346, 45.544611),
						CesiumClass.cartesianDegrees(-73.739446, 45.544611),
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

		//Note pour le futur, attendre que la carte load avant de générer les entités?
		for (let i = 0; i < this.entityPositionHandler.getEntityNumber(); i++) {
			this.entityPositionHandler.testEntitySpawn(this.viewer, i);
		}
	}
}
