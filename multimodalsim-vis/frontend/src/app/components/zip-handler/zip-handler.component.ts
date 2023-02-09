import { Component } from '@angular/core';
import * as JSZip from 'jszip';

@Component({
	selector: 'app-zip-handler',
	templateUrl: './zip-handler.component.html',
	styleUrls: ['./zip-handler.component.css']
})
export class ZipHandlerComponent{
	changeListener(event:Event): void {

		let input:HTMLInputElement = event.target as HTMLInputElement;
		if(input.files != null) {
			let file:File = input.files[0];
			let reader:FileReader = new FileReader();
			reader.onload = function() {
				console.log(reader.result)
			}
			let zipper:JSZip = JSZip();
			zipper.loadAsync(file).then(function(zip) {
				if(zip.files != undefined) {
					for(let filePath in zip.files) {
						zip.file(filePath)?.async('text').then(function(txt) {
							console.log(txt)
						})
					}
				}
			});

		}

	}
	


}
