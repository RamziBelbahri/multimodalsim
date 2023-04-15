import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
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

@Component({
	selector: 'app-cesium-container',
	templateUrl: './cesium-container.component.html',
	styleUrls: ['./cesium-container.component.css'],
})
export class CesiumContainerComponent implements OnInit, AfterViewInit, OnDestroy {
	private viewer: Viewer = CesiumClass.viewer(this.element.nativeElement);
	private viewerSubscription: Subscription = new Subscription();

	constructor(
		private element: ElementRef,
		private cameraHandler: CameraHandlerService,
		private viewerSharer: ViewerSharingService,
		private pathHandler: EntityPathHandlerService,
		private dataReaderService:DataReaderService,
		private communicationService:CommunicationService,
		private stopPositionHandlerService: StopPositionHandlerService,
		private simulationParserService:SimulationParserService,
		private stopLookup:StopLookupService,
	) {}

	ngOnInit() {
		this.viewer.imageryLayers.addImageryProvider(
			//assetId 4 est la carte 2D et 1 est la carte 3D par défaut
			CesiumClass.imagery({ assetId: 4 })
		);
		this.cameraHandler.initCameraData(this.viewer);

		this.pathHandler.initHandler(this.viewer);
		this.pathHandler.initRealTimeHandler(this.viewer);

		this.viewer.animation.viewModel.setShuttleRingTicks([0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]);

		// S'enregistrer sur le service qui partage le viewer entre les components.
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => (this.viewer = viewer));
	}

	ngAfterViewInit() {
		// met à jour le viewer une fois que les composants sont abonnés.
		this.viewerSharer.setViewer(this.viewer);
		// TODO
		// const simName = window.sessionStorage.getItem(SESSION_STORAGE_KEYS.SIMULATION_TO_FETCH);
		// if(!simName || simName == '') return;
		// this.pathHandler.isRealtime = window.sessionStorage.getItem(SESSION_STORAGE_KEYS.SIMULATION_TO_FETCH) == 'true';
		// console.log(this.viewerSharingService.viewer);
		// this.dataReaderService.launchSimulationOnFrontend(this.viewer, true);
		// this.communicationService.launchExistingBackendSimulation(simName);

		const simName = currentSimulation.getCurrentSimulationName();
		const isLive = currentSimulation.isCurrentSimulationLive();
		const isRestart = currentSimulation.isRestart();
		console.log(simName, isLive, isRestart);
		if(!isRestart) {
			currentSimulation.removeSimName();
			currentSimulation.removeIsLive();
		}  else if (isRestart && simName) {
			if(isLive) {
				this.autoLaunchLiveSimulation();
			} else {
				this.autoLaunchPreloadedSimulation();
			}
			currentSimulation.removeRestart();
		}

	}

	autoLaunchLiveSimulation() {
		this.communicationService.restartBackendSimulation().subscribe({
			next: (data) => {
				const currentSim = currentSimulation.getCurrentSimulationName();
				this.communicationService.requestStopsFile(currentSim ? currentSim : '').subscribe({
					next: (data) => {
						const stops = this.simulationParserService.parseFile(data).data;
						for (const line of stops) {
							this.stopLookup.coordinatesIdMapping.set(Number(line['stop_id']), CesiumClass.cartesianDegrees(line['stop_lon'], line['stop_lat']));
						}
						this.stopPositionHandlerService.initStops();
						if(!this.viewer) {
							alert('error: viewer is null');
							return;
						}
						this.dataReaderService.launchSimulationOnFrontend(this.viewer, true);
					}
				});
			}
		});
		
	}

	autoLaunchPreloadedSimulation() {
		this.communicationService.getPreloadedFiles().subscribe({
			next: (data) => {console.log(data);}
		})
	}

	ngOnDestroy() {
		this.viewerSubscription.unsubscribe();
	}
}
