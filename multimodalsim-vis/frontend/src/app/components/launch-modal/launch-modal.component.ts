import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommunicationService } from 'src/app/services/communication/communication.service';

@Component({
	selector: 'app-launch-modal',
	templateUrl: './launch-modal.component.html',
	styleUrls: ['./launch-modal.component.css'],
})
export class LaunchModalComponent {
	constructor(private dialogRef: MatDialogRef<LaunchModalComponent>, private commService: CommunicationService) {}

	launchSimulation(): void {
		this.commService.startSimulation().subscribe((res) => {
			console.log(res);
		});
		this.dialogRef.close({ isRunning: true });
	}

	closeModal(): void {
		this.dialogRef.close({ isRunning: false });
	}
}
