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

	constructor(private element: ElementRef, private cameraHandler: CameraHandlerService, private entityPositionHandler: EntityPositionHandlerService) {}

	ngOnInit() {
		this.viewer.imageryLayers.addImageryProvider(
			//assetId 4 est la carte 2D et 1 est la carte 3D par défaut
			new Cesium.IonImageryProvider({ assetId: 4 })
		);

		this.cameraHandler.initCameraData(this.viewer.camera);

		this.testEntitySpawn();
	}

	// remove eventually
	testEntitySpawn(): void {
		this.entity = this.viewer.entities.add({
			polygon: {
				hierarchy: new Cesium.CallbackProperty(() => {
					return new Cesium.PolygonHierarchy(new Cesium.Cartesian3.fromDegreesArray([-73.751564, 45.576321, -73.754564, 45.576321, -73.754564, 45.579321, -73.751564, 45.579321]));
				}, false),
				height: 0,
				material: Cesium.Color.BLUE,
				outline: true,
				outlineColor: Cesium.Color.BLACK,
			},
		});
	}
}
