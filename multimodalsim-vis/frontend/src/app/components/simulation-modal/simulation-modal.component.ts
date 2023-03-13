import { Component } from '@angular/core';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';
import { Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';

@Component({
	selector: 'app-simulation-modal',
	templateUrl: './simulation-modal.component.html',
	styleUrls: ['./simulation-modal.component.css'],
})
export class SimulationModalComponent {
	private viewer: Viewer | undefined;
	private viewerSubscription: Subscription = new Subscription();

	constructor(private dataReaderService: DataReaderService, private viewerSharer: ViewerSharingService) {}

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

	readContent(): void {
		const csvInput: HTMLInputElement = document.getElementById('csvinput') as HTMLInputElement;
		if (csvInput.value != '') this.dataReaderService.readCSV();
		const zipInput: HTMLInputElement = document.getElementById('zipinput') as HTMLInputElement;
		if (zipInput.value != '') this.dataReaderService.readZipContent();
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
