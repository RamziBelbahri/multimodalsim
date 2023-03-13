import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Viewer } from 'cesium';
import { Subscription } from 'rxjs';
import { EntityLabelHandlerService } from 'src/app/services/cesium/entity-label-handler.service';
import { ViewerSharingService } from 'src/app/services/viewer-sharing/viewer-sharing.service';

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
	private entityInfosSubscription: Subscription = new Subscription();

	parameterList: Array<string> = new Array<string>();
	visOptionList: Array<string> = new Array<string>();
	manipOptionList: Array<string> = new Array<string>();

	entityInfos = new Map<string, any>();
	lat = 0;
	lon = 0;
	passengerAmount = 0;
	passengerList = '';
	
	constructor(private entityHandler: EntityLabelHandlerService, private viewerSharer: ViewerSharingService) {}

	ngOnInit() {
		this.viewerSubscription = this.viewerSharer.currentViewer.subscribe((viewer) => {
			this.viewer = viewer;
			//appel à au handler findClickedEntityId
			this.entityHandler.findClickedEntityId(this.viewer);
			this.entityInfosSubscription =  this.entityHandler.currentEntityInfos.subscribe((infos)=>{
				this.entityInfos = infos;
				this.lat = infos.get('position')[0];
				this.lon =infos.get('position')[1];
				this.passengerAmount = infos.get('passengerAmount')? infos.get('passengerAmount'):'';
				this.passengerList = infos.get('passengerList')? infos.get('passengerList'):'';
				// console.log(this.lat);
			}
			);
		}
		//(this.viewer = viewer)
		);
		
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

	// ngAfterViewInit(){
	// 	this.entityInfosSubscription =  this.entityHandler.currentEntityInfos.subscribe((infos)=>(this.entityInfos = infos));
	// }

	ngOnDestroy() {
		this.viewerSubscription.unsubscribe();
	}

	// setClickedEntityInfos(){
	//  	if(this.viewer) this.entityInfos = this.entityHandler.getClickedEntityInfos(this.viewer);
	// 	console.log(this.entityInfos);
	// }

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
}
