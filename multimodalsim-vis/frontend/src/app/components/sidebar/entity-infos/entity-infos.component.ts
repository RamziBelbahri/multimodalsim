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

	visOptionList: Array<string> = new Array<string>();
	manipOptionList: Array<string> = new Array<string>();

	lat = 0;
	lon = 0;
	passengerAmount = 0;
	passengerList = new Array<string>();

	constructor(private dialog: MatDialog, private entityHandler: EntityLabelHandlerService, private viewerSharer: ViewerSharingService) {}

	ngOnInit() {
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => {
			this.viewer = viewer;

			this.entityInfosSubscription = this.entityHandler.currentEntityInfos.subscribe((infos) => {
				this.lat = infos.position.x;
				this.lon = infos.position.y;
				this.passengerAmount = infos.passengers.length;
				this.passengerList = infos.passengers;
			});
		});
	}

	ngOnDestroy() {
		this.viewerSubscription.unsubscribe();
	}

	open(): void {
		(document.getElementById('entity-infos-menu') as HTMLElement).style.width = '25em';
	}

	close(): void {
		(document.getElementById('entity-infos-menu') as HTMLElement).style.width = '0em';
	}
}
