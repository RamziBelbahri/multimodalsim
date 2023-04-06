import { Injectable } from '@angular/core';
import { Camera, Cartesian3, EllipseGraphics, Viewer } from 'cesium';
import { StopLookupService } from '../util/stop-lookup.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class CameraHandlerService {
	private readonly CONFIG_PATH = 'assets/viewer-config.json';
	private readonly LAVAL_LONGITUDE: number = -73.717289;
	private readonly LAVAL_LATITUDE: number = 45.545031;
	private readonly BASE_HEIGHT: number = 2000.0;
	private readonly LAVAL_ZOOM: number = 10000;

	private scratchCartesian2 = new Cesium.Cartesian3();
	private endPos = new Cesium.Cartesian3();
	private lastTier = -1;
	private tier0_size = 0;
	private tier1_size = 0;
	private tier2_size = 0;
	private tier3_size = 0;
	private tier4_size = 0;

	camera: Camera | undefined;

	constructor(private stopLookup: StopLookupService, private http: HttpClient) {
		this.http
			.get(this.CONFIG_PATH, { responseType: 'text' })
			.pipe(map((res: string) => JSON.parse(res)))
			.subscribe((data) => {
				this.tier0_size = data.tier0_size.toString();
				this.tier1_size = data.tier1_size.toString();
				this.tier2_size = data.tier2_size.toString();
				this.tier3_size = data.tier3_size.toString();
				this.tier4_size = data.tier4_size.toString();
			});
	}

	initCameraData(viewer: Viewer): void {
		this.camera = viewer.camera;
		this.setCameraPosition(this.LAVAL_LONGITUDE, this.LAVAL_LATITUDE);
		this.camera.zoomOut(this.LAVAL_ZOOM);

		this.camera.moveEnd.addEventListener(() => {
			this.endPos = this.camera?.positionWC.clone(this.scratchCartesian2);
			const endHeight = Cesium.Cartographic.fromCartesian(this.endPos).height;

			if (endHeight < 1000 && this.lastTier != 0) {
				this.changeStopSize(viewer, this.tier0_size);
				this.lastTier = 0;
			} else if (endHeight >= 1000 && endHeight < 2000 && this.lastTier != 1) {
				this.changeStopSize(viewer, this.tier1_size);
				this.lastTier = 1;
			} else if (endHeight >= 2000 && endHeight < 3000 && this.lastTier != 2) {
				this.changeStopSize(viewer, this.tier2_size);
				this.lastTier = 2;
			} else if (endHeight >= 3000 && endHeight < 7500 && this.lastTier != 3) {
				this.changeStopSize(viewer, this.tier3_size);
				this.lastTier = 3;
			} else if (endHeight >= 7500 && this.lastTier != 4) {
				this.changeStopSize(viewer, this.tier4_size);
				this.lastTier = 4;
			}
		});
	}

	// Retourne la taille qui devrait être utilisée pour les stops.
	getCurrentStopSize(): number {
		let result = this.tier0_size;

		switch (this.lastTier) {
		case 1:
			result = this.tier1_size;
			break;
		case 2:
			result = this.tier2_size;
			break;
		case 3:
			result = this.tier3_size;
			break;
		case 4:
			result = this.tier4_size;
			break;
		}

		return result;
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
