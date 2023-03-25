import { Component } from '@angular/core';

@Component({
	selector: 'app-stats-modal',
	templateUrl: './stats-modal.component.html',
	styleUrls: ['./stats-modal.component.css'],
})
export class StatsModalComponent {
	closeModal(): void {
		(document.getElementById('stats-container') as HTMLElement).style.visibility = 'hidden';
	}
}
