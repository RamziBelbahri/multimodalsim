import { Component, OnInit } from '@angular/core';
import { Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { EntityLabelHandlerService } from 'src/app/services/cesium/entity-label-handler.service';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from 'src/app/services/communication/communication.service';
import { SaveModalComponent } from '../save-modal/save-modal.component';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
	private readonly OPTION_PIXEL_SIZE = 49.2;
	private readonly OPTION_PIXEL_MARGIN = 5;

	private subMenuList: Array<HTMLElement> = new Array<HTMLElement>();
	private openedMenuList: Array<number> = new Array<number>();

	private viewer: Viewer | undefined;
	private viewerSubscription: Subscription = new Subscription();

	transportModeList: Array<string> = new Array<string>();

	constructor(private dialog: MatDialog, private entityHandler: EntityLabelHandlerService, private viewerSharer: ViewerSharingService, private commService: CommunicationService) {}

	ngOnInit() {
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => {
			this.viewer = viewer;

			this.entityHandler.initHandler(this.viewer);
		});

		this.subMenuList.push(document.getElementById('sub-menu-param') as HTMLElement);

		this.transportModeList.push('bus0');
		this.transportModeList.push('bus1');
	}

	ngOnDestroy() {
		this.viewerSubscription.unsubscribe();
	}

	open(): void {
		(document.getElementById('sidebar-menu') as HTMLElement).style.width = '340px';
	}

	close(): void {
		(document.getElementById('sidebar-menu') as HTMLElement).style.width = '0px';
	}

	toggleSubMenu(id: number, optionAmount: number): void {
		if (Number(this.subMenuList[id].style.opacity) === 0) {
			this.subMenuList[id].style.height = this.OPTION_PIXEL_SIZE * optionAmount + this.OPTION_PIXEL_MARGIN + 'px';
			this.subMenuList[id].style.opacity = '1';
		} else {
			this.subMenuList[id].style.height = '0px';
			this.subMenuList[id].style.opacity = '0';
		}

		this.toggleContainer(id);
	}

	private toggleContainer(id: number): void {
		this.subMenuList[id].style.pointerEvents = this.openedMenuList.indexOf(id) > -1 ? 'none' : 'auto';
		if (this.openedMenuList.indexOf(id) > -1) {
			this.openedMenuList.splice(this.openedMenuList.indexOf(id), 1);
		} else {
			this.openedMenuList.push(id);
		}
	}

	openSimulationModal(): void {
		(document.getElementById('modal-container') as HTMLElement).style.visibility = 'visible';
		(document.getElementById('page-container') as HTMLElement).style.visibility = 'visible';
	}

	openSaveModal(): void {
		this.dialog.open(SaveModalComponent, {
			height: '400px',
			width: '600px',
		});
	}

	openStats(): void {
		(document.getElementById('stats-container') as HTMLElement).style.visibility = 'visible';
	}

	launchSimulation(): void {
		this.commService.startSimulation().subscribe((res) => {
			console.log(res);
		});
	}

	pauseSimulation(): void {
		this.commService.pauseSimulation().subscribe((res) => {
			console.log(res);
		});
	}

	continueSimulation(): void {
		this.commService.continueSimulation().subscribe((res) => {
			console.log(res);
		});
	}
}
