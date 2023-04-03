import { Component } from '@angular/core';
import { Stat } from 'src/app/classes/data-classes/stat';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { VehiclePositionHandlerService } from 'src/app/services/cesium/vehicle-position-handler.service';
import { StopPositionHandlerService } from 'src/app/services/cesium/stop-position-handler.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
	selector: 'app-stats-modal',
	templateUrl: './stats-modal.component.html',
	styleUrls: ['./stats-modal.component.css'],
})
export class StatsModalComponent {
	private readonly APIURL = 'http://localhost:8000/api/';

	sanitizedBlobUrl: SafeUrl | undefined;
	isShowingStats = false;
	stats: Stat[];

	constructor(private http: HttpClient, private vehicleHandler: VehiclePositionHandlerService, private stopHandler: StopPositionHandlerService, private sanitizer: DomSanitizer) {
		this.stats = new Array<Stat>();
	}

	loadEntityNumber(): void {
		this.stats.length = 0;

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
				const statDictionnary = res['values'] as object;
				for (const key in statDictionnary) {
					if (statDictionnary.hasOwnProperty.call(statDictionnary, key)) {
						this.stats.push(new Stat(key, res['values'][key]));
					}
				}

				this.saveStats();
			});
	}

	private saveStats(): void {
		const json = [];

		for (const stat of this.stats) {
			json.push(stat.field, stat.value);
		}

		const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
		const url = window.URL.createObjectURL(blob);
		this.sanitizedBlobUrl = this.sanitizer.bypassSecurityTrustUrl(url);
	}

	return(): void {
		this.isShowingStats = false;
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
