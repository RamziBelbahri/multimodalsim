import { Injectable } from '@angular/core';
import { Camera } from 'cesium';

@Injectable({
	providedIn: 'root',
})
export class CameraHandlerService {
	readonly LAVAL_LONGITUDE: number = -73.717289;
	readonly LAVAL_LATITUDE: number = 45.545031;
	readonly BASE_HEIGHT: number = 2000.0;

	camera: Camera | undefined;

	initCameraData(camera: Camera): void {
		this.camera = camera;
		this.setCameraPosition(this.LAVAL_LONGITUDE, this.LAVAL_LATITUDE);
	}

	// Changer de private vers public si nécessaire dans le futur (pas pour l'instant)
	private setCameraPosition(longitude: number, latitude: number, height: number = this.BASE_HEIGHT): void {
		this.camera?.setView({
			destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
		});
	}
}
