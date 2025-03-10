import { Component, OnInit } from '@angular/core';
import { JulianDate, Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { EntityLabelHandlerService } from 'src/app/services/cesium/entity-label-handler.service';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';
import { MatDialog } from '@angular/material/dialog';
import { CommunicationService } from 'src/app/services/communication/communication.service';
import { SaveModalComponent } from '../save-modal/save-modal.component';
import { DataReaderService } from 'src/app/services/data-initialization/data-reader/data-reader.service';
import { EntityPathHandlerService } from 'src/app/services/cesium/entity-path-handler.service';
import { VehiclePositionHandlerService } from 'src/app/services/cesium/vehicle-position-handler.service';
import { LaunchModalComponent } from '../launch-modal/launch-modal.component';
import { DateParserService } from 'src/app/services/util/date-parser.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as currentSimulation from 'src/app/helpers/session-storage';
import { enableButton, disableButton } from 'src/app/services/util/toggle-button';
import { MenuNotifierService } from 'src/app/services/util/menu-notifier.service';
import { SimulationModalComponent } from '../simulation-modal/simulation-modal.component';

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
	private vehicleTypesSubscription: Subscription = new Subscription();

	parameterList: Array<string> = new Array<string>();
	manipOptionList: Array<string> = new Array<string>();
	savedSimulationsList: Array<string> = new Array<string>();
	transportModeList: Map<string, boolean> = new Map<string, boolean>();
	isRunning: boolean;
	isSimulationActive: boolean;

	constructor(
		private dialog: MatDialog,
		private entityHandler: EntityLabelHandlerService,
		private viewerSharer: ViewerSharingService,
		private commService: CommunicationService,
		private vehicleHandler: VehiclePositionHandlerService,
		private pathHandler: EntityPathHandlerService,
		private dateParser: DateParserService,
		private snackBar: MatSnackBar,
		private dataReader: DataReaderService,
		private menuNotifier: MenuNotifierService
	) {
		this.isRunning = false;
		this.isSimulationActive = false;
	}

	ngOnInit() {
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => {
			this.viewer = viewer;

			this.entityHandler.initHandler(this.viewer);
		});
		if (currentSimulation.isCurrentSimulationLive() && currentSimulation.isRestart()) {
			this.isRunning = true;
			this.isSimulationActive = true;
		}
		this.vehicleTypesSubscription = this.vehicleHandler.vehicleTypeListObservable.subscribe((typeList) => {
			for (const type of typeList) {
				this.transportModeList.set(type, true);
			}

			if (this.transportModeList.size > 0) {
				enableButton('mode-menu-button', 'goldenrod');
				enableButton('replay-menu-button', 'salmon');
				enableButton('stats-menu-button', 'goldenrod');
				this.loadTime();
			}

			this.savedSimulationsList = [];
		});

		this.subMenuList.push(document.getElementById('sub-menu-mode') as HTMLElement);
		this.subMenuList.push(document.getElementById('sub-menu-replay') as HTMLElement);
		this.subMenuList.push(document.getElementById('sub-menu-savelist') as HTMLElement);

		disableButton('restart-sim-menu-button');
	}

	ngOnDestroy() {
		this.isRunning = false;
		this.isSimulationActive = false;
		this.viewerSubscription.unsubscribe();
	}

	open(): void {
		(document.getElementById('sidebar-menu') as HTMLElement).style.width = '340px';

		if (this.transportModeList.size <= 0) {
			disableButton('mode-menu-button');
			disableButton('replay-menu-button');
			disableButton('stats-menu-button');
		} else {
			this.loadTime();
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

		if (id == 2) {
			this.listSimulations();
		}

		this.toggleContainer(id);
	}

	restartSim() {
		if (confirm('WARNING: this will reload the page')) {
			if (currentSimulation.isCurrentSimulationLive()) {
				this.commService.stopCurrentBackendSimulation().subscribe({
					next: () => {
						currentSimulation.setIsRestart(true);
						document.location.reload();
					},
				});
			} else {
				currentSimulation.setIsRestart(true);
				document.location.reload();
			}
		}
	}

	private toggleContainer(id: number): void {
		this.subMenuList[id].style.pointerEvents = this.openedMenuList.indexOf(id) > -1 ? 'none' : 'auto';
		if (this.openedMenuList.indexOf(id) > -1) {
			this.openedMenuList.splice(this.openedMenuList.indexOf(id), 1);
		} else {
			this.openedMenuList.push(id);
		}
	}

	openSimulationModal(isFromServer: boolean, filename?: string): void {
		if (!this.isSimulationActive && !this.isRunning) {
			this.setSimulationOrigin(isFromServer);
			if (isFromServer && filename) this.dataReader.zipfileNameFromServer = filename;

			if (filename) {
				currentSimulation.setCurrentSimulationName(filename);
			} else {
				currentSimulation.removeSimName();
			}

			currentSimulation.setIsSimulationLive(false);

			(document.getElementById('page-container') as HTMLElement).style.visibility = 'visible';

			const dialogRef = this.dialog.open(SimulationModalComponent, {
				height: '70%',
				width: '50%',
			});
			dialogRef.afterClosed().subscribe((result) => this.setSimulationState(currentSimulation.isCurrentSimulationLive(), result.isRunning));
		} else {
			this.snackBar.open('Il y a une simulation en cours. Pour en lancer une nouvelle, veuillez rafraîchir la page ou terminer le script du simulateur.', '', {
				duration: 5000,
			});
		}
	}

	openUploadStopsFile(): void {
		(document.getElementById('stops-file') as HTMLElement).style.visibility = 'visible';
	}

	openSimulationParamModal(): void {
		(document.getElementById('sim-param-modal') as HTMLElement).style.visibility = 'visible';
	}

	openSaveModal(): void {
		this.dialog.open(SaveModalComponent, {
			height: '400px',
			width: '600px',
		});
	}

	listSimulations(): void {
		this.commService.listSimulations().subscribe((res) => {
			this.savedSimulationsList = res as string[];
		});
	}

	openLaunchModal(): void {
		if (!this.isSimulationActive) {
			const dialogRef = this.dialog.open(LaunchModalComponent, {
				height: '70%',
				width: '70%',
			});

			dialogRef.afterClosed().subscribe((result) => {
				this.setSimulationState(result.isRunning, result.isRunning);
			});
		} else {
			this.snackBar.open('Il y a une simulation en cours. Pour en lancer une nouvelle, veuillez rafraîchir la page ou terminer le script du simulateur.', '', {
				duration: 5000,
			});
		}
	}

	setSimulationState(isRunning: boolean, isActive: boolean): void {
		this.isRunning = isRunning;
		this.isSimulationActive = isActive;
	}

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
		this.menuNotifier.notify('stats-container');
	}

	private loadTime(): void {
		const dateArray = this.dateParser.getSeparateValueFromDate(this.viewer?.clock.startTime as JulianDate);

		(document.getElementById('year-input') as HTMLInputElement).value = dateArray[0];
		(document.getElementById('month-input') as HTMLInputElement).value = dateArray[1];
		(document.getElementById('day-input') as HTMLInputElement).value = dateArray[2];
		(document.getElementById('hour-input') as HTMLInputElement).value = dateArray[3];
		(document.getElementById('minute-input') as HTMLInputElement).value = dateArray[4];
		(document.getElementById('second-input') as HTMLInputElement).value = dateArray[5];
	}

	changeTimeInputsColor(color: string): void {
		const inputs = document.getElementsByClassName('time-input');

		for (let i = 0; i < inputs.length; i++) {
			(inputs[i] as HTMLElement).style.color = color;
		}
	}

	replay(): void {
		const monthNumber = Number((document.getElementById('month-input') as HTMLInputElement).value) - 1;
		const yearNumber = Number((document.getElementById('year-input') as HTMLInputElement).value);

		const date = new Date(
			monthNumber < 1 ? yearNumber - 1 : yearNumber,
			monthNumber < 1 ? 12 : monthNumber,
			Number((document.getElementById('day-input') as HTMLInputElement).value),
			Number((document.getElementById('hour-input') as HTMLInputElement).value) - 5,
			Number((document.getElementById('minute-input') as HTMLInputElement).value),
			Number((document.getElementById('second-input') as HTMLInputElement).value)
		);

		const julianDate = Cesium.JulianDate.fromDate(date);

		if (julianDate >= (this.viewer as Viewer).clock.startTime && julianDate <= (this.viewer as Viewer).clock.currentTime) {
			(this.viewer as Viewer).clock.currentTime = julianDate;
			this.changeTimeInputsColor('black');
			this.close();
		} else {
			this.changeTimeInputsColor('red');

			this.snackBar.open('Le temps doit être entre le temps de départ (' + this.viewer?.clock.startTime.toString() + ') et le temps courant(' + this.viewer?.clock.currentTime.toString(), '', {
				duration: 5000,
			});
		}
	}

	setSimulationOrigin(isFromServer: boolean): void {
		this.dataReader.isSavedSimulationFromServer.next(isFromServer);
	}
}
