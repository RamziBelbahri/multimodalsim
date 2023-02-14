import { Component } from '@angular/core';
import * as JSZip from 'jszip';

@Component({
	selector: 'app-zip-handler',
	templateUrl: './zip-handler.component.html',
	styleUrls: ['./zip-handler.component.css'],
})
export class ZipHandlerComponent {
	changeListener(event: Event): void {
		const input: HTMLInputElement = event.target as HTMLInputElement;
		if (input.files != null) {
			const file: File = input.files[0];
			const reader: FileReader = new FileReader();
			reader.onload = function () {
				console.log(reader.result);
			};
			const zipper: JSZip = JSZip();
			zipper.loadAsync(file).then(function (zip) {
				if (zip.files != undefined) {
					for (const filePath in zip.files) {
						zip
							.file(filePath)
							?.async('text')
							.then(function (txt) {
								console.log(txt);
							});
					}
				}
			});
		}
	}
}
