import { Component, ElementRef } from '@angular/core';
import { CameraHandlerService } from 'src/app/services/cesium/camera-handler.service';

@Component({
	selector: 'app-cesium-container',
	templateUrl: './cesium-container.component.html',
	styleUrls: ['./cesium-container.component.css'],
})
export class CesiumContainerComponent {
	constructor(
		private element: ElementRef,
		private cameraHandler: CameraHandlerService
	) {}

	ngOnInit() {
		const viewer = new Cesium.Viewer(this.element.nativeElement);

		viewer.imageryLayers.addImageryProvider(
			new Cesium.IonImageryProvider({ assetId: 4 })
		);

		this.cameraHandler.initCameraData(viewer.camera);
	}
}
