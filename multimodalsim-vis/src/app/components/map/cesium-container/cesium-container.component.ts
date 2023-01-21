import { Component, ElementRef } from '@angular/core';

@Component({
	selector: 'app-cesium-container',
	templateUrl: './cesium-container.component.html',
	styleUrls: ['./cesium-container.component.css'],
})
export class CesiumContainerComponent {
	constructor(private element: ElementRef) {}

	ngOnInit() {
		const viewer = new Cesium.Viewer(this.element.nativeElement);

		viewer.imageryLayers.addImageryProvider(
			new Cesium.IonImageryProvider({ assetId: 4 })
		);
	}
}
