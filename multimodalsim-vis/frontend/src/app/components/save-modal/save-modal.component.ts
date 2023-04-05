import { Component } from '@angular/core';
import { DataSaverService } from 'src/app/services/data-initialization/data-saver/data-saver.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
	selector: 'app-save-modal',
	templateUrl: './save-modal.component.html',
	styleUrls: ['./save-modal.component.css'],
})
export class SaveModalComponent {
	mode: ProgressSpinnerMode;
	value: number;
	filenameForm: FormGroup;

	constructor(private dataSaver: DataSaverService, private dialogRef: MatDialogRef<SaveModalComponent>) {
		this.mode = 'determinate';
		this.value = 0;
		this.filenameForm = new FormGroup({
			saveZipfileName: new FormControl('', [Validators.pattern('[a-zA-Z0-9-_]*'), Validators.required]),
		});
	}

	async saveAsZip(): Promise<void> {
		if (this.filenameForm.invalid) {
			return;
		}
		this.mode = 'indeterminate';
		await this.dataSaver.saveAsZip(this.fileName);
		this.mode = 'determinate';
		this.value = 0;
		this.clearFileName();
	}

	clearFileName(): void {
		this.filenameForm.get('saveZipfileName')?.setValue('');
	}

	get fileName(): string {
		return this.filenameForm.get('saveZipfileName')?.value as string;
	} 

	isFileNameInvalid(): boolean {
		return this.filenameForm.get('saveZipfileName')?.hasError('pattern') as boolean;
	}

	closeModal(): void {
		this.dialogRef.close();
	}
}
