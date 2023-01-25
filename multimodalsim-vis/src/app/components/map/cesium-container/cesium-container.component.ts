import { Component, ElementRef } from '@angular/core';
import { Viewer } from 'cesium';
import { CameraHandlerService } from 'src/app/services/cesium/camera-handler.service';

@Component({
	selector: 'app-cesium-container',
	templateUrl: './cesium-container.component.html',
	styleUrls: ['./cesium-container.component.css'],
})
export class CesiumContainerComponent {
	viewer: Viewer = new Cesium.Viewer(this.element.nativeElement);

	constructor(private element: ElementRef, private cameraHandler: CameraHandlerService) {}

	ngOnInit() {
		this.viewer.imageryLayers.addImageryProvider(
			//assetId 4 est la carte 2D et 1 est la carte 3D par défaut
			new Cesium.IonImageryProvider({ assetId: 4 })
		);

		this.cameraHandler.initCameraData(this.viewer.camera);

		const max = 1;
		for (let i = 0; i < max; i++) {
			this.testEntitySpawn();
		}
	}

	testEntitySpawn() {
		this.viewer.entities.add({
			polygon: {
				hierarchy: Cesium.Cartesian3.fromDegreesArray([-73.751564, 45.576321, -73.754564, 45.576321, -73.754564, 45.579321, -73.751564, 45.579321]),
				height: 0,
				material: Cesium.Color.BLUE,
				outline: true,
				outlineColor: Cesium.Color.BLACK,
			},
		});
	}
}
