import { Injectable } from '@angular/core';
import { Camera, Cartesian3, EllipseGraphics, Viewer } from 'cesium';
import { StopLookupService } from '../util/stop-lookup.service';

@Injectable({
	providedIn: 'root',
})
export class CameraHandlerService {
	private readonly LAVAL_LONGITUDE: number = -73.717289;
	private readonly LAVAL_LATITUDE: number = 45.545031;
	private readonly BASE_HEIGHT: number = 2000.0;
	private readonly LAVAL_ZOOM: number = 10000;

	private scratchCartesian2 = new Cesium.Cartesian3();
	private endPos = new Cesium.Cartesian3();
	private lastTier = -1;

	camera: Camera | undefined;

	readonly TIER0_SIZE: number = 20;
	readonly TIER1_SIZE: number = 30;
	readonly TIER2_SIZE: number = 40;
	readonly TIER3_SIZE: number = 60;
	readonly TIER4_SIZE: number = 90;

	constructor(private stopLookup: StopLookupService) {}

	initCameraData(viewer: Viewer): void {
		this.camera = viewer.camera;
		this.setCameraPosition(this.LAVAL_LONGITUDE, this.LAVAL_LATITUDE);
		this.camera.zoomOut(this.LAVAL_ZOOM);

		this.camera.moveEnd.addEventListener(() => {
			this.endPos = this.camera?.positionWC.clone(this.scratchCartesian2);
			const endHeight = Cesium.Cartographic.fromCartesian(this.endPos).height;

			if (endHeight < 1000 && this.lastTier != 0) {
				this.changeStopSize(viewer, this.TIER0_SIZE);
				this.lastTier = 0;
			} else if (endHeight >= 1000 && endHeight < 2000 && this.lastTier != 1) {
				this.changeStopSize(viewer, this.TIER1_SIZE);
				this.lastTier = 1;
			} else if (endHeight >= 2000 && endHeight < 3000 && this.lastTier != 2) {
				this.changeStopSize(viewer, this.TIER2_SIZE);
				this.lastTier = 2;
			} else if (endHeight >= 3000 && endHeight < 7500 && this.lastTier != 3) {
				this.changeStopSize(viewer, this.TIER3_SIZE);
				this.lastTier = 3;
			} else if (endHeight >= 7500 && this.lastTier != 4) {
				this.changeStopSize(viewer, this.TIER4_SIZE);
				this.lastTier = 4;
			}

			console.log(endHeight);
		});
	}

	// Déplace la caméra vers une position particulière en utilisant les coordonnées GPS.
	private setCameraPosition(longitude: number, latitude: number, height: number = this.BASE_HEIGHT): void {
		this.camera?.setView({
			destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
		});
	}

	// Change la taille des stops pour une nouvelle taille. À utiliser quand zoom in/zoom out
	private changeStopSize(viewer: Viewer, newSize: number): void {
		this.stopLookup.coordinatesIdMapping.forEach((stop: Cartesian3, id: number) => {
			const entity = viewer.entities.getById(id.toString());

			if (entity) {
				(entity.ellipse as EllipseGraphics).semiMajorAxis = new Cesium.ConstantProperty(newSize);
				(entity.ellipse as EllipseGraphics).semiMinorAxis = new Cesium.ConstantProperty(newSize);
			}
		});
	}
}
