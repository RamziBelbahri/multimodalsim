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
	private notifSubscription: Subscription = new Subscription();

	sanitizedBlobUrl: SafeUrl | undefined;
	numberStats: Stat[];
	vehicleStats: Stat[];
	tripsStats: Stat[];
	customStats: Map<string, string>;
	filterState: Map<string, boolean>;

	constructor(
		private http: HttpClient,
		private vehicleHandler: VehiclePositionHandlerService,
		private stopHandler: StopPositionHandlerService,
		private sanitizer: DomSanitizer,
		private menuNotifier: MenuNotifierService
	) {
		this.numberStats = new Array<Stat>();
		this.vehicleStats = new Array<Stat>();
		this.tripsStats = new Array<Stat>();
		this.customStats = new Map<string, string>();
		this.filterState = new Map<string, boolean>();
	}

	ngOnInit() {
		this.notifSubscription = this.menuNotifier.state.subscribe((name) => {
			if (name == 'stats-container') {
				this.loadEntityNumber();
				this.requestStats();
			}
		});
	}

	loadEntityNumber(): void {
		this.numberStats.length = 0;
		this.filterState.set('Nombre d\'entités', true);

		this.numberStats.push(new Stat('Nombre de bus dans la simulation', this.vehicleHandler.getVehicleIdMapping().size.toString()));
		this.numberStats.push(new Stat('Nombre de passagers dans la simulation', this.stopHandler.getTotalPassengerAmount().toString()));
	}

	requestStats(): void {
		this.vehicleStats.length = 0;

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
					if (field.includes('trip')) {
						this.tripsStats.push(new Stat(field, value));
					} else {
						this.vehicleStats.push(new Stat(field, value));
					}
				});

				this.saveStats();
			});

		this.filterState.set('Stats de véhicules', true);
		this.filterState.set('Stats de voyages', true);
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

	filterStats(id: string): void {
		const newValue = !(this.filterState.get(id) as boolean);
		this.filterState.set(id, newValue);
	}
}
