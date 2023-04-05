import { Component } from '@angular/core';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';
import { Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { CommunicationService } from 'src/app/services/communication/communication.service';

@Component({
	selector: 'app-simulation-modal',
	templateUrl: './simulation-modal.component.html',
	styleUrls: ['./simulation-modal.component.css'],
})
export class SimulationModalComponent {
	private viewer: Viewer | undefined;
	private viewerSubscription: Subscription = new Subscription();
	isSavedSimulationFromServer: boolean;
	private isSavedSimulationFromServerSubscription: Subscription; 
	mode!: ProgressSpinnerMode;
	value!: number;

	constructor(private dataReader: DataReaderService, private viewerSharer: ViewerSharingService,
				private commService: CommunicationService) {
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
		if (this.isSavedSimulationFromServer){
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
		}
		else {	
			this.startProgressSpinner();
			const csvInput: HTMLInputElement = document.getElementById('csvinput') as HTMLInputElement;
			if (csvInput.value != '') this.dataReader.readCSV();
			const zipInput: HTMLInputElement = document.getElementById('zipinput') as HTMLInputElement;
			if (zipInput.value != '') await this.dataReader.readZipContent();
			this.endProgressSpinner();
		}
	}

	launchSimulation(): void {
		if (this.viewer) this.dataReader.launchSimulation(this.viewer, false);
		this.closeModal();
	}

	launchSavedSimulation():void {
		// get the stops file
		if(this.commService.simulationToFetch) {
			this.commService.getStopsFile(this.commService.simulationToFetch);
		}
	}


	deleteSavedSimulation(): void {
		const filename = this.dataReader.zipfileNameFromServer;
		if (filename) {
			this.startProgressSpinner();
			this.commService.deleteSavedSimulation(filename).subscribe((res) => {
				this.endProgressSpinner();
			});
			this.closeModal();
		}
	}

	closeModal(): void {
		(document.getElementById('modal-container') as HTMLElement).style.visibility = 'hidden';
		(document.getElementById('page-container') as HTMLElement).style.visibility = 'hidden';
		this.initProgressSpinner();
	}
}
