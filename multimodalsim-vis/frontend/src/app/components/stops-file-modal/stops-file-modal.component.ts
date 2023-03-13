import { Component } from '@angular/core';
import { StopPositionHandlerService } from 'src/app/services/cesium/stop-position-handler.service';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';
import { SimulationParserService } from 'src/app/services/data-initialization/simulation-parser/simulation-parser.service';
import { StopLookupService } from 'src/app/services/util/stop-lookup.service';

@Component({
    selector: 'app-stops-file-modal',
    templateUrl: './stops-file-modal.component.html',
    styleUrls: ['./stops-file-modal.component.css']
})
export class StopsFileModalComponent {
	constructor(
		private dataReaderService:DataReaderService,
		private simulationParserService:SimulationParserService,
		private stopPositionHandlerService: StopPositionHandlerService) {

	}
	closeModal(): void {
		(document.getElementById('stops-file') as HTMLElement).style.visibility = 'hidden';
		(document.getElementById('stops-file-container') as HTMLElement).style.visibility = 'hidden';
	}
	readStopsFile():void {
		const stopsInput = document.getElementById('stopInput') as HTMLInputElement;
		if(!stopsInput) return;
		const files = stopsInput.files;
		if(!files) return;
		files[0].text().then((txt:string) => {
			const csvData = this.simulationParserService.parseFile(txt).data;
			this.dataReaderService.parseStopsFile(csvData);
			console.log(csvData)
			this.stopPositionHandlerService.initStops();
		})
	}
}
