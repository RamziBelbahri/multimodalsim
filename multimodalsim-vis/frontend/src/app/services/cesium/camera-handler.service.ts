import { Injectable } from '@angular/core';
import { Camera, Cartesian3, EllipseGraphics, Viewer } from 'cesium';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';
import { StopLookupService } from '../util/stop-lookup.service';

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
	private tierSizes = new Array<number>(0, 0, 0, 0, 0);

	camera: Camera | undefined;

	constructor(private stopLookup: StopLookupService, private vehiculeHandler: VehiclePositionHandlerService, private http: HttpClient) {
		this.http
			.get(this.CONFIG_PATH, { responseType: 'text' })
			.pipe(map((res: string) => JSON.parse(res)))
			.subscribe((data) => {
				this.tierSizes.length = 0;
				this.tierSizes.push(data.tier0_size.toString());
				this.tierSizes.push(data.tier1_size.toString());
				this.tierSizes.push(data.tier2_size.toString());
				this.tierSizes.push(data.tier3_size.toString());
				this.tierSizes.push(data.tier4_size.toString());
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
				this.changeAllIconsSize(viewer, this.tierSizes[0]);
				this.lastTier = 0;
			} else if (endHeight >= 1000 && endHeight < 2000 && this.lastTier != 1) {
				this.changeAllIconsSize(viewer, this.tierSizes[1]);
				this.lastTier = 1;
			} else if (endHeight >= 2000 && endHeight < 3000 && this.lastTier != 2) {
				this.changeAllIconsSize(viewer, this.tierSizes[2]);
				this.lastTier = 2;
			} else if (endHeight >= 3000 && endHeight < 7500 && this.lastTier != 3) {
				this.changeAllIconsSize(viewer, this.tierSizes[3]);
				this.lastTier = 3;
			} else if (endHeight >= 7500 && this.lastTier != 4) {
				this.changeAllIconsSize(viewer, this.tierSizes[4]);
				this.lastTier = 4;
			}
			this.stopLookup.setCurrentStopSize(this.tierSizes[this.lastTier]);
		});
	}

	// Retourne la taille qui devrait être utilisée pour les stops.
	getCurrentStopSize(): number {
		let result = this.tierSizes[0];

		switch (this.lastTier) {
		case 1:
			result = this.tierSizes[1];
			break;
		case 2:
			result = this.tierSizes[2];
			break;
		case 3:
			result = this.tierSizes[3];
			break;
		case 4:
			result = this.tierSizes[4];
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

	private changeBusSize(viewer: Viewer, newSize: number): void {
		this.vehiculeHandler.getVehicleIdMapping().forEach((map) => {
			const entity = viewer.entities.getById(map.id);
			if (entity) {
				(entity.ellipse as EllipseGraphics).semiMajorAxis = new Cesium.ConstantProperty(newSize);
				(entity.ellipse as EllipseGraphics).semiMinorAxis = new Cesium.ConstantProperty(newSize);
			}
		});
	}

	private changeAllIconsSize(viewer: Viewer, newSize: number): void {
		this.changeStopSize(viewer, newSize);
		this.changeBusSize(viewer, newSize * 2);
	}
}
