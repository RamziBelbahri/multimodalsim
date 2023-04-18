import { Component, EventEmitter, Output } from '@angular/core';
import { CommunicationService } from 'src/app/services/communication/communication.service';

@Component({
	selector: 'app-interaction',
	templateUrl: './interaction.component.html',
	styleUrls: ['./interaction.component.css'],
})
export class InteractionComponent {
	@Output() isTerminated = new EventEmitter<boolean>();
	constructor(private commService: CommunicationService) {}

	pauseSimulation(): void {
		this.commService.pauseSimulation().subscribe((res) => {
			console.log(res);
		});
	}

	continueSimulation(): void {
		this.commService.continueSimulation().subscribe((res) => {
			console.log(res);
		});
	}

	endSimulation(): void {
		this.commService.endSimulation().subscribe((res) => {
			console.log(res);
		});
		this.isTerminated.emit(true);
	}
}
