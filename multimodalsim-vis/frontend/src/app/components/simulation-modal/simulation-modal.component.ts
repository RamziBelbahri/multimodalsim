import { Component } from '@angular/core';
import { SimulationParserService } from 'src/app/services/simulation-parser/simulation-parser.service';

@Component({
	selector: 'app-simulation-modal',
	templateUrl: './simulation-modal.component.html',
	styleUrls: ['./simulation-modal.component.css'],
})
export class SimulationModalComponent {
	constructor(private simulationParserService: SimulationParserService) {}

	selectFile(event: Event): void {
		this.simulationParserService.selectFile(event);
	}

	readContent(): void {
		this.simulationParserService.getCSVData();
	}
}
