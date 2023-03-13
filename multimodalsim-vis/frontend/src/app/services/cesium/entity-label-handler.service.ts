/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Cartesian2, Viewer } from 'cesium';
import { ReplaySubject } from 'rxjs';
import { EntityInfos } from 'src/app/classes/data-classes/entity-info';
import { CesiumClass } from 'src/app/shared/cesium-class';
import { StopPositionHandlerService } from './stop-position-handler.service';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';

@Injectable({
	providedIn: 'root',
})
export class EntityLabelHandlerService {
	private currentMousePosition: Cartesian2 | undefined;
	private lastEntities = new Array<any>();
	private displayedEntityInfosSource = new ReplaySubject<EntityInfos>();

	displayedEntityInfos: EntityInfos | undefined;
	currentEntityInfos = this.displayedEntityInfosSource.asObservable();

	constructor(private stopHandler: StopPositionHandlerService, private vehicleHandler: VehiclePositionHandlerService) {
		this.lastEntities = new Array<any>();
	}

	// Active le handler qui s'occupe d'afficher le texte
	/*	initHandler(viewer: Viewer): void {
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
	}*/

	findClickedEntityId(viewer: Viewer) {
		viewer.scene.preRender.addEventListener(() => {
			// event.preventDefault();
			let displayedEntity: any;
			if (this.currentMousePosition) {
				const pickedObject = viewer.scene.pick(this.currentMousePosition);

				if (pickedObject) {
					displayedEntity = pickedObject.id;

					if (displayedEntity.position) {
						this.displayedEntityInfos = this.getClickedEntityInfos(displayedEntity);
						this.setEntityInfos();
					}
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
	getClickedEntityInfos(displayedEntity: any): EntityInfos {
		const entity: any | undefined = displayedEntity;
		//const entityInfos = new Map<string, any>();
		let position = CesiumClass.cartesian3(0, 0, 0);
		let passengers: Array<string> | undefined = [];

		if (entity.name == 'stop') {
			position = CesiumClass.cartesian3(entity.position['_value'].x, entity.position['_value'].y, entity.position['_value'].z);
			passengers = this.stopHandler.getStopIdMapping().get(entity.id)?.getPassengers();
		} else if (entity.name == 'vehicle') {
			position = entity.position['_property']['_interpolationResult'];
			passengers = this.vehicleHandler.getVehicleIdMapping().get(entity.id)?.getOnBoardPassengers();
			/*entityInfos.set('position', entity.position['_property']['_interpolationResult']);
			entityInfos.set('passengerAmount', this.vehicleHandler.getPassengerAmount(entity.id));
			entityInfos.set('passengerList', this.vehicleHandler.getVehicleIdMapping().get(entity.id)?.getOnBoardPassengers());*/
		}

		return new EntityInfos(passengers ? passengers : [], position, entity.name, entity.id);
	}

	setEntityInfos(): void {
		this.displayedEntityInfosSource.next(this.displayedEntityInfos as EntityInfos);
	}
}
