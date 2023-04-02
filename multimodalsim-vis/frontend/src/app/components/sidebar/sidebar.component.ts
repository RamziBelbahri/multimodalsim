import { Component, OnInit } from '@angular/core';
import { Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { EntityLabelHandlerService } from 'src/app/services/cesium/entity-label-handler.service';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from 'src/app/services/communication/communication.service';
import { SaveModalComponent } from '../save-modal/save-modal.component';
import { EntityPathHandlerService } from 'src/app/services/cesium/entity-path-handler.service';
import { VehiclePositionHandlerService } from 'src/app/services/cesium/vehicle-position-handler.service';
import { InteractionComponent } from '../interaction/interaction.component';
import { LaunchModalComponent } from '../launch-modal/launch-modal.component';
import { result } from 'lodash';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
	private readonly OPTION_PIXEL_SIZE = 49.2;
	private readonly OPTION_PIXEL_MARGIN = 5;
	isRunning: boolean;

	private subMenuList: Array<HTMLElement> = new Array<HTMLElement>();
	private openedMenuList: Array<number> = new Array<number>();

	private viewer: Viewer | undefined;
	private viewerSubscription: Subscription = new Subscription();
	private vehicleTypesSubscription: Subscription = new Subscription();

	transportModeList: Map<string, boolean> = new Map<string, boolean>();

	constructor(
		private dialog: MatDialog,
		private entityHandler: EntityLabelHandlerService,
		private viewerSharer: ViewerSharingService,
		private pathHandler: EntityPathHandlerService,
		private vehicleHandler: VehiclePositionHandlerService
	) {
		this.isRunning = false;
	}

	ngOnInit() {
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => {
			this.viewer = viewer;

			this.entityHandler.initHandler(this.viewer);
		});

		this.vehicleTypesSubscription = this.vehicleHandler.vehicleTypeListObservable.subscribe((typeList) => {
			for (const type of typeList) {
				this.transportModeList.set(type, true);
			}

			if (this.transportModeList.size > 0) {
				this.enableButton('mode-menu-button');
			}
		});

		this.subMenuList.push(document.getElementById('sub-menu-mode') as HTMLElement);
	}

	ngOnDestroy() {
		this.viewerSubscription.unsubscribe();
	}

	open(): void {
		(document.getElementById('sidebar-menu') as HTMLElement).style.width = '340px';

		if (this.transportModeList.size <= 0) {
			this.disableButton('mode-menu-button');
		}
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

	private disableButton(id: string): void {
		const element = document.getElementById(id) as HTMLElement;
		element.style.backgroundColor = '#b1b1b1';
		element.style.marginBottom = '10px';
		element.style.pointerEvents = 'none';
	}

	private enableButton(id: string): void {
		const element = document.getElementById(id) as HTMLElement;
		element.style.backgroundColor = '#e7e7e7';
		element.style.marginBottom = '5px';
		element.style.pointerEvents = 'auto';
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

	openLaunchModal(): void {
		const dialogRef = this.dialog.open(LaunchModalComponent, {
			height: '400px',
			width: '600px',
		});
		dialogRef.afterClosed().subscribe((result) => this.setSimulationState(result.isRunning));
	}

	setSimulationState(isRunning: boolean): void {
		this.isRunning = isRunning;
	}

	// Changer la visibilité d'un mode de transport
	changeModeVisibility(type: string): void {
		const newValue = !(this.transportModeList.get(type) as boolean);
		this.transportModeList.set(type, newValue);

		this.viewer?.entities.values.forEach((entity) => {
			if (entity.name == type) {
				entity.show = newValue;
			}
		});

		if (!newValue && this.pathHandler.lastEntityType == type) {
			this.pathHandler.clearLists(this.viewer as Viewer);
		}
	}

	openStats(): void {
		(document.getElementById('stats-container') as HTMLElement).style.visibility = 'visible';
	}
}
