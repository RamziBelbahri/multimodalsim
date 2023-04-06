import { Injectable } from '@angular/core';
import { Camera, Viewer } from 'cesium';

@Injectable({
	providedIn: 'root',
})
export class CameraHandlerService {
	private readonly LAVAL_LONGITUDE: number = -73.717289;
	private readonly LAVAL_LATITUDE: number = 45.545031;
	private readonly BASE_HEIGHT: number = 2000.0;
	private readonly LAVAL_ZOOM: number = 10000;

	private scratchCartesian1 = new Cesium.Cartesian3();
	private scratchCartesian2 = new Cesium.Cartesian3();

	private startPos = new Cesium.Cartesian3();
	private endPos = new Cesium.Cartesian3();

	camera: Camera | undefined;

	initCameraData(viewer: Viewer): void {
		this.camera = viewer.camera;
		this.setCameraPosition(this.LAVAL_LONGITUDE, this.LAVAL_LATITUDE);
		this.camera.zoomOut(this.LAVAL_ZOOM);

		this.camera.moveStart.addEventListener(() => {
			this.startPos = this.camera?.positionWC.clone(this.scratchCartesian1);
		});

		this.camera.moveEnd.addEventListener(() => {
			this.endPos = this.camera?.positionWC.clone(this.scratchCartesian2);

			const startHeight = Cesium.Cartographic.fromCartesian(this.startPos).height;
			const endHeight = Cesium.Cartographic.fromCartesian(this.endPos).height;

			if (startHeight > endHeight) {
				console.log('zoom in');
			} else {
				console.log('zoom out');
			}
		});
	}

	// Déplace la caméra vers une position particulière en utilisant les coordonnées GPS.
	private setCameraPosition(longitude: number, latitude: number, height: number = this.BASE_HEIGHT): void {
		this.camera?.setView({
			destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
		});
	}
}
