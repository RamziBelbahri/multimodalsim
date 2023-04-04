import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { StopPositionHandlerService } from 'src/app/services/cesium/stop-position-handler.service';
import { CommunicationService } from 'src/app/services/communication/communication.service';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';
import { SimulationParserService } from 'src/app/services/data-initialization/simulation-parser/simulation-parser.service';

@Component({
	selector: 'app-launch-modal',
	templateUrl: './launch-modal.component.html',
	styleUrls: ['./launch-modal.component.css'],
})
export class LaunchModalComponent {
	folder: string | undefined;
	target: HTMLInputElement | undefined;
	constructor(
		private dialogRef: MatDialogRef<LaunchModalComponent>,
		private commService: CommunicationService,
		private simulationParserService:SimulationParserService,
		private dataReaderService:DataReaderService,
		private stopPositionHandlerService:StopPositionHandlerService
	) {}

	selectFile(event: Event): void {
		const target = event.target as HTMLInputElement;
		const selectedFile = (target.files as FileList)[0];
		// console.log(target.files)
		this.folder = selectedFile.webkitRelativePath.split('/')[0];
		this.target = target;
	}

	launchSimulation(): void {
		const formData = new FormData();
		if(this.target && this.target.files) {
			for(let i = 0; i < this.target.files?.length; i++) {
				const path = encodeURIComponent(this.target.files[i].webkitRelativePath);
				formData.append(path, this.target.files[i], this.target.files[i].name);
				if(this.target.files[i].name.endsWith('stops.txt')) {
					this.target.files[i].text().then((txt:string) => {
						const csvData = this.simulationParserService.parseFile(txt).data;
						console.log(csvData);
						this.dataReaderService.parseStopsFile(csvData);
						this.stopPositionHandlerService.initStops();
					});
				}
			}
		}
		const log_level_select = document.getElementById('log-levels') as HTMLSelectElement;
		const log_level = log_level_select.options[log_level_select.selectedIndex].text;
		formData.append('log-level', log_level);

		const osrmInput = document.getElementById('osrm-server') as HTMLInputElement;
		const osrm = osrmInput.checked;
		formData.append('osrm', osrm ? 'true':'false');

		const simulationNameInput = document.getElementById('simulation-name') as HTMLInputElement;
		const simulationName = simulationNameInput.value;
		formData.append('simulationName', simulationName);

		this.commService.uploadFile(formData);
		
	}

	closeModal(): void {
		this.dialogRef.close({ isRunning: false });
	}
}
