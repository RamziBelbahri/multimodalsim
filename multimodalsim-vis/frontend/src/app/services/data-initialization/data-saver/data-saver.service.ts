import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';

@Injectable({
	providedIn: 'root',
})
export class DataSaverService {
	constructor() {}

	saveAsZip(): void {
		console.log('zip saved');
		this.saveFile();
	}

	private saveFile(): void {
		const blob = new Blob(['Hello, world!'], { type: 'text/plain;charset=utf-8' });
		saveAs(blob, 'hello world.csv');
	}
}
