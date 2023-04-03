import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommunicationService } from 'src/app/services/communication/communication.service';

@Component({
	selector: 'app-launch-modal',
	templateUrl: './launch-modal.component.html',
	styleUrls: ['./launch-modal.component.css'],
})
export class LaunchModalComponent {
	folder: string | undefined;
	constructor(private dialogRef: MatDialogRef<LaunchModalComponent>, private commService: CommunicationService) {}

	selectFile(event: Event): void {
		const target = event.target as HTMLInputElement;
		const selectedFile = (target.files as FileList)[0];
		this.folder = selectedFile.webkitRelativePath.split('/')[0];
	}

	launchSimulation(): void {
		const body = {
			...(this.folder && { folder: this.folder }),
		};
		console.log(body);
		this.commService.startSimulation(body).subscribe((res) => {
			console.log(res);
		});
		this.dialogRef.close({ isRunning: true });
	}

	closeModal(): void {
		this.dialogRef.close({ isRunning: false });
	}
}
