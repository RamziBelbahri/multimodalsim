import { Component } from '@angular/core';
import { DataSaverService } from 'src/app/services/data-initialization/data-saver/data-saver.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';

@Component({
	selector: 'app-save-modal',
	templateUrl: './save-modal.component.html',
	styleUrls: ['./save-modal.component.css'],
})
export class SaveModalComponent {
	mode: ProgressSpinnerMode;
	value: number;

	constructor(private dataSaverService: DataSaverService, private dialogRef: MatDialogRef<SaveModalComponent>) {
		this.mode = 'determinate';
		this.value = 0;
	}

	async saveAsZip(): Promise<void> {
		this.mode = 'indeterminate';
		await this.dataSaverService.saveAsZip();
		this.mode = 'determinate';
		this.value = 0;
	}

	closeModal(): void {
		this.dialogRef.close();
	}
}
