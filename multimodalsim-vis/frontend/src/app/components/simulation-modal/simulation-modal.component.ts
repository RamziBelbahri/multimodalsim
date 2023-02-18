import { Component } from '@angular/core';
import { EntityDataHandlerService } from 'src/app/services/entity-data-handler/entity-data-handler.service';
import { SimulationParserService } from 'src/app/services/simulation-parser/simulation-parser.service';

@Component({
	selector: 'app-simulation-modal',
	templateUrl: './simulation-modal.component.html',
	styleUrls: ['./simulation-modal.component.css'],
})
export class SimulationModalComponent {
	constructor(private simulationParserService: SimulationParserService, private entityDataHandlerService: EntityDataHandlerService) {}

	selectFile(event: Event): void {
		this.simulationParserService.selectFile(event);
	}

	readContent(): void {
		this.simulationParserService.readFile();
		this.closeModal();
	}

	closeModal(): void {
		(document.getElementById('modal-container') as HTMLElement).style.visibility = 'hidden';
		(document.getElementById('page-container') as HTMLElement).style.visibility = 'hidden';
	}
}
