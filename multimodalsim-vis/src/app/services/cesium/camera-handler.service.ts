import { Injectable } from '@angular/core';
import { Camera, Cartesian3, Viewer } from 'cesium';

@Injectable({
	providedIn: 'root',
})
export class CameraHandlerService {
	readonly LAVAL_LONGITUDE: number = -73.751564;
	readonly LAVAL_LATITUDE: number = 45.576321;
	readonly BASE_HEIGHT: number = 10000.0;

	camera: Camera | undefined;

	initCameraData(camera: Camera): void {
		this.camera = camera;
		this.setCameraPosition(this.LAVAL_LONGITUDE, this.LAVAL_LATITUDE);
	}

	setCameraPosition(longitude: number, latitude: number, height: number = this.BASE_HEIGHT): void {
		this.camera?.setView({
			destination : Cesium.Cartesian3.fromDegrees(longitude, latitude, height)
		});
	}
}
