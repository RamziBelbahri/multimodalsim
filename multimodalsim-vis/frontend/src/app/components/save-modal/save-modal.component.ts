import { Component } from '@angular/core';
import { DataSaverService } from 'src/app/services/data-initialization/data-saver/data-saver.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'app-save-modal',
	templateUrl: './save-modal.component.html',
	styleUrls: ['./save-modal.component.css'],
})
export class SaveModalComponent {

	constructor(private dataSaverService: DataSaverService, private dialogRef: MatDialogRef<SaveModalComponent>) {}

	saveAsZip(): void {
		this.dataSaverService.saveAsZip();
	}

	closeModal(): void {
		this.dialogRef.close();
	}
}
