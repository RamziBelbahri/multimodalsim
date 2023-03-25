import { Component } from '@angular/core';
import { Stat } from 'src/app/classes/data-classes/stat';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
	selector: 'app-stats-modal',
	templateUrl: './stats-modal.component.html',
	styleUrls: ['./stats-modal.component.css'],
})
export class StatsModalComponent {
	jsonPath = 'assets/stats_files/default_stats.json';
	isShowingStats = false;
	stats: Stat[];

	constructor(private http: HttpClient) {
		this.stats = new Array<Stat>();
	}

	loadJson(): void {
		this.http
			.get(this.jsonPath, { responseType: 'text' })
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
