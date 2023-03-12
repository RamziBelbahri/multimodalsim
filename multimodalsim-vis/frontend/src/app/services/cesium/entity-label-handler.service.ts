/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Cartesian2, Viewer } from 'cesium';
import { PassengerPositionHandlerService } from './passenger-position-handler.service';

@Injectable({
	providedIn: 'root',
})
export class EntityLabelHandlerService {
	private currentMousePosition: Cartesian2 | undefined;
	private lastEntities = new Array<any>();
	private displayedEntity = undefined;

	constructor(private passengerHandler: PassengerPositionHandlerService) {}

	// Active le handler qui s'occupe d'afficher le texte
	initHandler(viewer: Viewer): void {
		viewer.scene.preRender.addEventListener(() => {
			if (this.currentMousePosition) {
				const pickedObject = viewer.scene.pick(this.currentMousePosition);

				if (pickedObject) {
					const entity = pickedObject.id;

					if (entity.label) {
						entity.label.text = new Cesium.ConstantProperty(this.createText(entity));
						this.lastEntities.push(entity);
					}
				} else if (this.lastEntities.length > 0) {
					this.lastEntities.forEach((element: any) => {
						element.label.text = new Cesium.ConstantProperty('');
					});
				}
			}
		});

		const mouseHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

		// Modifie la position de souris pour pouvoir pick une entité
		mouseHandler.setInputAction((movement: any) => {
			this.currentMousePosition = movement.endPosition;
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}

	// Créé une string avec le nombre de passagers selon l'entité
	private createText(entity: any): string {
		let amount = 0;

		if (entity.name == 'passenger') {
			amount = this.passengerHandler.getPassengerAmount(entity.id);
		} else if (entity.name == 'bus') {
			// TODO get le nombre dans un bus
			amount = 2;
		}

		return amount > 0 ? '{' + amount.toString() + '}' : '';
	}

	// /**
//  * NgModule definition for the Sidebar component.
//  */
// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { EntityInfosComponent } from './entity-infos/entity-infos.component';
// import { SidebarComponent } from './sidebar.component';


// @NgModule({
//     imports: [BrowserModule],
//     exports: [SidebarComponent],
//     declarations: [SidebarComponent, EntityInfosComponent],
//     providers: [],
//  })
 
// export declare class SidebarModule {
// }

	findClickedEntity (viewer: Viewer): void{
		viewer.scene.preRender.addEventListener(() => {
			if (this.currentMousePosition) {
				const pickedObject = viewer.scene.pick(this.currentMousePosition);

				if (pickedObject) this.displayedEntity = pickedObject.id;
			}
		});

		const mouseHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

		// Modifie la position de souris pour pouvoir pick une entité
		mouseHandler.setInputAction((movement: any) => {
			this.currentMousePosition = movement.endPosition;
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}

}
