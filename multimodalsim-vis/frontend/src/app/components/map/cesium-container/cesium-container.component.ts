import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Viewer } from 'cesium';
import { CameraHandlerService } from 'src/app/services/cesium/camera-handler.service';
import { EntityDataHandlerService } from 'src/app/services/entity-data-handler/entity-data-handler.service';
import { CesiumClass } from 'src/app/shared/cesium-class';
import { Subscription } from 'rxjs';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
@Component({
	selector: 'app-cesium-container',
	templateUrl: './cesium-container.component.html',
	styleUrls: ['./cesium-container.component.css'],
})
export class CesiumContainerComponent implements OnInit, AfterViewInit, OnDestroy {
	private viewer: Viewer = CesiumClass.viewer(this.element.nativeElement);
	private viewerSubscription: Subscription = new Subscription();

	constructor(private element: ElementRef, private cameraHandler: CameraHandlerService, private entityDataHandlerService: EntityDataHandlerService, private viewerSharer: ViewerSharingService) {}

	ngOnInit() {
		this.viewer.imageryLayers.addImageryProvider(
			//assetId 4 est la carte 2D et 1 est la carte 3D par défaut
			CesiumClass.imagery({ assetId: 4 })
		);
		this.cameraHandler.initCameraData(this.viewer.camera);

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
