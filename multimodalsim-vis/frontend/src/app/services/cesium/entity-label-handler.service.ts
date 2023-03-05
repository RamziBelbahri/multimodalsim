/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Cartesian2, Viewer } from 'cesium';
import { StopPositionHandlerService } from './stop-position-handler.service';
import { VehiclePositionHandlerService } from './vehicle-position-handler.service';

@Injectable({
	providedIn: 'root',
})
export class EntityLabelHandlerService {
	private currentMousePosition: Cartesian2 | undefined;
	private lastEntities = new Array<any>();

	constructor(private stopHandler: StopPositionHandlerService, private vehicleHandler: VehiclePositionHandlerService) {}

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
}
