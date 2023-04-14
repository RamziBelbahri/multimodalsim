import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { EntityPathHandlerService } from 'src/app/services/cesium/entity-path-handler.service';
import { StopPositionHandlerService } from 'src/app/services/cesium/stop-position-handler.service';
import { CommunicationService } from 'src/app/services/communication/communication.service';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';
import { SimulationParserService } from 'src/app/services/data-initialization/simulation-parser/simulation-parser.service';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
// import * as SESSION_STORAGE_KEYS from 'src/app/helpers/local-storage-keys';
import { Viewer } from 'cesium';

@Component({
	selector: 'app-launch-modal',
	templateUrl: './launch-modal.component.html',
	styleUrls: ['./launch-modal.component.css'],
})
export class LaunchModalComponent {
	folder: string | undefined;
	target: HTMLInputElement | undefined;
	viewer: Viewer|undefined;
	constructor(
		private dialogRef: MatDialogRef<LaunchModalComponent>,
		private commService: CommunicationService,
		private simulationParserService:SimulationParserService,
		private dataReaderService:DataReaderService,
		private stopPositionHandlerService:StopPositionHandlerService,
		private pathHandler:EntityPathHandlerService,
		private viewerSharingService: ViewerSharingService
	) {
		this.viewerSharingService.currentViewer.subscribe((viewer:Viewer) => {
			this.viewer = viewer;
		});
	}

	selectFile(event: Event): void {
		const target = event.target as HTMLInputElement;
		const selectedFile = (target.files as FileList)[0];
		this.folder = selectedFile.webkitRelativePath.split('/')[0];
		this.target = target;
	}

	launchSimulationOnBackend(): void {
		const formData = new FormData();
		if(this.target && this.target.files) {
			for(let i = 0; i < this.target.files?.length; i++) {
				const path = encodeURIComponent(this.target.files[i].webkitRelativePath);
				formData.append(path, this.target.files[i], this.target.files[i].name);
				if(this.target.files[i].name.endsWith('stops.txt')) {
					this.target.files[i].text().then((txt:string) => {
						const csvData = this.simulationParserService.parseFile(txt).data;
						this.dataReaderService.parseStopsFile(csvData);
						this.stopPositionHandlerService.initStops();
						const log_level_select = document.getElementById('log-levels') as HTMLSelectElement;
						const log_level = log_level_select.options[log_level_select.selectedIndex].text;
						formData.append('log-level', log_level);
				
						const osrmInput = document.getElementById('osrm-server') as HTMLInputElement;
						const osrm = osrmInput.checked;
						formData.append('osrm', osrm ? 'true':'false');
				
						const simulationNameInput = document.getElementById('simulation-name') as HTMLInputElement;
						const simulationName = simulationNameInput.value;
						formData.append('simulationName', simulationName);
						// currentSimulation.setCurrentSim(true, simulationName);
						this.pathHandler.isRealtime = true;
						if(this.viewer) {
							this.dataReaderService.launchSimulationOnFrontend(this.viewer, true);
						}
						this.commService.uploadFilesAndLaunch(formData);
					});
				}
			}
		}
		
	}

	closeModal(): void {
		this.dialogRef.close({ isRunning: false });
	}
}
