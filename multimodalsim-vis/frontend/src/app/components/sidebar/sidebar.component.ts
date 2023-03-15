import { Component, OnInit } from '@angular/core';
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

	parameterList: Array<string> = new Array<string>();
	visOptionList: Array<string> = new Array<string>();
	manipOptionList: Array<string> = new Array<string>();

	constructor(private dialog: MatDialog, private commService: CommunicationService) {}

	ngOnInit() {
		this.subMenuList.push(document.getElementById('sub-menu-param') as HTMLElement);
		this.subMenuList.push(document.getElementById('sub-menu-vis') as HTMLElement);
		this.subMenuList.push(document.getElementById('sub-menu-manip') as HTMLElement);

		this.parameterList.push('Paramètre 1');
		this.parameterList.push('Paramètre 2');
		this.parameterList.push('Paramètre 3');

		this.visOptionList.push('Temps d\'attente moyen');
		this.visOptionList.push('Temps de parcours moyen');
		this.visOptionList.push('Nombre de lignes d\'autobus');
		this.visOptionList.push('Nombre de types de transport');
		this.visOptionList.push('Types de modes de transport');

		this.manipOptionList.push('Manipulations');
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

	launchSimulation(): void {
		this.commService.getStatus().subscribe((res) => {
			console.log(res);
		});
	}
}
