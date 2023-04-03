import { Component } from '@angular/core';
import { Stat } from 'src/app/classes/data-classes/stat';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { VehiclePositionHandlerService } from 'src/app/services/cesium/vehicle-position-handler.service';
import { StopPositionHandlerService } from 'src/app/services/cesium/stop-position-handler.service';
import { values } from 'lodash';

@Component({
	selector: 'app-stats-modal',
	templateUrl: './stats-modal.component.html',
	styleUrls: ['./stats-modal.component.css'],
})
export class StatsModalComponent {
	private readonly DEFAULT_STATS = 'assets/custom_stats.json';
	private readonly APIURL = 'http://localhost:8000/api/';

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

	requestStats(): void {
		this.isShowingStats = true;
		this.stats.length = 0;

		this.http
			.get(this.APIURL + 'get-stats')
			.pipe(catchError(this.handleError))
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.subscribe((res: any) => {
				const a = res['values'] as object;
				for (const key in a) {
					if (a.hasOwnProperty.call(a, key)) {
						this.stats.push(new Stat(key, res['values'][key]));
					}
				}
			});
	}

	return(): void {
		this.isShowingStats = false;
		this.stats.length = 0;
	}

	closeModal(): void {
		this.return();
		(document.getElementById('stats-container') as HTMLElement).style.visibility = 'hidden';
	}

	private handleError(error: HttpErrorResponse) {
		if (error.status === 0) {
			console.error('An error occurred:', error.error);
		} else {
			console.error(`Backend returned code ${error.status}, body was: `, error.error);
		}
		return throwError(() => new Error('Something bad happened; please try again later.'));
	}
}
