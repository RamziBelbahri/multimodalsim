/* eslint-disable @typescript-eslint/no-explicit-any */
import { DomElementSchemaRegistry } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { Cartesian2, Viewer } from 'cesium';
import { Dictionary } from 'lodash';
import { Observable, ReplaySubject } from 'rxjs';
import { StopPositionHandlerService } from './stop-position-handler.service';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';

@Injectable({
	providedIn: 'root',
})
export class EntityLabelHandlerService {
	private currentMousePosition: Cartesian2 | undefined;
	private lastEntities = new Array<any>();
	displayedEntityInfos = new Map <string, any>();
	private displayedEntityInfosSource = new ReplaySubject<Map<string, any>>;
	currentEntityInfos = this.displayedEntityInfosSource.asObservable();


	constructor(private stopHandler: StopPositionHandlerService, private vehicleHandler: VehiclePositionHandlerService) {
		this.lastEntities = new Array<any>();
	}

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

		if (entity.name == 'stop') {
			amount = this.stopHandler.getPassengerAmount(entity.id);
		} else if (entity.name == 'vehicle') {
			amount = this.vehicleHandler.getPassengerAmount(entity.id);
		}

		return amount > 0 ? '{' + amount.toString() + '}' : '';
	}

	findClickedEntityId (viewer: Viewer) {
		viewer.scene.preRender.addEventListener(() => {
			// event.preventDefault();
			let displayedEntity:any;
			if (this.currentMousePosition) {
				const pickedObject = viewer.scene.pick(this.currentMousePosition);

				if (pickedObject) displayedEntity = pickedObject.id;

				console.log('ssaa');
				

				if (displayedEntity.position) {
					this.displayedEntityInfos = this.getClickedEntityInfos(displayedEntity);
					this.setEntityInfos();
				}
			}
		});

		const mouseHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

		// Modifie la position de souris pour pouvoir pick une entité
		mouseHandler.setInputAction((movement: any) => {
			this.currentMousePosition = movement.endPosition;
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	}

	// Obtenir le nombre de passagers dans un véhicule
	getClickedEntityInfos(displayedEntity: any): Map<string, any> {
		const entity: any | undefined = displayedEntity;

		const entityInfos = new Map<string, any>();
		entityInfos.set('position', entity.position);
		if (entity.name == 'vehicle') {
			entityInfos.set('passengerAmount', this.vehicleHandler.getPassengerAmount(entity.id));
		}
		console.log(entityInfos);
		return entityInfos;
	}

	setEntityInfos():void{
		this.displayedEntityInfosSource.next(this.displayedEntityInfos);
	}
}
