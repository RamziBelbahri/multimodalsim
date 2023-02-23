import { Component } from '@angular/core';
import { SimulationParserService } from 'src/app/services/simulation-parser/simulation-parser.service';
import { ZipHandlerComponent } from 'src/app/components/zip-handler/zip-handler.component';
import { ZipParserService } from 'src/app/services/simulation-parser/zip-parser.service';

@Component({
	selector: 'app-simulation-modal',
	templateUrl: './simulation-modal.component.html',
	styleUrls: ['./simulation-modal.component.css'],
})
export class SimulationModalComponent {
	constructor(private simulationParserService: SimulationParserService, private zipHandlerService: ZipParserService) {}

	selectFile(event: Event): void {
		this.simulationParserService.selectFile(event);
	}

	selectZip(event: Event): void {
		this.zipHandlerService.changeListener(event);
	}

	readContent(): void {
		const csvInput: HTMLInputElement = document.getElementById('csvinput') as HTMLInputElement;
		if (csvInput.value != '') this.simulationParserService.readFile();
		// const zipInput: HTMLInputElement = document.getElementById('zipInput') as HTMLInputElement;
		// if (zipInput.value != '') ZipHandlerComponent.zipHandler.readZipContent();
		const zipInput: HTMLInputElement = document.getElementById('zipinputs') as HTMLInputElement;
		if (zipInput.value != '') this.zipHandlerService.readZipContent();
		this.closeModal();
	}

	closeModal(): void {
		(document.getElementById('modal-container') as HTMLElement).style.visibility = 'hidden';
		(document.getElementById('page-container') as HTMLElement).style.visibility = 'hidden';
	}
}
