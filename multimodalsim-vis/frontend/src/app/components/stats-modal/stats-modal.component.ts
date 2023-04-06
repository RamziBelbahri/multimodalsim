import { Component } from '@angular/core';
import { Stat } from 'src/app/classes/data-classes/stat';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Subscription, catchError, throwError } from 'rxjs';
import { VehiclePositionHandlerService } from 'src/app/services/cesium/vehicle-position-handler.service';
import { StopPositionHandlerService } from 'src/app/services/cesium/stop-position-handler.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MenuNotifierService } from 'src/app/services/util/menu-notifier.service';

@Component({
	selector: 'app-stats-modal',
	templateUrl: './stats-modal.component.html',
	styleUrls: ['./stats-modal.component.css'],
})
export class StatsModalComponent {
	private readonly APIURL = 'http://localhost:8000/api/';
	private entityNumber: Stat[];
	private notifSubscription: Subscription = new Subscription();

	sanitizedBlobUrl: SafeUrl | undefined;
	showedStats: Stat[];
	customStats: Map<string, string>;

	constructor(
		private http: HttpClient,
		private vehicleHandler: VehiclePositionHandlerService,
		private stopHandler: StopPositionHandlerService,
		private sanitizer: DomSanitizer,
		private menuNotifier: MenuNotifierService
	) {
		this.showedStats = new Array<Stat>();
		this.entityNumber = new Array<Stat>();
		this.customStats = new Map<string, string>();
	}

	ngOnInit() {
		this.notifSubscription = this.menuNotifier.state.subscribe((name) => {
			if (name == 'stats-container') {
				this.loadEntityNumber();
			}
		});
	}

	loadEntityNumber(): void {
		this.showedStats.length = 0;

		this.entityNumber.push(new Stat('Nombre de bus dans la simulation', this.vehicleHandler.getVehicleIdMapping().size.toString()));
		this.entityNumber.push(new Stat('Nombre de passagers dans la simulation', this.stopHandler.getTotalPassengerAmount().toString()));

		this.showedStats = this.entityNumber;
	}

	requestStats(): void {
		this.showedStats.length = 0;

		this.http
			.get(this.APIURL + 'get-stats')
			.pipe(catchError(this.handleError))
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			.subscribe((res: any) => {
				const statDictionnary = res['values'] as object;
				for (const key in statDictionnary) {
					if (statDictionnary.hasOwnProperty.call(statDictionnary, key)) {
						this.customStats.set(key, res['values'][key]);
					}
				}

				this.customStats.forEach((value: string, field: string) => {
					this.showedStats.push(new Stat(field, value));
				});

				this.saveStats();
			});
	}

	private saveStats(): void {
		const json = [];

		for (const stat of this.customStats) {
			json.push(stat[0], stat[1]);
		}

		const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
		const url = window.URL.createObjectURL(blob);
		this.sanitizedBlobUrl = this.sanitizer.bypassSecurityTrustUrl(url);
	}

	closeModal(): void {
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
