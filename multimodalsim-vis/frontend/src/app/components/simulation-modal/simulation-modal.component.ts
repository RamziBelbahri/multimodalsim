import { Component } from '@angular/core';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';
import { Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { CommunicationService } from 'src/app/services/communication/communication.service';
import { MatDialogRef } from '@angular/material/dialog';
import { enableButton } from 'src/app/services/util/toggle-button';
import * as currentSimulation from 'src/app/helpers/session-storage';

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

	constructor(private ref: MatDialogRef<SimulationModalComponent>, private dataReader: DataReaderService, private viewerSharer: ViewerSharingService, private commService: CommunicationService) {
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

	selectZip(event: Event): void {
		this.dataReader.selectZip(event);
	}

	launchPreloadedSimulationFromServer() {
		const filename = this.dataReader.zipfileNameFromServer;
		if (filename) {
			this.startProgressSpinner();
			this.commService.getSimulationContent(filename).subscribe(async (res) => {
				if (res.byteLength > 0) {
					await this.dataReader.readZipContentFromServer(res);
					this.endProgressSpinner();
					this.launchSimulation();
				}
			});
		}
	}

	async launchUploadedSimulation() {
		this.startProgressSpinner();
		const zipInput: HTMLInputElement = document.getElementById('zipinput') as HTMLInputElement;
		if (zipInput.files) await this.dataReader.readZipContent();
		this.endProgressSpinner();
		this.launchSimulation();
	}

	async readContent(): Promise<void> {
		const isLive = currentSimulation.isCurrentSimulationLive();
		if (!isLive) {
			if (this.isSavedSimulationFromServer) {
				this.launchPreloadedSimulationFromServer();
			} else {
				this.launchUploadedSimulation();
			}
		}
		enableButton('restart-sim-menu-button', 'yellowgreen');
	}

	launchSimulation(): void {
		if (this.viewer) this.dataReader.launchSimulationOnFrontend(this.viewer, false);
		this.closeModal(true);
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
