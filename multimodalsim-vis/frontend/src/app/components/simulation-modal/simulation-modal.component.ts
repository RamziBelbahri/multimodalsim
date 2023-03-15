import { Component } from '@angular/core';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';
import { Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
	selector: 'app-simulation-modal',
	templateUrl: './simulation-modal.component.html',
	styleUrls: ['./simulation-modal.component.css'],
})
export class SimulationModalComponent {
	private viewer: Viewer | undefined;
	private viewerSubscription: Subscription = new Subscription();
	mode: ProgressSpinnerMode;
	value: number;

	constructor(private dataReaderService: DataReaderService, private viewerSharer: ViewerSharingService) {
		this.mode = 'determinate';
		this.value = 0;
	}
	ngOnInit() {
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => (this.viewer = viewer));
	}

	ngOnDestroy() {
		this.viewerSubscription.unsubscribe();
	}

	selectFile(event: Event): void {
		this.dataReaderService.selectFile(event);
	}

	selectZip(event: Event): void {
		this.dataReaderService.selectZip(event);
	}

	async readContent(): Promise<void> {
		this.mode = 'indeterminate';
		const csvInput: HTMLInputElement = document.getElementById('csvinput') as HTMLInputElement;
		if (csvInput.value != '') this.dataReaderService.readCSV();
		const zipInput: HTMLInputElement = document.getElementById('zipinput') as HTMLInputElement;
		if (zipInput.value != '') await this.dataReaderService.readZipContent();
		this.mode = 'determinate';
		this.value = 100;
	}

	launchSimulation(): void {
		if (this.viewer) this.dataReaderService.launchSimulation(this.viewer, false);
		this.closeModal();
	}

	closeModal(): void {
		(document.getElementById('modal-container') as HTMLElement).style.visibility = 'hidden';
		(document.getElementById('page-container') as HTMLElement).style.visibility = 'hidden';
	}
}
