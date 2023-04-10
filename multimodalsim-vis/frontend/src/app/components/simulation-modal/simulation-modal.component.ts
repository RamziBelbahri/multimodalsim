import { Component } from '@angular/core';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';
import { Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { CommunicationService } from 'src/app/services/communication/communication.service';
import { StopLookupService } from 'src/app/services/util/stop-lookup.service';
import { SimulationParserService } from 'src/app/services/data-initialization/simulation-parser/simulation-parser.service';
import { CesiumClass } from 'src/app/shared/cesium-class';
import { StopPositionHandlerService } from 'src/app/services/cesium/stop-position-handler.service';
import * as LOCAL_STORAGE_KEYS from 'src/app/helpers/local-storage-keys';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-simulation-modal',
	templateUrl: './simulation-modal.component.html',
	styleUrls: ['./simulation-modal.component.css'],
})
export class SimulationModalComponent {
	private viewer: Viewer | undefined;
	private viewerSubscription: Subscription = new Subscription();
	private isSavedSimulationFromServerSubscription: Subscription;

	isSavedSimulationFromServer: boolean;
	mode!: ProgressSpinnerMode;
	value!: number;

	constructor(
		private ref: MatDialogRef<SimulationModalComponent>,
		private dataReader: DataReaderService,
		private viewerSharer: ViewerSharingService,
		private commService: CommunicationService,
		// private dataReaderService:DataReaderService,
		private stopLookup:StopLookupService,
		private simulationParserService:SimulationParserService,
		private stopPositionHandlerService:StopPositionHandlerService
	) {
		this.initProgressSpinner();
		this.isSavedSimulationFromServer = this.dataReader.isSavedSimulationFromServer.value;
		this.isSavedSimulationFromServerSubscription = this.dataReader.isSavedSimulationFromServer.subscribe((isFromServer) => (this.isSavedSimulationFromServer = isFromServer));
	}

	ngOnInit() {
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => (this.viewer = viewer));
	}

	ngOnDestroy() {
		this.viewerSubscription.unsubscribe();
		this.isSavedSimulationFromServerSubscription.unsubscribe();
	}

	initProgressSpinner(): void {
		this.mode = 'determinate';
		this.value = 0;
	}

	startProgressSpinner(): void {
		this.mode = 'indeterminate';
	}

	endProgressSpinner(): void {
		this.mode = 'determinate';
		this.value = 100;
	}

	selectFile(event: Event): void {
		this.dataReader.selectFile(event);
	}

	selectZip(event: Event): void {
		this.dataReader.selectZip(event);
	}

	async readContent(): Promise<void> {
		if (this.isSavedSimulationFromServer) {
			const filename = this.dataReader.zipfileNameFromServer;
			if (filename) {
				this.startProgressSpinner();
				this.commService.getSimulationContent(filename).subscribe(async (res) => {
					if (res.byteLength > 0) {
						await this.dataReader.readZipContentFromServer(res);
						this.endProgressSpinner();
					}
				});
			}
		} else {
			this.startProgressSpinner();
			const zipInput: HTMLInputElement = document.getElementById('zipinput') as HTMLInputElement;
			if (zipInput.files) await this.dataReader.readZipContent();
			this.endProgressSpinner();

			this.launchSimulation();
		}
	}

	launchSimulation(): void {
		if (this.viewer) this.dataReader.launchSimulation(this.viewer, false);
		this.closeModal(true);
	}

	async launchSavedSimulation():Promise<void> {
		// get the stops file
		const simulationToFetch = window.localStorage.getItem(LOCAL_STORAGE_KEYS.SIMULATION_TO_FETCH);
		if(simulationToFetch && this.viewer) {
			this.commService.requestStopsFile(simulationToFetch).subscribe({
				next: data => {
					const stops = this.simulationParserService.parseFile(data).data;
					for (const line of stops) {
						this.stopLookup.coordinatesIdMapping.set(Number(line['stop_id']), CesiumClass.cartesianDegrees(line['stop_lon'], line['stop_lat']));
					}
					console.log(stops);
					this.stopPositionHandlerService.initStops();
					console.log(this.viewer == undefined, simulationToFetch == undefined);
					if(this.viewer && simulationToFetch) {
						this.commService.launchExistingBackendSimulation(simulationToFetch).subscribe({
							next: data => {console.log(data);},
							error: err => {console.log(err);},
							complete: () => {console.log('complete');}
						});
						this.dataReader.launchSimulation(this.viewer, true);
					}
				},
				error: error => {
					console.error('Error:', error);
				},
				complete: () => {
					console.log('Request completed');
				}
			});
		}
	}


	deleteSavedSimulation(): void {
		const filename = this.dataReader.zipfileNameFromServer;
		if (filename) {
			this.startProgressSpinner();
			this.commService.deleteSavedSimulation(filename).subscribe(() => {
				this.endProgressSpinner();
			});
			this.closeModal(false);
		}
	}

	closeModal(isRunning: boolean): void {
		(document.getElementById('page-container') as HTMLElement).style.visibility = 'hidden';
		this.initProgressSpinner();
		this.ref.close({ isRunning: isRunning });
	}
}
