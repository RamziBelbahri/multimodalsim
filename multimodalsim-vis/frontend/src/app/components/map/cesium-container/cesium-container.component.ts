import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Viewer } from 'cesium';
import { CameraHandlerService } from 'src/app/services/cesium/camera-handler.service';
import { CesiumClass } from 'src/app/shared/cesium-class';
import { Subscription } from 'rxjs';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
import { EntityPathHandlerService } from 'src/app/services/cesium/entity-path-handler.service';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';
import { CommunicationService } from 'src/app/services/communication/communication.service';
import * as currentSimulation from 'src/app/helpers/session-storage';
import { StopPositionHandlerService } from 'src/app/services/cesium/stop-position-handler.service';
import { SimulationParserService } from 'src/app/services/data-initialization/simulation-parser/simulation-parser.service';
import { StopLookupService } from 'src/app/services/util/stop-lookup.service';
import { TimelineHandlerService } from 'src/app/services/cesium/timeline-handler.service';

@Component({
	selector: 'app-cesium-container',
	templateUrl: './cesium-container.component.html',
	styleUrls: ['./cesium-container.component.css'],
})
export class CesiumContainerComponent implements OnInit, AfterViewInit, OnDestroy {
	private viewer: Viewer = CesiumClass.viewer(this.element.nativeElement);
	private viewerSubscription: Subscription = new Subscription();
	@HostListener('window:beforeunload', ['$event']) onPageReload() {
		this.communicationService.endSimulation().subscribe((res) => {
			console.log(res);
		});
	}

	constructor(
		private element: ElementRef,
		private cameraHandler: CameraHandlerService,
		private viewerSharer: ViewerSharingService,
		private pathHandler: EntityPathHandlerService,
		private dataReaderService: DataReaderService,
		private communicationService: CommunicationService,
		private stopPositionHandlerService: StopPositionHandlerService,
		private simulationParserService: SimulationParserService,
		private stopLookup: StopLookupService,
		private timelineHandler: TimelineHandlerService
	) {}

	ngOnInit() {
		this.viewer.imageryLayers.addImageryProvider(
			//assetId 4 est la carte 2D et 1 est la carte 3D par défaut
			CesiumClass.imagery({ assetId: 4 })
		);
		this.cameraHandler.initCameraData(this.viewer);

		this.pathHandler.initHandler(this.viewer);
		this.pathHandler.initRealTimeHandler(this.viewer);

		this.timelineHandler.initHandler(this.viewer);

		this.viewer.animation.viewModel.setShuttleRingTicks([0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]);

		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => (this.viewer = viewer));
	}

	ngAfterViewInit() {
		this.viewerSharer.setViewer(this.viewer);

		const simName = currentSimulation.getCurrentSimulationName();
		const isLive = currentSimulation.isCurrentSimulationLive();
		const isRestart = currentSimulation.isRestart();
		console.log(simName, isLive, isRestart);
		if (isRestart) {
			if (isLive) {
				this.autoLaunchLiveSimulation();
			} else {
				alert('Vous pouvez re-uploader les fichiers afin de relancer la simulation avec les mêmes paramètres');
			}
			currentSimulation.removeRestart();
		} else {
			currentSimulation.removeSimName();
			currentSimulation.removeIsLive();
		}
	}

	autoLaunchLiveSimulation() {
		let backendSimulationRestarted = false;
		let frontendRestarted = false;
		this.communicationService.restartBackendSimulation().subscribe({
			next: (data) => {
				backendSimulationRestarted = true;
				if (backendSimulationRestarted && frontendRestarted) {
					currentSimulation.setIsRestart(false);
				}
			},
		});
		const currentSim = currentSimulation.getCurrentSimulationName();
		console.log('request stops file');
		this.communicationService.requestStopsFile(currentSim ? currentSim : '').subscribe({
			next: (data) => {
				console.log(data);
				frontendRestarted = true;
				const stops = this.simulationParserService.parseFile(data).data;
				this.dataReaderService.setStops(stops);
				for (const line of stops) {
					this.stopLookup.coordinatesIdMapping.set(Number(line['stop_id']), CesiumClass.cartesianDegrees(line['stop_lon'], line['stop_lat']));
				}
				this.stopPositionHandlerService.initStops();
				if (!this.viewer) {
					alert('error: viewer is null');
					return;
				}
				this.dataReaderService.launchSimulationOnFrontend(this.viewer, true);
				if (backendSimulationRestarted && frontendRestarted) {
					currentSimulation.setIsRestart(false);
				}
			},
		});
	}

	ngOnDestroy() {
		this.viewerSubscription.unsubscribe();
	}
}
