import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Viewer } from 'cesium';
import { CameraHandlerService } from 'src/app/services/cesium/camera-handler.service';
import { CesiumClass } from 'src/app/shared/cesium-class';
import { Subscription } from 'rxjs';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
import { EntityPathHandlerService } from 'src/app/services/cesium/entity-path-handler.service';

@Component({
	selector: 'app-cesium-container',
	templateUrl: './cesium-container.component.html',
	styleUrls: ['./cesium-container.component.css'],
})
export class CesiumContainerComponent implements OnInit, AfterViewInit, OnDestroy {
	private viewer: Viewer = CesiumClass.viewer(this.element.nativeElement);
	private viewerSubscription: Subscription = new Subscription();

	constructor(private element: ElementRef, private cameraHandler: CameraHandlerService, private viewerSharer: ViewerSharingService, private pathHandler: EntityPathHandlerService) {}

	ngOnInit() {
		this.viewer.imageryLayers.addImageryProvider(
			//assetId 4 est la carte 2D et 1 est la carte 3D par défaut
			CesiumClass.imagery({ assetId: 4 })
		);
		this.cameraHandler.initCameraData(this.viewer.camera);

		this.pathHandler.initHandler(this.viewer);

		this.viewer.animation.viewModel.setShuttleRingTicks([0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]);

		// S'enregistrer sur le service qui partage le viewer entre les components.
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => (this.viewer = viewer));
	}

	ngAfterViewInit() {
		// met à jour le viewer une fois que les composants sont abonnés.
		this.viewerSharer.setViewer(this.viewer);
	}

	ngOnDestroy() {
		this.viewerSubscription.unsubscribe();
	}
}
