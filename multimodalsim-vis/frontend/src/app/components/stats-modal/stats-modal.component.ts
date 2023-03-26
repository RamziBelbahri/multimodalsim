import { Component } from '@angular/core';
import { Stat } from 'src/app/classes/data-classes/stat';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { VehiclePositionHandlerService } from 'src/app/services/cesium/vehicle-position-handler.service';
import { StopPositionHandlerService } from 'src/app/services/cesium/stop-position-handler.service';

@Component({
	selector: 'app-stats-modal',
	templateUrl: './stats-modal.component.html',
	styleUrls: ['./stats-modal.component.css'],
})
export class StatsModalComponent {
	private readonly DEFAULT_STATS = 'assets/custom_stats.json';

	isShowingStats = false;
	stats: Stat[];

	constructor(private http: HttpClient, private vehicleHandler: VehiclePositionHandlerService, private stopHandler: StopPositionHandlerService) {
		this.stats = new Array<Stat>();
	}

	loadEntityNumber(): void {
		this.stats.push(new Stat('Nombre de bus dans la simulation', this.vehicleHandler.getVehicleIdMapping().size.toString()));
		this.stats.push(new Stat('Nombre de passagers dans la simulation', this.stopHandler.getTotalPassengerAmount().toString()));

		this.isShowingStats = true;
	}

	loadJson(): void {
		this.http
			.get(this.DEFAULT_STATS, { responseType: 'text' })
			.pipe(map((res: string) => JSON.parse(res)))
			.subscribe((data) => {
				this.stats = data;
			});

		this.isShowingStats = true;
	}

	closeModal(): void {
		(document.getElementById('stats-container') as HTMLElement).style.visibility = 'hidden';
	}
}
