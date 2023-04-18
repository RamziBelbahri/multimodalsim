import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { EntityLabelHandlerService } from 'src/app/services/cesium/entity-label-handler.service';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';

@Component({
	selector: 'app-entity-infos',
	templateUrl: './entity-infos.component.html',
	styleUrls: ['./entity-infos.component.css'],
})
export class EntityInfosComponent {
	private readonly OPTION_PIXEL_SIZE = 49.2;
	private readonly OPTION_PIXEL_MARGIN = 5;

	private viewer: Viewer | undefined;
	private viewerSubscription: Subscription = new Subscription();
	private entityInfosSubscription: Subscription = new Subscription();
	private isOpen = false;

	visOptionList: Array<string> = new Array<string>();
	manipOptionList: Array<string> = new Array<string>();

	lat = 0;
	lon = 0;
	passengerAmount = 0;
	passengerList = new Array<string>();

	dragging = false;

	constructor(private dialog: MatDialog, private entityHandler: EntityLabelHandlerService, private viewerSharer: ViewerSharingService) {}

	ngOnInit() {
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => {
			this.viewer = viewer;

			this.entityInfosSubscription = this.entityHandler.currentEntityInfos.subscribe((infos) => {
				const carto = Cesium.Ellipsoid.WGS84.cartesianToCartographic(infos.position);
				this.lon = Cesium.Math.toDegrees(carto.longitude).toFixed(6);
				this.lat = Cesium.Math.toDegrees(carto.latitude).toFixed(6);
				this.passengerAmount = infos.passengers.length;
				this.passengerList = infos.passengers;
			});
		});
	}

	ngOnDestroy() {
		this.viewerSubscription.unsubscribe();
	}

	private open(): void {
		this.isOpen = true;
		(document.getElementById('entity-infos-menu') as HTMLElement).style.width = '33em';
	}

	close(): void {
		this.isOpen = false;
		(document.getElementById('entity-infos-menu') as HTMLElement).style.width = '0em';
	}

	handleDragStart(): void {
		this.dragging = true;
	}

	handleClick(): void {
		if (this.dragging) {
			this.dragging = false;
			return;
		}

		this.isOpen ? this.close() : this.open();
	}
}
