import { Injectable } from '@angular/core';
import { Camera } from 'cesium';

@Injectable({
	providedIn: 'root',
})
export class CameraHandlerService {
	private readonly LAVAL_LONGITUDE: number = -73.717289;
	private readonly LAVAL_LATITUDE: number = 45.545031;
	private readonly BASE_HEIGHT: number = 2000.0;
	private readonly LAVAL_ZOOM: number = 10000;

	camera: Camera | undefined;

	initCameraData(camera: Camera): void {
		this.camera = camera;
		this.setCameraPosition(this.LAVAL_LONGITUDE, this.LAVAL_LATITUDE);
		this.camera.zoomOut(this.LAVAL_ZOOM);
	}

	// Déplace la caméra vers une position particulière en utilisant les coordonnées GPS.
	private setCameraPosition(longitude: number, latitude: number, height: number = this.BASE_HEIGHT): void {
		this.camera?.setView({
			destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
		});
	}
}
