import { Component } from '@angular/core';
import { SimulationParserService } from 'src/app/services/simulation-parser/simulation-parser.service';
import { ZipHandlerComponent } from 'src/app/components/zip-handler/zip-handler.component';
import { Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { CesiumClass } from 'src/app/shared/cesium-class';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';

@Component({
	selector: 'app-simulation-modal',
	templateUrl: './simulation-modal.component.html',
	styleUrls: ['./simulation-modal.component.css'],
})
export class SimulationModalComponent {
	private viewer: Viewer = CesiumClass.viewer('');
	private viewerSubscription: Subscription = new Subscription();

	constructor(private simulationParserService: SimulationParserService, private viewerSharer: ViewerSharingService) {}

	ngOnInit() {
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => (this.viewer = viewer));
	}

	selectFile(event: Event): void {
		this.simulationParserService.selectFile(event);
	}

	readContent(): void {
		const csvInput: HTMLInputElement = document.getElementById('csvinput') as HTMLInputElement;
		if (csvInput.value != '') this.simulationParserService.readFile();
		const zipInput: HTMLInputElement = document.getElementById('zipInput') as HTMLInputElement;
		if (zipInput.value != '') ZipHandlerComponent.zipHandler.readZipContent();
		this.closeModal();
	}

	closeModal(): void {
		(document.getElementById('modal-container') as HTMLElement).style.visibility = 'hidden';
		(document.getElementById('page-container') as HTMLElement).style.visibility = 'hidden';
	}
}
