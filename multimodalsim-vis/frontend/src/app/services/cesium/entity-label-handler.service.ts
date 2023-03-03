/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Cartesian2, Viewer } from 'cesium';
import { PassengerPositionHandlerService } from './passenger-position-handler.service';

@Injectable({
	providedIn: 'root',
})
export class EntityLabelHandlerService {
	private currentMousePosition: Cartesian2 | undefined;
	private lastEntity: any;

	constructor(private passengerHandler: PassengerPositionHandlerService) {}

	initHandler(viewer: Viewer): void {
		viewer.scene.preRender.addEventListener(() => {
			if (this.currentMousePosition) {
				const pickedObject = viewer.scene.pick(this.currentMousePosition);

				if (pickedObject) {
					const entity = pickedObject.id;

					if (entity.label) {
						entity.label.text = new Cesium.ConstantProperty('{' + this.createText(entity) + '}');
						this.lastEntity = entity;
					}
				} else if (this.lastEntity) {
					this.lastEntity.label.text = new Cesium.ConstantProperty('');
				}
			}
		});

		const mouseHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

		mouseHandler.setInputAction((movement: any) => {
			this.currentMousePosition = movement.endPosition;
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}

	private createText(entity: any): string {
		let amount = 0;
		console.log(entity);

		if (entity.name == 'passenger') {
			amount = this.passengerHandler.getPassengerAmount(entity.id);
		} else if (entity.name == 'bus') {
			// TODO get le nombre dans un bus
			amount = 2;
		}

		return amount > 0 ? amount.toString() : '';
	}
}
