import { Component } from '@angular/core';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';

@Component({
	selector: 'app-simulation-modal',
	templateUrl: './simulation-modal.component.html',
	styleUrls: ['./simulation-modal.component.css'],
})
export class SimulationModalComponent {
	constructor(private dataReaderService: DataReaderService) {}

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
		this.closeModal();
	}

	closeModal(): void {
		(document.getElementById('modal-container') as HTMLElement).style.visibility = 'hidden';
		(document.getElementById('page-container') as HTMLElement).style.visibility = 'hidden';
	}
}
