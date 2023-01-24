import { Component, ElementRef } from '@angular/core';
import { Entity, Viewer } from 'cesium';
import { CameraHandlerService } from 'src/app/services/cesium/camera-handler.service';
import { EntityPositionHandlerService } from 'src/app/services/cesium/entity-position-handler.service';

@Component({
	selector: 'app-cesium-container',
	templateUrl: './cesium-container.component.html',
	styleUrls: ['./cesium-container.component.css'],
})
export class CesiumContainerComponent {
	viewer: Viewer = new Cesium.Viewer(this.element.nativeElement);
	entity: Entity | undefined;

	constructor(private element: ElementRef, private cameraHandler: CameraHandlerService, private entityPositionHandler: EntityPositionHandlerService) {
		// remplacer ça par un algo qui va déterminer la position à prendre
		document.addEventListener('keydown', (event) => {
			if (event.key == 'q') {
				this.entityPositionHandler.updateEntityPos([new Cesium.Cartesian3(100, 0, 0), new Cesium.Cartesian3(100, 0, 0), new Cesium.Cartesian3(100, 0, 0), new Cesium.Cartesian3(100, 0, 0)]);
			}
		});
	}

	ngOnInit() {
		this.viewer.imageryLayers.addImageryProvider(
			//assetId 4 est la carte 2D et 1 est la carte 3D par défaut
			new Cesium.IonImageryProvider({ assetId: 4 })
		);

		this.cameraHandler.initCameraData(this.viewer.camera);

		for (let i = 0; i < 1; i++) {
			this.testEntitySpawn();
		}

		this.entityPositionHandler.startComputation(this.entity);
	}

	// remove eventually
	testEntitySpawn(): void {
		this.entity = this.viewer.entities.add({
			polygon: {
				hierarchy: new Cesium.PolygonHierarchy(this.entityPositionHandler.points),
				height: 0,
				material: Cesium.Color.BLUE,
				outline: true,
				outlineColor: Cesium.Color.BLACK,
			},
		});
	}
}
